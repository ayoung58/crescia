// Username validation rules and format checker for onboarding and profile.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export interface UsernameFormatResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates username length and allowed characters.
 */
export function validateUsernameFormat(username: string): UsernameFormatResult {
  const trimmed = username.trim();

  if (trimmed.length < USERNAME_MIN || trimmed.length > USERNAME_MAX) {
    return {
      valid: false,
      message: `Username must be ${USERNAME_MIN}–${USERNAME_MAX} characters.`,
    };
  }

  if (!USERNAME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      message: "Use only letters, numbers, and underscores.",
    };
  }

  return { valid: true };
}
