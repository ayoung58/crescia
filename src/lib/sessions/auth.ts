import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedDbUser() {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not signed in." as const };
  }

  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !user) {
    return { error: "Could not load your profile." as const };
  }

  return { user, supabase };
}
