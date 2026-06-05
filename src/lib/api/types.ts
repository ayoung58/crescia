// Shared API response shapes for route handlers and client fetch calls.

import type { DbUser, SubjectSlug } from "@/types";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface UsernameCheckData {
  available: boolean;
  valid: boolean;
  message?: string;
}

export interface ProfileData {
  user: DbUser;
  subjects: SubjectSlug[];
}

export interface SessionStartData {
  sessionId: string;
}
