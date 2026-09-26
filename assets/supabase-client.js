// ==========================================================
// SUPABASE CONFIG — fill these in after you create your
// Supabase project (see README.md, Step 1).
// ==========================================================
const SUPABASE_URL = "YOUR_SUPABASE_URL"; // e.g. https://xxxxxx.supabase.co
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
