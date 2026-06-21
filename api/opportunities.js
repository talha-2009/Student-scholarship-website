const TABLE_NAME = "opportunities";
const ALLOWED_FIELDS = [
  "type",
  "funding",
  "title",
  "country",
  "level",
  "field",
  "deadline",
  "description",
  "link"
];

const send = (response, status, payload) => {
  response.status(status).json(payload);
};

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  return {
    baseUrl: `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${TABLE_NAME}`,
    serviceRoleKey
  };
};

const requireAdminPassword = (request) => {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers["x-admin-password"];

  if (!expectedPassword) {
    throw new Error("Missing ADMIN_PASSWORD environment variable.");
  }

  if (!providedPassword || providedPassword !== expectedPassword) {
    const error = new Error("Invalid admin password.");
    error.statusCode = 401;
    throw error;
  }
};

const supabaseRequest = async (path = "", options = {}) => {
  const { baseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.error || "Supabase request failed.";
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return payload;
};

const cleanOpportunityPayload = (body = {}) => {
  const payload = {};

  for (const field of ALLOWED_FIELDS) {
    const value = body[field];
    payload[field] = typeof value === "string" ? value.trim() : value;
  }

  for (const field of ["type", "title", "country", "deadline", "description", "link"]) {
    if (!payload[field]) {
      const error = new Error(`Missing required field: ${field}`);
      error.statusCode = 400;
      throw error;
    }
  }

  return payload;
};

module.exports = async function handler(request, response) {
  try {
    requireAdminPassword(request);

    if (request.method === "GET") {
      const data = await supabaseRequest("?select=*&order=deadline.asc");
      send(response, 200, { data });
      return;
    }

    if (request.method === "POST") {
      const payload = cleanOpportunityPayload(request.body);
      const data = await supabaseRequest("", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      send(response, 201, { data });
      return;
    }

    if (request.method === "DELETE") {
      const id = request.query.id;
      if (!id) {
        send(response, 400, { error: "Missing opportunity id." });
        return;
      }
      const data = await supabaseRequest(`?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      send(response, 200, { data });
      return;
    }

    response.setHeader("Allow", "GET, POST, DELETE");
    send(response, 405, { error: "Method not allowed." });
  } catch (error) {
    send(response, error.statusCode || 500, { error: error.message || "Unexpected server error." });
  }
};
