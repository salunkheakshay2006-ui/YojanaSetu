/**
 * Supabase client singleton for browser-side use.
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from environment
 * variables (set in frontend/.env).
 *
 * SECURITY: Only the anon (public) key is used here.
 * Never place a service_role key in frontend code.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[YojanaSetu] Missing Supabase configuration.\n" +
      "Please create frontend/.env with:\n" +
      "  VITE_SUPABASE_URL=https://your-project.supabase.co\n" +
      "  VITE_SUPABASE_ANON_KEY=your_anon_key\n" +
      "Then restart the dev server."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
