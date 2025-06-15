
/**
 * Utility helpers for normalizing team names and IDs.
 */

// Normalize a team name for comparison (trim, lowercase)
export function normalizeTeamName(name: string | undefined | null) {
  return (name || '').toString().trim().toLowerCase();
}

// Normalize a team ID for comparison (as string, trimmed)
export function normalizeTeamId(id: string | number | undefined | null) {
  return (id ?? '').toString().trim();
}
