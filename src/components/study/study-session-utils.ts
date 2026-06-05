// Study session UI helpers: labels and timing summaries.

import type { SessionConfig, SessionMode } from "@/types";

/**
 * Returns the display label for a session mode.
 */
export function modeLabel(mode: SessionMode): string {
  if (mode === "practice_questions") {
    return "Practice Questions";
  }
  return "Practice Exam";
}

/**
 * Returns a short timing summary string for the active session config.
 */
export function timingSummary(config: SessionConfig): string {
  if (config.mode === "practice_exam") {
    if (config.timed) {
      return "Timed";
    }
    return "Untimed";
  }
  if (config.stopwatch) {
    return "Stopwatch on";
  }
  return "Stopwatch off";
}
