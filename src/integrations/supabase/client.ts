import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Publishable (anon) credentials — safe to ship to the browser.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://gbddogxlwsyklmtgocoh.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_YWAvT9EBmG46QcQalxy7Hg_e6K69v2A";

const isBrowser = typeof window !== "undefined";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: isBrowser
    ? {
        storage: window.localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    : {
        persistSession: false,
        autoRefreshToken: false,
      },
});
