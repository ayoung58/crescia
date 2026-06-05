// Client hook: debounced username availability check against the onboarding API.

import { useCallback, useEffect, useState } from "react";

import type { ApiResponse, UsernameCheckData } from "@/lib/api/types";
import { validateUsernameFormat } from "@/lib/onboarding/username";

export type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

interface UseUsernameAvailabilityOptions {
  username: string;
  /** When false, skips remote check (e.g. username unchanged from saved value). */
  shouldCheck: boolean;
  debounceMs?: number;
}

interface UseUsernameAvailabilityResult {
  status: UsernameStatus;
}

/**
 * Debounces username input and checks availability via /api/onboarding/check-username.
 */
export function useUsernameAvailability({
  username,
  shouldCheck,
  debounceMs = 400,
}: UseUsernameAvailabilityOptions): UseUsernameAvailabilityResult {
  const [status, setStatus] = useState<UsernameStatus>("idle");

  const checkUsername = useCallback(async (value: string): Promise<void> => {
    const trimmed = value.trim();
    const format = validateUsernameFormat(trimmed);

    if (!format.valid) {
      setStatus("idle");
      return;
    }

    setStatus("checking");

    try {
      const res = await fetch(
        `/api/onboarding/check-username?username=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const json = (await res.json()) as ApiResponse<UsernameCheckData>;
      if (!json.success) {
        setStatus("error");
        return;
      }
      const data = json.data;
      if (!data.valid) {
        setStatus("idle");
        return;
      }
      setStatus(data.available ? "available" : "taken");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed || !shouldCheck) {
      setStatus("idle");
      return;
    }

    if (!validateUsernameFormat(trimmed).valid) {
      setStatus("idle");
      return;
    }

    const timer = setTimeout(() => {
      void checkUsername(trimmed);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [username, shouldCheck, debounceMs, checkUsername]);

  return { status };
}
