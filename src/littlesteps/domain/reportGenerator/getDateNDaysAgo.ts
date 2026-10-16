import { toLocalDateKey } from '~app/platform/domain/calendar';

export /**
 * Get the date string (YYYY-MM-DD) for N days ago
 */
function getDateNDaysAgo(daysAgo: number): string {
  const date = new Date();

  date.setDate(date.getDate() - daysAgo);

  return toLocalDateKey(date);
}
