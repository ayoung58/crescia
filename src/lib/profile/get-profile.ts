import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { SUBJECT_SLUGS, type DbUser, type SubjectSlug } from "@/types";

function isSubjectSlug(value: string): value is SubjectSlug {
  return (SUBJECT_SLUGS as readonly string[]).includes(value);
}

export type GetProfileResult =
  | { user: DbUser; subjects: SubjectSlug[] }
  | { error: string };

export async function getProfileForCurrentUser(): Promise<GetProfileResult> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not signed in." };
  }

  const supabase = await createClient();
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (userError || !user) {
    return { error: "Could not load profile." };
  }

  const { data: subjectRows, error: subjectsError } = await supabase
    .from("user_subjects")
    .select("subject_slug")
    .eq("user_id", user.id);

  if (subjectsError) {
    return { error: "Could not load subjects." };
  }

  const subjects = (subjectRows ?? [])
    .map((row) => row.subject_slug)
    .filter((slug): slug is SubjectSlug => isSubjectSlug(slug));

  return { user: user as DbUser, subjects };
}
