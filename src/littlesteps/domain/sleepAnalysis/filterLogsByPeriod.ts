import { DailyLog } from '~app/family/domain/familyRecords';

export /**
 * 篩選指定時段的日誌
 */
function filterLogsByPeriod(
  logs: DailyLog[],
  period: 'today' | 'week' | 'month',
): DailyLog[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return logs.filter((log) => {
    const logDate = new Date(log.timestamp);

    switch (period) {
      case 'today':
        return logDate >= today;

      case 'week': {
        const weekAgo = new Date(today);

        weekAgo.setDate(weekAgo.getDate() - 7);

        return logDate >= weekAgo;
      }

      case 'month': {
        const monthAgo = new Date(today);

        monthAgo.setMonth(monthAgo.getMonth() - 1);

        return logDate >= monthAgo;
      }

      default:
        return true;
    }
  });
}
