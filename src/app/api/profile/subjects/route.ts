// PUT /api/profile/subjects — replaces the user's enrolled subjects.

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { isSubjectSlug } from "@/lib/validators/subject-slug";

interface ProfileSubjectsBody {
  subjects?: string[];
}

interface CurrentUserRow {
  id: string;
}

/**
 * Updates the authenticated user's subject enrollments.
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return jsonError("Not signed in.", 401);
    }

    let body: ProfileSubjectsBody;

    try {
      body = (await request.json()) as ProfileSubjectsBody;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const raw = body.subjects ?? [];
    if (!Array.isArray(raw) || raw.length === 0) {
      return jsonError("You must be enrolled in at least one subject.", 400);
    }

    const subjects = raw.filter(isSubjectSlug);
    if (subjects.length === 0) {
      return jsonError("You must be enrolled in at least one subject.", 400);
    }

    const supabase = await createClient();

    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (fetchError || !currentUser) {
      console.error("PUT /api/profile/subjects user fetch failed:", fetchError);
      return jsonError("Could not load your profile.", 500);
    }

    const typedUser = currentUser as CurrentUserRow;

    const { error: deleteError } = await supabase
      .from("user_subjects")
      .delete()
      .eq("user_id", typedUser.id);

    if (deleteError) {
      console.error("PUT /api/profile/subjects delete failed:", deleteError);
      return jsonError("Failed to update subjects.", 500);
    }

    const rows = subjects.map((subject_slug) => ({
      user_id: typedUser.id,
      subject_slug,
    }));

    const { error: insertError } = await supabase
      .from("user_subjects")
      .insert(rows);

    if (insertError) {
      console.error("PUT /api/profile/subjects insert failed:", insertError);
      return jsonError("Failed to update subjects.", 500);
    }

    return jsonSuccess(null);
  } catch (err) {
    console.error("PUT /api/profile/subjects failed:", err);
    return jsonError("An unexpected error occurred.", 500);
  }
}
