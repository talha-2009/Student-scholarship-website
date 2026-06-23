import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Opportunity {
  id: string
  type: string
  title: string
  country: string
  level?: string
  field?: string
  funding?: string
  deadline?: string
  description: string
  link: string
  is_ai_content_generated?: boolean
}

interface GeminiRequest {
  contents: Array<{
    role: string
    parts: Array<{ text: string }>
  }>
  generationConfig: {
    temperature: number
    topK: number
    topP: number
    maxOutputTokens: number
  }
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>
    }
  }>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { opportunityId }: { opportunityId: string } = await req.json()

    if (!opportunityId) {
      throw new Error('opportunityId is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch the opportunity
    const { data: opportunity, error: fetchError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single()

    if (fetchError || !opportunity) {
      console.error('Error fetching opportunity:', fetchError)
      throw new Error('Opportunity not found')
    }

    // Check if AI content was already generated (don't overwrite manual edits)
    if (opportunity.is_ai_content_generated) {
      console.log(`AI content already generated for opportunity ${opportunityId}, skipping`)
      return new Response(
        JSON.stringify({ message: 'AI content already generated', opportunity }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Prepare prompt for Gemini API
    const prompt = `You are an expert content writer for an opportunity discovery platform called OpportunityNest. 
Generate professional, SEO-optimized content for the following opportunity:

Type: ${opportunity.type}
Title: ${opportunity.title}
Country: ${opportunity.country}
Level: ${opportunity.level || 'Not specified'}
Field: ${opportunity.field || 'Not specified'}
Funding: ${opportunity.funding || 'Not specified'}
Deadline: ${opportunity.deadline || 'Not specified'}
Current Description: ${opportunity.description}

Please generate the following in JSON format:
{
  "ai_generated_description": "A professional, engaging description (150-200 words) that highlights key benefits, eligibility, and application details",
  "seo_title": "An SEO-optimized title (50-60 characters) that includes the opportunity type, country, and key benefit",
  "seo_description": "An SEO meta description (150-160 characters) that encourages clicks while accurately describing the opportunity",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"] (relevant tags for categorization, e.g., funding type, field, country, level)
}

Ensure the content is:
- Professional and engaging
- SEO-optimized with relevant keywords
- Accurate and based on the provided information
- Free of grammatical errors
- Suitable for a global student audience

Return ONLY the JSON, no additional text.`

    // Call Gemini 2.5 Flash API
    const geminiRequest: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiRequest)
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`)
    }

    const geminiData: GeminiResponse = await geminiResponse.json()
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from Gemini API')
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text
    
    // Parse the JSON response
    let aiContent
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiContent = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not extract JSON from Gemini response')
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', generatedText)
      throw new Error('Failed to parse AI-generated content')
    }

    // Update the opportunity with AI-generated content
    const { error: updateError } = await supabase
      .from('opportunities')
      .update({
        ai_generated_description: aiContent.ai_generated_description,
        seo_title: aiContent.seo_title,
        seo_description: aiContent.seo_description,
        tags: aiContent.tags,
        ai_content_generated_at: new Date().toISOString(),
        is_ai_content_generated: true
      })
      .eq('id', opportunityId)

    if (updateError) {
      console.error('Error updating opportunity:', updateError)
      throw new Error('Failed to update opportunity with AI content')
    }

    console.log(`Successfully generated AI content for opportunity ${opportunityId}`)

    return new Response(
      JSON.stringify({ 
        message: 'AI content generated successfully',
        opportunity: { ...opportunity, ...aiContent }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in generate-ai-content function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
