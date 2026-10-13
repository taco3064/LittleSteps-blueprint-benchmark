import { getDateNDaysAgo } from './reportDates';
import { DailyLog, SleepData } from '../records';
import {
  filterLogsByDate,
  calculateSleepDuration,
  isStaleOpenSleep,
} from '../logHelpers';
import { calculateTrend, getRecommendedSleepHours } from '../trendCalculator';

/**
 * Build sleep section data for a report
 */
export function buildSleepData(logs: DailyLog[], days: number, ageMonths: number) {
  const dailyDurations: number[] = [];
  const nightWakingsPerDay: Array<number | null> = [];
  let longestContinuous = 0;
  let loggedDays = 0;
  let sleepMinutesTotal = 0;

  for (let i = days - 1; i >= 0; i--) {
    accumulateDay(i);
  }

  // 沒記睡眠的日子不是「那天沒睡」。除以整段天數，會讓漏記幾天的家長看到
  // 一個遠低於實際的時數，然後對照「建議時數」以為孩子睡太少。
  const avgDailyHours = loggedDays > 0 ? sleepMinutesTotal / 60 / loggedDays : 0;
  const nightWakingsTrend = calculateTrend(nightWakingsPerDay);
  const recommended = getRecommendedSleepHours(ageMonths);

  return {
    dailyDurations,
    avgDailyHours: Math.round(avgDailyHours * 10) / 10,
    loggedDays,
    longestContinuous: Math.round(longestContinuous), // minutes
    nightWakingsTrend,
    recommendedHours: recommended.min,
  };

  function accumulateDay(i: number) {
    const date = getDateNDaysAgo(i);
    const dayLogs = filterLogsByDate(logs, date);

    // 忘了按「醒了」的睡眠不是那天的一段睡眠：算進來只會讓那天變成「有記錄
    // 但只睡了 0 小時」，把平均往下拉。
    const sleepLogs = dayLogs.filter(
      (log) => log.type === 'sleep' && !isStaleOpenSleep(log),
    );

    let dayTotalMinutes = 0;
    let dayNightWakings = 0;
    // 那天完全沒記睡眠，夜醒次數就是不知道，不是 0。當成 0 會讓「太累沒記」
    // 看起來跟「夜醒變少了」一模一樣，而後者是家長最想聽到的消息。
    const logged = sleepLogs.length > 0;

    sleepLogs.forEach((log) => {
      const data = log.data as SleepData;
      const duration = data.duration || calculateSleepDuration(data) || 0;

      dayTotalMinutes += duration;

      if (duration > longestContinuous) {
        longestContinuous = duration;
      }

      if (data.nightWakings) {
        dayNightWakings += data.nightWakings;
      }
    });

    dailyDurations.push(Math.round((dayTotalMinutes / 60) * 10) / 10); // hours
    nightWakingsPerDay.push(logged ? dayNightWakings : null);

    if (logged) {
      loggedDays += 1;
      sleepMinutesTotal += dayTotalMinutes;
    }
  }
}
