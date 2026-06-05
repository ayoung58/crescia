// Type guard for validating subject slug strings against known AP subjects.

import { SUBJECT_SLUGS, type SubjectSlug } from "@/types";

/**
 * Returns true when value is a valid enrolled subject slug.
 */
export function isSubjectSlug(value: string): value is SubjectSlug {
  return (SUBJECT_SLUGS as readonly string[]).includes(value);
}
