// POST /api/sessions/end — marks an active session as abandoned.

import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthenticatedDbUser } from "@/lib/sessions/auth";
import type { SessionStatus } from "@/types";

interface SessionEndBody {
  sessionId?: string;
}

interface SessionRow {
  id: string;
  status: SessionStatus;
}

/**
 * Ends an active study session by setting status to abandoned.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    let body: SessionEndBody;

    try {
      body = (await request.json()) as SessionEndBody;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const sessionId = body.sessionId?.trim();
    if (!sessionId) {
      return jsonError("Session ID is required.", 400);
    }

    const authResult = await getAuthenticatedDbUser();
    if ("error" in authResult) {
      return jsonError(authResult.error, 401);
    }

    const { user, supabase } = authResult;

    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("id, status")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("POST /api/sessions/end fetch failed:", fetchError);
      return jsonError("Failed to load session.", 500);
    }

    if (!session) {
      return jsonError("Session not found.", 404);
    }

    const typedSession = session as SessionRow;

    if (
      typedSession.status === "completed" ||
      typedSession.status === "abandoned"
    ) {
      return jsonSuccess(null);
    }

    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        status: "abandoned",
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("POST /api/sessions/end update failed:", updateError);
      return jsonError("Failed to end session.", 500);
    }

    return jsonSuccess(null);
  } catch (err) {
    console.error("POST /api/sessions/end failed:", err);
    return jsonError("An unexpected error occurred.", 500);
  }
}
