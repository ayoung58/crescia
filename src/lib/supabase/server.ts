// Supabase server client with Clerk JWT for RLS-scoped queries.

import { createServerClient } from "@supabase/ssr";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

/**
 * Creates a Supabase client authenticated with the current Clerk session JWT.
 */
export async function createClient(): Promise<
  ReturnType<typeof createServerClient>
> {
  const cookieStore = await cookies();
  const { getToken } = await auth();
  const supabaseToken = await getToken({ template: "supabase" });

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component — cookie writes may be ignored
        }
      },
    },
    global: {
      headers: supabaseToken
        ? { Authorization: `Bearer ${supabaseToken}` }
        : {},
    },
  });
}
