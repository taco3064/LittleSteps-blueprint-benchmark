import { toLocalDateKey } from '../dateHelpers';

/**
 * Get the date string (YYYY-MM-DD) for N days ago
 */
export function getDateNDaysAgo(daysAgo: number): string {
  const date = new Date();

  date.setDate(date.getDate() - daysAgo);

  return toLocalDateKey(date);
}
