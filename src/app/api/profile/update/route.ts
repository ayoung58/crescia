// POST /api/profile/update — updates profile fields for the authenticated user.

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/api/response";
import { validateUsernameFormat } from "@/lib/onboarding/username";
import { createClient } from "@/lib/supabase/server";

interface ProfileUpdateBody {
  firstName?: string;
  lastName?: string;
  username?: string;
  emailNotifications?: boolean;
}

interface CurrentUserRow {
  id: string;
  username: string | null;
}

/**
 * Updates name, username, and notification preferences for the signed-in user.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return jsonError("Not signed in.", 401);
    }

    let body: ProfileUpdateBody;

    try {
      body = (await request.json()) as ProfileUpdateBody;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const username = (body.username ?? "").trim();
    const format = validateUsernameFormat(username);
    if (!format.valid) {
      return jsonError(format.message ?? "Invalid username.", 400);
    }

    const supabase = await createClient();

    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("id, username")
      .eq("clerk_user_id", userId)
      .single();

    if (fetchError || !currentUser) {
      console.error("POST /api/profile/update user fetch failed:", fetchError);
      return jsonError("Could not load your profile.", 500);
    }

    const typedUser = currentUser as CurrentUserRow;

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUser && existingUser.id !== typedUser.id) {
      return jsonError("That username is already taken.", 409, "USERNAME_TAKEN");
    }

    const firstName = (body.firstName ?? "").trim() || null;
    const lastName = (body.lastName ?? "").trim() || null;
    const emailNotifications = Boolean(body.emailNotifications);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        username,
        email_notifications: emailNotifications,
      })
      .eq("id", typedUser.id);

    if (updateError) {
      console.error("POST /api/profile/update failed:", updateError);
      return jsonError("Failed to update profile.", 500);
    }

    return jsonSuccess(null);
  } catch (err) {
    console.error("POST /api/profile/update failed:", err);
    return jsonError("An unexpected error occurred.", 500);
  }
}
