import type {
  DailyLog,
  SleepData,
  SleepAnalytics,
  SleepRecommendation,
  SleepPattern,
} from '../records';
import { toLocalDateKey } from '../dateHelpers';
import { circularTimeStats, formatMinutesOfDay, minutesOfDay } from '../circularTime';
import { isNightSleep } from '../sleepAnalysis';

/**
 * Filter sleep logs from daily logs
 */
export function filterSleepLogs(logs: DailyLog[]): DailyLog[] {
  return logs.filter((log) => log.type === 'sleep');
}

/**
 * Get sleep logs from the last N days
 */
export function getSleepLogsInRange(
  logs: DailyLog[],
  days: number = 1,
  baseDate: Date = new Date(),
): DailyLog[] {
  const cutoffDate = new Date(baseDate);

  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  return filterSleepLogs(logs).filter((log) => {
    const logDate = new Date(log.timestamp);

    return logDate >= cutoffDate && logDate <= baseDate;
  });
}

/**
 * Calculate total sleep duration from logs
 */
export function calculateTotalSleepDuration(logs: DailyLog[]): number {
  return filterSleepLogs(logs).reduce((total, log) => {
    const sleepData = log.data as SleepData;

    return total + (sleepData.duration || 0);
  }, 0);
}

/**
 * Find the longest sleep session
 */
export function findLongestSleepSession(logs: DailyLog[]): number {
  const sleepLogs = filterSleepLogs(logs);

  if (sleepLogs.length === 0) {
    return 0;
  }

  return Math.max(
    ...sleepLogs.map((log) => {
      const sleepData = log.data as SleepData;

      return sleepData.duration || 0;
    }),
  );
}

/**
 * Calculate average sleep duration per session
 */
export function calculateAverageSleepDuration(logs: DailyLog[]): number {
  const sleepLogs = filterSleepLogs(logs);

  if (sleepLogs.length === 0) {
    return 0;
  }

  const total = calculateTotalSleepDuration(sleepLogs);

  return Math.round(total / sleepLogs.length);
}

/**
 * Calculate total night wakings
 */
export function calculateTotalNightWakings(logs: DailyLog[]): number {
  return filterSleepLogs(logs).reduce((total, log) => {
    const sleepData = log.data as SleepData;

    return total + (sleepData.nightWakings || 0);
  }, 0);
}

/**
 * Detect if baby is sleeping through the night (>= 6 hours continuous)
 */
export function detectSleepingThroughNight(logs: DailyLog[]): boolean {
  const longestSleep = findLongestSleepSession(logs);

  return longestSleep >= 360; // 6 hours = 360 minutes
}

/**
 * 睡眠品質分數的兩個成分。
 *
 * 原本有三個：時長 40、夜醒 30、品質 30。後面兩個讀的欄位當時沒有任何畫面
 * 寫得進去，所以每一段睡眠都固定拿到夜醒的滿分 30——等於對每一位家長宣稱
 * 「寶寶整夜沒醒」——再加上品質缺值的中性 20。一百分裡有五十分是常數。
 *
 * 現在夜醒記得起來了，quality 則整個刪掉。缺值不能當成沒醒：沒問到給中性分，
 * 家長明白記了 0 次才給滿分。舊紀錄因此會比改動前少大約 10 分，那正是把
 * 「沒人記過的完美一夜」收回來的差額。
 */
const DURATION_POINTS = { optimal: 60, long: 45, short: 30, tooShort: 15 } as const;

const WAKINGS_POINTS = {
  none: 40,
  one: 27,
  two: 13,
  many: 0,
  unrecorded: 20,
} as const;

function durationPoints(minutes: number): number {
  // Optimal: 2-3 hours per nap for babies
  if (minutes >= 120 && minutes <= 180) {
    return DURATION_POINTS.optimal;
  }

  if (minutes >= 60) {
    return DURATION_POINTS.long;
  }

  if (minutes >= 30) {
    return DURATION_POINTS.short;
  }

  return DURATION_POINTS.tooShort;
}

function wakingsPoints(nightWakings: number | undefined): number {
  if (nightWakings === undefined) {
    return WAKINGS_POINTS.unrecorded;
  }

  if (nightWakings <= 0) {
    return WAKINGS_POINTS.none;
  }

  if (nightWakings === 1) {
    return WAKINGS_POINTS.one;
  }

  if (nightWakings === 2) {
    return WAKINGS_POINTS.two;
  }

  return WAKINGS_POINTS.many;
}

/**
 * Calculate sleep quality score (0-100)
 * Based on: session duration and recorded night wakings.
 */
export function calculateSleepQualityScore(logs: DailyLog[]): number {
  // 還在睡的那一段沒有時長可以評分。當成「0 分鐘的一段睡眠」會在寶寶正在睡
  // 的那一刻把整天的分數拉下來，而那正是這個函式現在拒絕做的事：拿沒有的
  // 資料當成壞消息。
  const sleepLogs = filterSleepLogs(logs).filter(
    (log) => (log.data as SleepData).endTime,
  );

  if (sleepLogs.length === 0) {
    return 0;
  }

  const totalScore = sleepLogs.reduce((total, log) => {
    const sleepData = log.data as SleepData;

    return (
      total
      + durationPoints(sleepData.duration || 0)
      + wakingsPoints(sleepData.nightWakings)
    );
  }, 0);

  return Math.round(totalScore / sleepLogs.length);
}

/**
 * 夜間就寢時刻（當日分鐘數）。
 *
 * 只取夜間睡眠：小睡的開始時間不是就寢時間。原本的寫法是「每一天最早的那次
 * 睡眠」，對會小睡的孩子——也就是這個 app 的每一個孩子——取到的都是早上那次
 * 小睡。也不再按日曆日分組：夜間睡眠一晚一次，分組只是為了濾掉小睡，
 * 而那件事現在由 isNightSleep 正確地做。
 */
function nightSleepBedtimes(
  logs: DailyLog[],
  days: number,
  baseDate: Date,
): number[] {
  return getSleepLogsInRange(logs, days, baseDate)
    .filter((log) => isNightSleep((log.data as SleepData).startTime))
    .map((log) => minutesOfDay(new Date((log.data as SleepData).startTime)));
}

/**
 * Calculate routine score (0-100)
 * Measures consistency of sleep start times
 */
export function calculateRoutineScore(
  logs: DailyLog[],
  days: number = 7,
  baseDate: Date = new Date(),
): number {
  const bedtimes = nightSleepBedtimes(logs, days, baseDate);

  if (bedtimes.length < 3) {
    return 0;
  } // Need at least 3 data points

  const stats = circularTimeStats(bedtimes);

  if (!stats) {
    return 0;
  }

  // 標準差 30 分鐘以內算完全規律，超過 2 小時是 0 分。
  const { stdDevMinutes } = stats;

  if (stdDevMinutes <= 30) {
    return 100;
  }

  return Math.round(Math.max(0, 100 - ((stdDevMinutes - 30) / 90) * 100));
}

/**
 * Calculate average bedtime (first sleep of the day)
 */
export function calculateAverageBedtime(
  logs: DailyLog[],
  days: number = 7,
  baseDate: Date = new Date(),
): string | undefined {
  const stats = circularTimeStats(nightSleepBedtimes(logs, days, baseDate));

  return stats ? formatMinutesOfDay(stats.meanMinutes) : undefined;
}

/**
 * 夜間睡醒的平均時刻。原本取的是「每一天最後一次睡眠的結束」，那是下午小睡
 * 醒來的時間，不是早上起床的時間。
 */
export function calculateAverageWakeTime(
  logs: DailyLog[],
  days: number = 7,
  baseDate: Date = new Date(),
): string | undefined {
  const wakeTimes = getSleepLogsInRange(logs, days, baseDate)
    .filter((log) => {
      const data = log.data as SleepData;

      return data.endTime && isNightSleep(data.startTime);
    })
    .map((log) => minutesOfDay(new Date((log.data as SleepData).endTime!)));

  const stats = circularTimeStats(wakeTimes);

  return stats ? formatMinutesOfDay(stats.meanMinutes) : undefined;
}

/**
 * Generate sleep recommendations based on analytics
 */
export function generateSleepRecommendations(
  _logs: DailyLog[],
  analytics: SleepAnalytics,
): SleepRecommendation[] {
  const recommendations: SleepRecommendation[] = [];

  recommendations.push(...sleepQualityRecommendations(analytics));

  // Night wakings
  if (analytics.nightWakingsTotal > 5) {
    recommendations.push({
      id: 'too-many-wakings',
      type: 'warning',
      title: '夜醒次數較多',
      message: `寶寶在過去 24 小時內夜醒了 ${analytics.nightWakingsTotal} 次。可能原因：飢餓、尿布濕、太冷/太熱、分離焦慮等。`,
      icon: 'AlertCircle',
    });
  } else if (analytics.nightWakingsTotal === 0 && analytics.sleepCount > 0) {
    recommendations.push({
      id: 'no-wakings',
      type: 'positive',
      title: '一覺到天亮',
      message: '寶寶昨天完全沒有夜醒，睡眠品質極佳！',
      icon: 'Heart',
    });
  }

  // Routine score
  if (analytics.routineScore >= 75) {
    recommendations.push({
      id: 'good-routine',
      type: 'positive',
      title: '作息規律穩定',
      message: `寶寶的睡眠時間很規律（規律性 ${analytics.routineScore}%），這有助於培養良好的睡眠習慣。`,
      icon: 'Clock',
    });
  } else if (analytics.routineScore < 50) {
    recommendations.push({
      id: 'poor-routine',
      type: 'suggestion',
      title: '建議建立固定作息',
      message:
        '寶寶的睡眠時間不太規律。試著每天在相同時間進行睡前儀式（洗澡、按摩、唱搖籃曲），幫助建立生理時鐘。',
      icon: 'Calendar',
    });
  }

  // Total sleep duration
  if (analytics.totalSleepDuration < 600) {
    // < 10 hours
    recommendations.push({
      id: 'insufficient-sleep',
      type: 'warning',
      title: '睡眠時間不足',
      message: `寶寶過去 24 小時只睡了 ${Math.floor(analytics.totalSleepDuration / 60)} 小時 ${analytics.totalSleepDuration % 60} 分鐘。新生兒需要 14-17 小時，6個月大約 12-15 小時。`,
      icon: 'Clock',
    });
  }

  // If no recommendations, give a general positive message
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'keep-tracking',
      type: 'suggestion',
      title: '繼續記錄',
      message: '持續記錄寶寶的睡眠數據，可以幫助您了解寶寶的作息模式並做出調整。',
      icon: 'TrendingUp',
    });
  }

  return recommendations;
}

/**
 * Analyze sleep patterns and generate full analytics
 */
export function analyzeSleepPatterns(
  logs: DailyLog[],
  baseDate: Date = new Date(),
): SleepAnalytics {
  const last24hLogs = getSleepLogsInRange(logs, 1, baseDate);
  const last7dLogs = getSleepLogsInRange(logs, 7, baseDate);

  const totalSleepDuration = calculateTotalSleepDuration(last24hLogs);
  const longestSleepDuration = findLongestSleepSession(last24hLogs);
  const averageSleepDuration = calculateAverageSleepDuration(last24hLogs);
  const sleepCount = filterSleepLogs(last24hLogs).length;
  const sleepQualityScore = calculateSleepQualityScore(last24hLogs);
  const nightWakingsTotal = calculateTotalNightWakings(last24hLogs);
  const isSleepingThroughNight = detectSleepingThroughNight(last24hLogs);
  const routineScore = calculateRoutineScore(last7dLogs, 7, baseDate);
  const averageBedtime = calculateAverageBedtime(last7dLogs, 7, baseDate);
  const averageWakeTime = calculateAverageWakeTime(last7dLogs, 7, baseDate);

  const analytics: SleepAnalytics = {
    totalSleepDuration,
    longestSleepDuration,
    averageSleepDuration,
    sleepCount,
    sleepQualityScore,
    nightWakingsTotal,
    isSleepingThroughNight,
    longestContinuousSleep: longestSleepDuration,
    routineScore,
    averageBedtime,
    averageWakeTime,
    recommendations: [],
  };

  // Generate recommendations based on analytics
  analytics.recommendations = generateSleepRecommendations(logs, analytics);

  return analytics;
}

/**
 * Get sleep patterns by date (for visualization)
 */
export function getSleepPatternsByDate(
  logs: DailyLog[],
  days: number = 7,
  baseDate: Date = new Date(),
): SleepPattern[] {
  const sleepLogs = getSleepLogsInRange(logs, days, baseDate);

  // Group by date
  const logsByDate: { [date: string]: DailyLog[] } = {};

  sleepLogs.forEach((log) => {
    const date = toLocalDateKey(log.timestamp);

    if (!logsByDate[date]) {
      logsByDate[date] = [];
    }

    logsByDate[date].push(log);
  });

  // Convert to SleepPattern array
  return Object.entries(logsByDate)
    .map(([date, logs]) => {
      const sessions = logs.map((log) => {
        const sleepData = log.data as SleepData;

        return {
          startTime: sleepData.startTime,
          endTime: sleepData.endTime,
          duration: sleepData.duration || 0,
          nightWakings: sleepData.nightWakings,
        };
      });

      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const longestSession = Math.max(...sessions.map((s) => s.duration));
      const qualityScore = calculateSleepQualityScore(logs);

      return {
        date,
        sleepSessions: sessions,
        totalDuration,
        longestSession,
        qualityScore,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // Sort newest first
}

function sleepQualityRecommendations(
  analytics: SleepAnalytics,
): SleepRecommendation[] {
  const recommendations: SleepRecommendation[] = [];

  // Sleeping through the night
  if (analytics.isSleepingThroughNight) {
    recommendations.push({
      id: 'sleep-through-night',
      type: 'positive',
      title: '恭喜！寶寶已經睡過夜',
      message: `寶寶最長連續睡眠達 ${Math.floor(analytics.longestContinuousSleep / 60)} 小時 ${analytics.longestContinuousSleep % 60} 分鐘，表現很棒！`,
      icon: 'PartyPopper',
    });
  } else if (analytics.longestContinuousSleep >= 240) {
    recommendations.push({
      id: 'almost-through-night',
      type: 'suggestion',
      title: '快要睡過夜了',
      message: `寶寶最長連續睡眠已達 ${Math.floor(analytics.longestContinuousSleep / 60)} 小時，再加油！試著延長睡前的餵奶量或建立固定的睡前儀式。`,
      icon: 'Moon',
    });
  }

  // Sleep quality
  if (analytics.sleepQualityScore >= 80) {
    recommendations.push({
      id: 'good-quality',
      type: 'positive',
      title: '睡眠品質優良',
      message: '寶寶的睡眠品質很好，請繼續保持目前的作息模式！',
      icon: 'Star',
    });
  } else if (analytics.sleepQualityScore < 50) {
    recommendations.push({
      id: 'poor-quality',
      type: 'warning',
      title: '睡眠品質需改善',
      message:
        '寶寶的睡眠品質較差，建議檢查睡眠環境（溫度、光線、噪音）或諮詢兒科醫師。',
      icon: 'AlertTriangle',
    });
  }

  return recommendations;
}
