// Number formatting helpers for display in the UI.

/**
 * Formats a number with US locale thousands separators.
 */
export function formatWithCommas(value: number): string {
  return value.toLocaleString("en-US");
}
