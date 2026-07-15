const SUPABASE_URL = "https://rveunrzbeynaizitqanx.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function test() {
  // Get one record
  const res = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?select=id,title&limit=1`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  const data = await res.json();
  console.log("Record:", data[0]);

  // Try PATCH with just deadline
  const id = data[0].id;
  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({ deadline: "2027-06-30" })
  });
  console.log("Status:", patchRes.status);
  const body = await patchRes.text();
  console.log("Response:", body);
}

test().catch(e => console.error(e));
