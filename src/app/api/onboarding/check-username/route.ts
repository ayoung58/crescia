// GET /api/onboarding/check-username — checks whether a username is available.

import { NextRequest } from "next/server";

import { jsonSuccess } from "@/lib/api/response";
import { validateUsernameFormat } from "@/lib/onboarding/username";
import { createAnonClient } from "@/lib/supabase/anon";

/**
 * Validates username format and checks availability in the users table.
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const username = request.nextUrl.searchParams.get("username")?.trim() ?? "";

    const format = validateUsernameFormat(username);
    if (!format.valid) {
      return jsonSuccess({
        available: false,
        valid: false,
        message: format.message,
      });
    }

    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("GET /api/onboarding/check-username query failed:", error);
      return jsonSuccess({
        available: true,
        valid: true,
      });
    }

    return jsonSuccess({
      available: !data,
      valid: true,
    });
  } catch (err) {
    console.error("GET /api/onboarding/check-username failed:", err);
    return jsonSuccess({
      available: true,
      valid: true,
    });
  }
}
