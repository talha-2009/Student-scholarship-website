module.exports = function handler(request, response) {
  response.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || "SUPABASE_URL",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "SUPABASE_ANON_KEY"
  });
};
