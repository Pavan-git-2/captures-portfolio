// ==========================================================
// SUPABASE CONFIG — fill these in after you create your
// Supabase project (see README.md, Step 1).
// ==========================================================
const SUPABASE_URL = "https://khbzsekqsietjzdrjfxg.supabase.co"; // e.g. https://xxxxxx.supabase.co
const SUPABASE_ANON_KEY = "sb_publishable_ZJmKfmcdHsNqWZ8ByjSSSw_RgAoGopz";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
