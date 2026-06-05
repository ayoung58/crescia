// Server-side profile loader for the current Clerk user.

import { auth } from "@clerk/nextjs/server";

import { createClient } from "@/lib/supabase/server";
import { isSubjectSlug } from "@/lib/validators/subject-slug";
import type { DbUser, SubjectSlug } from "@/types";

interface UserSubjectRow {
  subject_slug: string;
}

export type GetProfileResult =
  | { user: DbUser; subjects: SubjectSlug[] }
  | { error: string };

/**
 * Fetches the current user's profile and enrolled subjects from Supabase.
 */
export async function getProfileForCurrentUser(): Promise<GetProfileResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not signed in." };
  }

  const supabase = await createClient();
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (userError || !userRow) {
    return { error: "Could not load profile." };
  }

  const user: DbUser = userRow;

  const { data: subjectRows, error: subjectsError } = await supabase
    .from("user_subjects")
    .select("subject_slug")
    .eq("user_id", user.id);

  if (subjectsError) {
    return { error: "Could not load subjects." };
  }

  const subjects = (subjectRows ?? [])
    .map((row: UserSubjectRow) => row.subject_slug)
    .filter((slug): slug is SubjectSlug => isSubjectSlug(slug));

  return { user, subjects };
}
