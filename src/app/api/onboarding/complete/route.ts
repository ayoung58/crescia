import { NextRequest, NextResponse } from "next/server";
import { completeOnboarding } from "@/lib/onboarding/complete-onboarding";
import type { SubjectSlug } from "@/types";

export async function POST(request: NextRequest) {
  let body: {
    firstName?: string;
    lastName?: string;
    username?: string;
    subjects?: SubjectSlug[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const result = await completeOnboarding({
    firstName: body.firstName ?? "",
    lastName: body.lastName ?? "",
    username: body.username ?? "",
    subjects: body.subjects ?? [],
  });

  const status = result.success ? 200 : 400;
  return NextResponse.json(result, { status });
}
