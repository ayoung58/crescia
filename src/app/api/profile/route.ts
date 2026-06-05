// GET /api/profile — returns the authenticated user's profile and subjects.

import { getProfileForCurrentUser } from "@/lib/profile/get-profile";
import { jsonError, jsonSuccess } from "@/lib/api/response";

/**
 * Returns the current user's profile and enrolled subjects.
 */
export async function GET(): Promise<Response> {
  try {
    const result = await getProfileForCurrentUser();

    if ("error" in result) {
      const status = result.error === "Not signed in." ? 401 : 500;
      return jsonError(result.error, status);
    }

    return jsonSuccess({ user: result.user, subjects: result.subjects });
  } catch (err) {
    console.error("GET /api/profile failed:", err);
    return jsonError("An unexpected error occurred.", 500);
  }
}
