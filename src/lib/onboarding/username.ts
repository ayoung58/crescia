export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export function validateUsernameFormat(username: string): {
  valid: boolean;
  message?: string;
} {
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
