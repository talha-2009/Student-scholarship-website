# Google Gemini AI Integration Setup Guide

This guide explains how to set up Google Gemini API integration with your Supabase backend to automatically generate AI-powered content for opportunities.

## Overview

The integration uses Google Gemini 2.0 Flash API to automatically generate:
- Professional descriptions
- SEO-optimized titles
- SEO meta descriptions
- Relevant tags

When a new opportunity is created, the Edge Function calls Gemini API to generate this content and saves it back to the database.

## Prerequisites

- A Google Cloud project with Gemini API enabled
- A Supabase project
- Node.js installed (for local development)

## Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy the generated API key (starts with `AIza...`)

## Step 2: Add Gemini API Key to Supabase Secrets

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Add the Gemini API key as a secret
supabase secrets set GEMINI_API_KEY=your_actual_api_key_here
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Settings → Edge Functions
3. Scroll to "Environment Variables"
4. Add a new secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your actual API key from Step 1
5. Click "Save"

### Required Secrets

Make sure the following secrets are configured in your Supabase project:

- `GEMINI_API_KEY` - Your Google Gemini API key
- `SUPABASE_URL` - Your Supabase project URL (auto-configured)
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (auto-configured)

## Step 3: Run Database Migrations

### Using Supabase CLI

```bash
# Apply all migrations
supabase db push

# Or apply specific migrations
supabase migration up
```

### Using Supabase Dashboard SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:

**Migration 1: Add AI Content Columns**
```sql
-- Copy contents from: supabase/migrations/002_add_ai_content_columns.sql
```

**Migration 2: Add AI Trigger Function**
```sql
-- Copy contents from: supabase/migrations/003_add_ai_trigger_function.sql
```

## Step 4: Deploy Edge Function

### Using Supabase CLI

```bash
# Deploy the Edge Function
supabase functions deploy generate-ai-content
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Click "New Function"
4. Function name: `generate-ai-content`
5. Copy the contents from `supabase/functions/generate-ai-content/index.ts`
6. Click "Deploy"

## Step 5: Verify the Setup

### Test the Edge Function

```bash
# Test the function with a sample opportunity ID
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-ai-content' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"opportunityId": "YOUR_OPPORTUNITY_ID"}'
```

### Check Database Columns

Verify the new columns were added to the `opportunities` table:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
AND column_name IN (
  'ai_generated_description',
  'seo_title',
  'seo_description',
  'tags',
  'ai_content_generated_at',
  'is_ai_content_generated'
);
```

## Usage

### From Frontend JavaScript

```javascript
// Generate AI content for an opportunity
const opportunityId = 'uuid-of-opportunity';
const result = await window.OpportunityNest.generateAIContent(opportunityId);

console.log('AI content generated:', result);
```

### From Backend/Server

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const { data, error } = await supabase.functions.invoke('generate-ai-content', {
  body: { opportunityId: 'uuid-of-opportunity' }
})
```

### Manual Trigger via SQL

```sql
-- Mark an opportunity for AI content generation
SELECT public.trigger_ai_content_generation('opportunity-uuid');
```

## How It Works

1. **New Opportunity Created**: When a new opportunity is inserted into the database
2. **Trigger Function**: The `trigger_ai_content_generation` function logs the request
3. **Edge Function Called**: The Edge Function `generate-ai-content` is invoked
4. **Gemini API Request**: The function sends opportunity details to Gemini 2.0 Flash
5. **Content Generation**: Gemini generates description, SEO title, SEO description, and tags
6. **Database Update**: The generated content is saved back to the opportunities table
7. **Flag Set**: `is_ai_content_generated` is set to `true` to prevent re-generation

## Features

### No Overwrite Protection

The system checks if AI content was already generated before attempting to generate new content. This prevents overwriting manually edited content.

```sql
-- Check if AI content was generated
SELECT is_ai_content_generated, ai_content_generated_at 
FROM opportunities 
WHERE id = 'opportunity-uuid';
```

### Error Handling

- Comprehensive error logging in the Edge Function
- Database logs track generation status (pending, processing, completed, failed)
- Graceful failure if Gemini API is unavailable

### Cost Optimization

- Uses Gemini 2.0 Flash (low cost, fast responses)
- Only generates content when explicitly triggered
- Prevents duplicate generation with flag check

## Files Modified

### Database Migrations
1. `supabase/migrations/002_add_ai_content_columns.sql` - Adds AI content columns
2. `supabase/migrations/003_add_ai_trigger_function.sql` - Adds trigger function and logs table

### Edge Functions
1. `supabase/functions/generate-ai-content/index.ts` - Main AI generation logic

### Frontend
1. `utils.js` - Added `generateAIContent()` helper function

## Database Schema Changes

### New Columns in `opportunities` Table

| Column | Type | Description |
|--------|------|-------------|
| `ai_generated_description` | text | AI-generated professional description |
| `seo_title` | text | AI-generated SEO-optimized title |
| `seo_description` | text | AI-generated SEO meta description |
| `tags` | text[] | AI-generated relevant tags |
| `ai_content_generated_at` | timestamptz | Timestamp of AI generation |
| `is_ai_content_generated` | boolean | Flag indicating AI content status |

### New Table: `ai_generation_logs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `opportunity_id` | uuid | Foreign key to opportunities |
| `status` | text | Status: pending, processing, completed, failed |
| `error_message` | text | Error details if failed |
| `triggered_at` | timestamptz | When generation was triggered |
| `completed_at` | timestamptz | When generation completed |
| `updated_at` | timestamptz | Last update timestamp |

## Troubleshooting

### Edge Function Not Deploying

```bash
# Check Supabase CLI status
supabase status

# Check function logs
supabase functions logs generate-ai-content
```

### Gemini API Key Not Working

- Verify the API key is correct in Supabase secrets
- Check that Gemini API is enabled in your Google Cloud project
- Ensure you have billing enabled (Gemini API requires billing)

### Content Not Being Generated

1. Check the `ai_generation_logs` table for errors:
```sql
SELECT * FROM ai_generation_logs ORDER BY triggered_at DESC LIMIT 10;
```

2. Check Edge Function logs in Supabase Dashboard

3. Verify the opportunity exists and has required fields

### Permission Errors

Ensure your service role key has proper permissions:
- Read/write access to `opportunities` table
- Read/write access to `ai_generation_logs` table

## Cost Considerations

- Gemini 2.0 Flash pricing: ~$0.075 per 1M characters (input) and ~$0.30 per 1M characters (output)
- Typical generation uses ~500-1000 tokens per opportunity
- Estimate: ~$0.0001 - $0.0003 per opportunity
- 1000 opportunities: ~$0.10 - $0.30

## Security Notes

- **Never commit API keys** to version control
- Use Supabase secrets for sensitive data
- The Edge Function uses service role key for database operations
- RLS policies restrict access to AI generation logs

## Next Steps

1. Test the integration with a sample opportunity
2. Monitor costs in Google Cloud Console
3. Review generated content quality
4. Adjust prompts in Edge Function if needed
5. Consider adding rate limiting for production use

## Support

For issues with:
- **Gemini API**: [Google AI Studio Documentation](https://ai.google.dev/docs)
- **Supabase Edge Functions**: [Supabase Docs](https://supabase.com/docs/guides/functions)
- **This Integration**: Check the Edge Function logs and database logs

## License

This integration is part of the OpportunityNest project.
