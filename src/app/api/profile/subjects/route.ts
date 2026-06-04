import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { SUBJECT_SLUGS, type SubjectSlug } from "@/types";

function isSubjectSlug(value: string): value is SubjectSlug {
  return (SUBJECT_SLUGS as readonly string[]).includes(value);
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Not signed in." },
      { status: 401 }
    );
  }

  let body: { subjects?: string[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const raw = body.subjects ?? [];
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json(
      { error: "You must be enrolled in at least one subject." },
      { status: 400 }
    );
  }

  const subjects = raw.filter(isSubjectSlug);
  if (subjects.length === 0) {
    return NextResponse.json(
      { error: "You must be enrolled in at least one subject." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: currentUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (fetchError || !currentUser) {
    return NextResponse.json(
      { success: false, error: "Could not load your profile." },
      { status: 500 }
    );
  }

  const { error: deleteError } = await supabase
    .from("user_subjects")
    .delete()
    .eq("user_id", currentUser.id);

  if (deleteError) {
    return NextResponse.json(
      { success: false, error: "Failed to update subjects." },
      { status: 500 }
    );
  }

  const rows = subjects.map((subject_slug) => ({
    user_id: currentUser.id,
    subject_slug,
  }));

  const { error: insertError } = await supabase
    .from("user_subjects")
    .insert(rows);

  if (insertError) {
    return NextResponse.json(
      { success: false, error: "Failed to update subjects." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
