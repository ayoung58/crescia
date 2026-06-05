// POST /api/onboarding/complete — persists onboarding data for a new user.

import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/api/response";
import { completeOnboarding } from "@/lib/onboarding/complete-onboarding";
import type { SubjectSlug } from "@/types";

interface OnboardingCompleteBody {
  firstName?: string;
  lastName?: string;
  username?: string;
  subjects?: SubjectSlug[];
}

/**
 * Completes onboarding by saving profile and subject selections.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    let body: OnboardingCompleteBody;

    try {
      body = (await request.json()) as OnboardingCompleteBody;
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const result = await completeOnboarding({
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      username: body.username ?? "",
      subjects: body.subjects ?? [],
    });

    if (!result.success) {
      const status = result.error === "Not signed in." ? 401 : 400;
      return jsonError(result.error ?? "Request failed.", status);
    }

    return jsonSuccess(null);
  } catch (err) {
    console.error("POST /api/onboarding/complete failed:", err);
    return jsonError("An unexpected error occurred.", 500);
  }
}
