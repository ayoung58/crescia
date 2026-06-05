// Onboarding completion logic: saves profile fields and subject enrollments.

import { auth } from "@clerk/nextjs/server";

import { validateUsernameFormat } from "@/lib/onboarding/username";
import { createClient } from "@/lib/supabase/server";
import { isSubjectSlug } from "@/lib/validators/subject-slug";
import type { SubjectSlug } from "@/types";

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

interface CurrentUserRow {
  id: string;
  username: string | null;
  onboarding_complete: boolean;
}

/**
 * Validates and persists onboarding data for the signed-in user.
 */
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

  const typedCurrentUser = currentUser as CurrentUserRow;

  if (existingUser && existingUser.id !== typedCurrentUser.id) {
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
    .eq("id", typedCurrentUser.id);

  if (updateError) {
    return { success: false, error: "Failed to save your profile." };
  }

  const rows = subjects.map((subject_slug) => ({
    user_id: typedCurrentUser.id,
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
        username: typedCurrentUser.username,
      })
      .eq("id", typedCurrentUser.id);

    return { success: false, error: "Failed to save your subjects." };
  }

  return { success: true };
}
