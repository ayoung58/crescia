import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedDbUser } from "@/lib/sessions/auth";

export async function POST(request: NextRequest) {
  let body: { sessionId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Session ID is required." },
      { status: 400 }
    );
  }

  const authResult = await getAuthenticatedDbUser();
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: 401 }
    );
  }

  const { user, supabase } = authResult;

  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("id, status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { success: false, error: "Failed to load session." },
      { status: 500 }
    );
  }

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found." },
      { status: 404 }
    );
  }

  if (session.status === "completed" || session.status === "abandoned") {
    return NextResponse.json({ success: true });
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
    return NextResponse.json(
      { success: false, error: "Failed to end session." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
