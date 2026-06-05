// POST /api/sessions/start — creates an active study session for the user.

import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthenticatedDbUser } from "@/lib/sessions/auth";
import { isSessionMode } from "@/lib/validators/session-mode";
import { isSubjectSlug } from "@/lib/validators/subject-slug";

interface SessionStartBody {
  subject?: string;
  mode?: string;
  timed?: boolean;
  stopwatch?: boolean;
}

interface SessionInsertRow {
  id: string;
}

/**
 * Starts a new study session after validating subject enrollment.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    let body: SessionStartBody;

    try {
      body = (await request.json()) as SessionStartBody;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const subject = body.subject ?? "";
    const mode = body.mode ?? "";

    if (!isSubjectSlug(subject)) {
      return jsonError("Invalid subject.", 400);
    }

    if (!isSessionMode(mode)) {
      return jsonError("Invalid session mode.", 400);
    }

    const timed = Boolean(body.timed);

    const authResult = await getAuthenticatedDbUser();
    if ("error" in authResult) {
      return jsonError(authResult.error, 401);
    }

    const { user, supabase } = authResult;

    const { data: enrollment } = await supabase
      .from("user_subjects")
      .select("id")
      .eq("user_id", user.id)
      .eq("subject_slug", subject)
      .maybeSingle();

    if (!enrollment) {
      return jsonError("You are not enrolled in this subject.", 403);
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
      console.error("POST /api/sessions/start insert failed:", insertError);
      return jsonError("Failed to start session.", 500);
    }

    const typedSession = session as SessionInsertRow;

    return jsonSuccess({ sessionId: typedSession.id });
  } catch (err) {
    console.error("POST /api/sessions/start failed:", err);
    return jsonError("An unexpected error occurred.", 500);
  }
}
