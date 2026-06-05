// Profile page helpers: dirty-check snapshots and date formatting.

import type { SubjectSlug } from "@/types";

export interface ProfileSnapshot {
  firstName: string;
  lastName: string;
  username: string;
  emailNotifications: boolean;
}

/**
 * Returns true when two subject arrays contain the same slugs.
 */
export function subjectsEqual(a: SubjectSlug[], b: SubjectSlug[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((slug, index) => slug === sortedB[index]);
}

/**
 * Formats an ISO date string as a long US locale date.
 */
export function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
