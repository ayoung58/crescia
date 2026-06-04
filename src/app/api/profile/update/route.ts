import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { validateUsernameFormat } from "@/lib/onboarding/username";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Not signed in." },
      { status: 401 }
    );
  }

  let body: {
    firstName?: string;
    lastName?: string;
    username?: string;
    emailNotifications?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const username = (body.username ?? "").trim();
  const format = validateUsernameFormat(username);
  if (!format.valid) {
    return NextResponse.json({
      success: false,
      error: format.message ?? "Invalid username.",
    });
  }

  const supabase = await createClient();

  const { data: currentUser, error: fetchError } = await supabase
    .from("users")
    .select("id, username")
    .eq("clerk_user_id", userId)
    .single();

  if (fetchError || !currentUser) {
    return NextResponse.json(
      { success: false, error: "Could not load your profile." },
      { status: 500 }
    );
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUser && existingUser.id !== currentUser.id) {
    return NextResponse.json({
      success: false,
      error: "That username is already taken.",
    });
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
    .eq("id", currentUser.id);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: "Failed to update profile." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
