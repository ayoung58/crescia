import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { validateUsernameFormat } from "@/lib/onboarding/username";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")?.trim() ?? "";

  const format = validateUsernameFormat(username);
  if (!format.valid) {
    return NextResponse.json({
      available: false,
      valid: false,
      message: format.message,
    });
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      return NextResponse.json({
        available: true,
        valid: true,
      });
    }

    return NextResponse.json({
      available: !data,
      valid: true,
    });
  } catch {
    return NextResponse.json({
      available: true,
      valid: true,
    });
  }
}
