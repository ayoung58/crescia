import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedDbUser } from "@/lib/sessions/auth";
import { SUBJECT_SLUGS, type SessionMode, type SubjectSlug } from "@/types";

const SESSION_MODES: SessionMode[] = ["practice_questions", "practice_exam"];

function isSubjectSlug(value: string): value is SubjectSlug {
  return (SUBJECT_SLUGS as readonly string[]).includes(value);
}

function isSessionMode(value: string): value is SessionMode {
  return (SESSION_MODES as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  let body: {
    subject?: string;
    mode?: string;
    timed?: boolean;
    stopwatch?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const subject = body.subject ?? "";
  const mode = body.mode ?? "";

  if (!isSubjectSlug(subject)) {
    return NextResponse.json(
      { success: false, error: "Invalid subject." },
      { status: 400 }
    );
  }

  if (!isSessionMode(mode)) {
    return NextResponse.json(
      { success: false, error: "Invalid session mode." },
      { status: 400 }
    );
  }

  const timed = Boolean(body.timed);

  const authResult = await getAuthenticatedDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: 401 }
    );
  }

  const { user, supabase } = authResult;

  const { data: enrollment } = await supabase
    .from("user_subjects")
    .select("id")
    .eq("user_id", user.id)
    .eq("subject_slug", subject)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json(
      { success: false, error: "You are not enrolled in this subject." },
      { status: 403 }
    );
  }

  const { data: session, error: insertError } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      subject_slug: subject,
      mode,
      timed,
      status: "active",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !session) {
    return NextResponse.json(
      { success: false, error: "Failed to start session." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, sessionId: session.id });
}
