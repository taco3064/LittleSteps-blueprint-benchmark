import { forEachReportDay } from './forEachReportDay';
import { DailyLog, FeedingData } from '~app/family/domain/familyRecords';
import { filterLogsByDate, isIntakeFeedingLog } from '../logHelpers';
import { getDateNDaysAgo } from './getDateNDaysAgo';

export /**
 * Build feeding section data for a report
 */
function buildFeedingData(logs: DailyLog[], days: number) {
  const dailyAmounts: number[] = [];
  let maxDay = { date: '', amount: -Infinity };
  let minDay = { date: '', amount: Infinity };
  let loggedDays = 0;
  let feedingCountTotal = 0;
  let feedingAmountTotal = 0;

  forEachReportDay(days, (i) => {
    const date = getDateNDaysAgo(i);
    const dayLogs = filterLogsByDate(logs, date);

    // 擠奶是產出，不是這一天餵了幾次、喝了多少。它在報告裡有自己的一段。
    const feedingLogs = dayLogs.filter(isIntakeFeedingLog);

    const dayAmount = feedingLogs.reduce((sum, log) => {
      const data = log.data as FeedingData;

      return sum + (data.amount || 0);
    }, 0);

    const dayCount = feedingLogs.length;

    dailyAmounts.push(dayAmount);

    if (feedingLogs.length > 0) {
      loggedDays += 1;
      feedingCountTotal += dayCount;
      feedingAmountTotal += dayAmount;
    }

    // 只有真的記了餵奶的日子才能當「最多／最少的一天」。沒記的那天算進來，
    // 最少的一天永遠是 0 ml，而報告會指名道姓說是哪一天——家長讀到的是
    // 「那天寶寶沒喝奶」，不是「那天沒記」。
    if (feedingLogs.length > 0) {
      if (dayAmount > maxDay.amount) {
        maxDay = { date, amount: dayAmount };
      }

      if (dayAmount < minDay.amount) {
        minDay = { date, amount: dayAmount };
      }
    }
  });

  // 整段期間都沒記過餵奶時，沒有哪一天可以指。回一個隨便挑的日期加 0 ml，
  // 等於憑空生出一個「那天寶寶只喝了 0」的說法。
  const logged = maxDay.amount !== -Infinity;

  // 沒記錄的日子不是「那天喝 0 ml」，是不知道。除以整段天數會把 7 天記錄
  // 稀釋成 30 天的平均——1680 ml 變成每日 56 ml，而一個寶寶一天喝 700-900 ml。
  const avgDailyCount = loggedDays > 0 ? feedingCountTotal / loggedDays : 0;
  const avgDailyAmount = loggedDays > 0 ? feedingAmountTotal / loggedDays : 0;

  return {
    dailyAmounts,
    avgDailyCount: Math.round(avgDailyCount * 10) / 10,
    avgDailyAmount: Math.round(avgDailyAmount),
    loggedDays,
    maxDay: logged ? maxDay : undefined,
    minDay: logged ? minDay : undefined,
  };
}
