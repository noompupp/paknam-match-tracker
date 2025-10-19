/**
 * Convert a Date object to a canonical month key (YYYY-MM-01) in UTC
 * This prevents timezone-related date shifts that can cause month offset bugs
 * 
 * @param date - The date to convert
 * @returns Canonical month string in format "YYYY-MM-01"
 */
export function getMonthKeyUTC(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Parse a month key string (YYYY-MM-DD) and normalize to first day of month
 * 
 * @param monthStr - Month string in any YYYY-MM-DD format
 * @returns Normalized month string as "YYYY-MM-01"
 */
export function normalizeMonthKey(monthStr: string): string {
  if (!monthStr || monthStr.length < 7) {
    throw new Error('Invalid month string format');
  }
  return `${monthStr.substring(0, 7)}-01`;
}
