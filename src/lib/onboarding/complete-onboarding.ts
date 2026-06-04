import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { validateUsernameFormat } from "@/lib/onboarding/username";
import { SUBJECT_SLUGS, type SubjectSlug } from "@/types";

export interface CompleteOnboardingInput {
  firstName: string;
  lastName: string;
  username: string;
  subjects: SubjectSlug[];
}

export interface CompleteOnboardingResult {
  success: boolean;
  error?: string;
}

function isSubjectSlug(value: string): value is SubjectSlug {
  return (SUBJECT_SLUGS as readonly string[]).includes(value);
}

export async function completeOnboarding(
  input: CompleteOnboardingInput
): Promise<CompleteOnboardingResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Not signed in." };
  }

  const username = input.username.trim();
  const format = validateUsernameFormat(username);
  if (!format.valid) {
    return { success: false, error: format.message ?? "Invalid username." };
  }

  const subjects = input.subjects.filter(isSubjectSlug);
  if (subjects.length === 0) {
    return { success: false, error: "Select at least one subject." };
  }

  const supabase = await createClient();

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();

  const { data: currentUser, error: fetchError } = await supabase
    .from("users")
    .select("id, username, onboarding_complete")
    .eq("clerk_user_id", userId)
    .single();

  if (fetchError || !currentUser) {
    return { success: false, error: "Could not load your profile." };
  }

  if (
    existingUser &&
    existingUser.id !== currentUser.id
  ) {
    return { success: false, error: "That username is already taken." };
  }

  const firstName = input.firstName.trim() || null;
  const lastName = input.lastName.trim() || null;

  const { error: updateError } = await supabase
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
      username,
      onboarding_complete: true,
    })
    .eq("id", currentUser.id);

  if (updateError) {
    return { success: false, error: "Failed to save your profile." };
  }

  const rows = subjects.map((subject_slug) => ({
    user_id: currentUser.id,
    subject_slug,
  }));

  const { error: subjectsError } = await supabase
    .from("user_subjects")
    .insert(rows);

  if (subjectsError) {
    await supabase
      .from("users")
      .update({
        onboarding_complete: false,
        username: currentUser.username,
      })
      .eq("id", currentUser.id);

    return { success: false, error: "Failed to save your subjects." };
  }

  return { success: true };
}
