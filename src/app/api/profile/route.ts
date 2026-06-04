import { NextResponse } from "next/server";
import { getProfileForCurrentUser } from "@/lib/profile/get-profile";

export async function GET() {
  const result = await getProfileForCurrentUser();

  if ("error" in result) {
    const status = result.error === "Not signed in." ? 401 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    user: result.user,
    subjects: result.subjects,
  });
}
