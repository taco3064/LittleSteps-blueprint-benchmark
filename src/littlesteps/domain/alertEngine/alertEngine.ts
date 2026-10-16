import { toLocalDateKey } from '~app/platform/domain/calendar';
import { DailyLog, DiaperData, SleepData } from '~app/family/domain/familyRecords';
import {
  calculateSleepDuration,
  filterLogsByDate,
  isIntakeFeedingLog,
} from '../logHelpers';
import { generateDailySeries, getRecommendedSleepHours } from '../trendCalculator';

export type AlertSeverity = 'warning' | 'danger';
export type AlertCategory = 'feeding' | 'sleep' | 'poop';

export interface Alert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  icon: string; // lucide-react icon name
}

/**
 * 「一整天夠不夠」只能問已經過完的那一天。
 *
 * 原本兩個日總量警示比的都是「今天到目前為止」對上一整天的標準，所以每天
 * 早上第一次餵奶／第一段小睡之後就亮起來，一路亮到深夜才自動消失。天天出現
 * 的警示，家長只會學會忽略它。
 */
function lastCompletedDay(): string {
  const date = new Date();

  date.setDate(date.getDate() - 1);

  return toLocalDateKey(date);
}

/** 少於這麼多天有記錄就沒有「平均」可比 */
const MIN_BASELINE_DAYS = 3;

/**
 * Detect feeding alerts
 *
 * Rules:
 * - warning: yesterday's feeding amount < 70% of the surrounding week's average
 * - warning: last feeding was >6 hours ago
 *
 * Both rules count intake only. A pumping session is the mother's output and
 * says nothing about whether the baby has been fed.
 */
export function detectFeedingAlerts(logs: DailyLog[], _ageMonths: number): Alert[] {
  const alerts: Alert[] = [];

  // 已經過完的 7 天（不含今天），最後一格是昨天。
  const week = generateDailySeries(logs, 8, 'feeding_amount').slice(0, 7);
  const yesterdayAmount = week[week.length - 1];

  // 基準不含昨天自己，否則偏低的那天會把自己的平均往下拉。沒記錄的日子不是
  // 「那天喝 0 ml」，不能參與平均。
  const baseline = week
    .slice(0, -1)
    .filter((value): value is number => value !== null);

  // Rule 1: yesterday's feeding amount < 70% of the week's average
  if (yesterdayAmount !== null && baseline.length >= MIN_BASELINE_DAYS) {
    const avgDailyAmount = baseline.reduce((sum, v) => sum + v, 0) / baseline.length;

    if (avgDailyAmount > 0 && yesterdayAmount < avgDailyAmount * 0.7) {
      alerts.push({
        id: 'feeding-low-amount',
        category: 'feeding',
        severity: 'warning',
        title: '昨日餵奶量偏低',
        message: `昨日餵奶量 ${Math.round(yesterdayAmount)}ml，低於近一週平均 ${Math.round(avgDailyAmount)}ml 的 70%，請留意寶寶食慾。`,
        icon: 'AlertTriangle',
      });
    }
  }

  /*
    Rule 2: last feeding was >6 hours ago

    擠奶不算。一位半夜兩點擠奶的母親，寶寶並沒有因此喝到東西——把擠奶當成
    一餐，這則「超過六小時沒餵」的提醒就會被悄悄關掉，而它正是要提醒她的事。
  */
  const feedingLogs = logs
    .filter(isIntakeFeedingLog)
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  if (feedingLogs.length > 0) {
    const lastFeedingTime = new Date(feedingLogs[0].timestamp).getTime();
    const hoursSinceLastFeeding = (Date.now() - lastFeedingTime) / (1000 * 60 * 60);

    if (hoursSinceLastFeeding > 6) {
      alerts.push({
        id: 'feeding-long-gap',
        category: 'feeding',
        severity: 'warning',
        title: '距離上次餵奶已超過 6 小時',
        message: `距離上次餵奶已經 ${Math.round(hoursSinceLastFeeding)} 小時，請確認寶寶是否需要餵食。`,
        icon: 'Clock',
      });
    }
  }

  return alerts;
}

/**
 * Detect poop alerts
 *
 * Rules:
 * - warning: no poop in >48 hours
 * - danger: no poop in >72 hours
 */
export function detectPoopAlerts(logs: DailyLog[]): Alert[] {
  const alerts: Alert[] = [];

  // Find the most recent diaper log with type poop or both
  const poopLogs = logs
    .filter((log) => log.type === 'diaper')
    .filter((log) => {
      const data = log.data as DiaperData;

      return data.type === 'poop' || data.type === 'both';
    })
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  if (poopLogs.length === 0) {
    // No poop logs at all - can't determine, skip alerts
    return alerts;
  }

  const lastPoopTime = new Date(poopLogs[0].timestamp).getTime();
  const now = Date.now();
  const hoursSinceLastPoop = (now - lastPoopTime) / (1000 * 60 * 60);

  if (hoursSinceLastPoop > 72) {
    alerts.push({
      id: 'poop-no-poop-72h',
      category: 'poop',
      severity: 'danger',
      title: '超過 72 小時未排便',
      message: `寶寶已超過 ${Math.round(hoursSinceLastPoop)} 小時未排便，建議諮詢醫師是否需要處理。`,
      icon: 'AlertOctagon',
    });
  } else if (hoursSinceLastPoop > 48) {
    alerts.push({
      id: 'poop-no-poop-48h',
      category: 'poop',
      severity: 'warning',
      title: '超過 48 小時未排便',
      message: `寶寶已超過 ${Math.round(hoursSinceLastPoop)} 小時未排便，請持續觀察。`,
      icon: 'AlertTriangle',
    });
  }

  return alerts;
}

/**
 * Detect sleep alerts
 *
 * Rules:
 * - warning: yesterday's total sleep < 70% of age-recommended minimum
 */
export function detectSleepAlerts(logs: DailyLog[], ageMonths: number): Alert[] {
  const alerts: Alert[] = [];

  const sleepLogs = filterLogsByDate(logs, lastCompletedDay()).filter(
    (log) => log.type === 'sleep',
  );

  // 昨天完全沒記睡眠不代表寶寶沒睡。
  if (sleepLogs.length === 0) {
    return alerts;
  }

  const totalMinutes = completeSleepMinutes(sleepLogs);

  if (totalMinutes === undefined) {
    return alerts;
  }

  const recommended = getRecommendedSleepHours(ageMonths);
  const sleepHours = totalMinutes / 60;

  if (sleepHours < recommended.min * 0.7) {
    alerts.push({
      id: 'sleep-below-recommended',
      category: 'sleep',
      severity: 'warning',
      title: '昨日睡眠時數偏低',
      message: `昨日睡眠 ${sleepHours.toFixed(1)} 小時，低於建議最低 ${recommended.min} 小時的 70%，請注意寶寶作息。`,
      icon: 'Moon',
    });
  }

  return alerts;
}

/**
 * Get all active alerts, sorted by severity (danger first)
 */
export function getActiveAlerts(logs: DailyLog[], ageMonths: number): Alert[] {
  const feedingAlerts = detectFeedingAlerts(logs, ageMonths);
  const poopAlerts = detectPoopAlerts(logs);
  const sleepAlerts = detectSleepAlerts(logs, ageMonths);

  const allAlerts = [...feedingAlerts, ...poopAlerts, ...sleepAlerts];

  // Sort by severity: danger first, then warning
  allAlerts.sort((a, b) => {
    const severityOrder: Record<AlertSeverity, number> = { danger: 0, warning: 1 };

    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return allAlerts;
}

function completeSleepMinutes(sleepLogs: DailyLog[]) {
  let totalMinutes = 0;

  for (const log of sleepLogs) {
    const data = log.data as SleepData;
    const duration = data.duration ?? calculateSleepDuration(data);

    // 還沒按結束的那一段沒有時數，昨天的總和就是不完整的——不完整的總和
    // 拿去比建議值，得到的只會是虛驚。
    if (duration === undefined) {
      return undefined;
    }

    totalMinutes += duration;
  }

  return totalMinutes;
}
