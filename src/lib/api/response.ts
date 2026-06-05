// Helpers for consistent JSON responses from API route handlers.

import { NextResponse } from "next/server";

import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/api/types";

/**
 * Returns a JSON success response with HTTP 200.
 */
export function jsonSuccess<T>(
  data: T,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Returns a JSON error response with the given HTTP status.
 */
export function jsonError(
  error: string,
  status: number,
  code?: string
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = { success: false, error };
  if (code) {
    body.code = code;
  }
  return NextResponse.json(body, { status });
}

/**
 * Logs the error and returns a generic 500 JSON error response.
 */
export function jsonServerError(
  context: string,
  err: unknown
): NextResponse<ApiErrorResponse> {
  console.error(context, err);
  return jsonError("An unexpected error occurred.", 500);
}
