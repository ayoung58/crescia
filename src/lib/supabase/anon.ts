// Supabase anon client for unauthenticated reads (e.g. username availability).

import { createClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

/**
 * Creates a Supabase client with the anon key (no user session).
 */
export function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
