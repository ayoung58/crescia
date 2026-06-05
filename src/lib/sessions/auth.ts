// Resolves the authenticated Clerk user to their Supabase users row.

import { auth } from "@clerk/nextjs/server";

import { createClient } from "@/lib/supabase/server";

interface AuthenticatedDbUserRow {
  id: string;
}

export type AuthenticatedDbUserResult =
  | { user: AuthenticatedDbUserRow; supabase: Awaited<ReturnType<typeof createClient>> }
  | { error: string };

/**
 * Loads the Supabase user row for the current Clerk session.
 */
export async function getAuthenticatedDbUser(): Promise<AuthenticatedDbUserResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not signed in." };
  }

  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !user) {
    return { error: "Could not load your profile." };
  }

  return { user, supabase };
}
