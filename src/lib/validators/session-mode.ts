// Type guard for validating study session mode strings.

import { SESSION_MODES } from "@/lib/constants";
import type { SessionMode } from "@/types";

/**
 * Returns true when value is a supported session mode.
 */
export function isSessionMode(value: string): value is SessionMode {
  return (SESSION_MODES as readonly string[]).includes(value);
}
