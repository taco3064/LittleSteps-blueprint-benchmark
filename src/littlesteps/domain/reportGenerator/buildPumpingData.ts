import { DailyLog, FeedingData } from '~app/family/domain/familyRecords';
import { filterLogsByDate, isPumpingLog } from '../logHelpers';
import { getDateNDaysAgo } from './getDateNDaysAgo';

export /**
 * 擠奶自己的一段。
 *
 * 對一位在追奶或維持奶量的母親，重要的數字是每次幾 ml、一天幾次——那是產出，
 * 不是寶寶的攝取，所以它不能混進上面任何一個平均，也不能因此就不出現。
 * 完全沒有擠奶紀錄時回 undefined：報告不該對沒在擠奶的人多長一張卡。
 */
function buildPumpingData(logs: DailyLog[], days: number) {
  let sessions = 0;
  let totalAmount = 0;
  let totalMinutes = 0;
  let loggedDays = 0;

  for (let i = days - 1; i >= 0; i--) {
    const dayLogs = filterLogsByDate(logs, getDateNDaysAgo(i)).filter(isPumpingLog);

    if (dayLogs.length === 0) {
      continue;
    }

    loggedDays += 1;
    sessions += dayLogs.length;

    dayLogs.forEach((log) => {
      const data = log.data as FeedingData;

      totalAmount += data.amount || 0;
      totalMinutes += data.duration || 0;
    });
  }

  if (sessions === 0) {
    return undefined;
  }

  return {
    sessions,
    totalAmount,
    totalMinutes,
    loggedDays,
    avgDailySessions: Math.round((sessions / loggedDays) * 10) / 10,
    avgDailyAmount: Math.round(totalAmount / loggedDays),
  };
}
