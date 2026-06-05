// Supabase service-role client for webhook and admin operations (bypasses RLS).

import { createClient } from "@supabase/supabase-js";

import {
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "@/lib/config";

/**
 * Creates a Supabase admin client using the service role key.
 */
export function createAdminClient(): ReturnType<typeof createClient> {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
