import { toLocalDateKey } from '~app/platform/domain/calendar';
import type {
  DailyLog,
  DiaperData,
  FeedingData,
  SleepData,
} from '~app/family/domain/familyRecords';
import {
  calculateSleepDuration,
  getRecentLogs,
  isPumpingLog,
  isStaleOpenSleep,
} from '../logHelpers';
import { ClinicSummaryData } from './ClinicSummaryData';

export function weekSummaryFor(dailyLogs: DailyLog[]) {
  // --- 7-day daily summary ---
  const recentLogs = getRecentLogs(dailyLogs, 7);

  // Group logs by date to compute per-day stats then average
  const dayMap = new Map<
    string,
    {
      feedingCount: number;
      feedingAmount: number;
      sleepMinutes: number;
      poopCount: number;
      hasFeeding: boolean;
      hasSleep: boolean;
      hasDiaper: boolean;
    }
  >();

  const state: LogExtremes = { longestSleep: 0, lastPoopTime: undefined };

  recentLogs.forEach((log) => {
    const dateKey = toLocalDateKey(log.timestamp);

    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        feedingCount: 0,
        feedingAmount: 0,
        sleepMinutes: 0,
        poopCount: 0,
        hasFeeding: false,
        hasSleep: false,
        hasDiaper: false,
      });
    }

    const day = dayMap.get(dateKey)!;

    if (log.type === 'feeding') {
      {
        recordFeeding(day, log);
      }
    }

    if (log.type === 'sleep') {
      {
        recordSleep(day, log, state);
      }
    }

    if (log.type === 'diaper') {
      {
        recordDiaper(day, log, state);
      }
    }
  });

  let feedingDays = 0;
  let sleepDays = 0;
  let diaperDays = 0;
  let totalFeedingCount = 0;
  let totalFeedingAmount = 0;
  let totalSleepMinutes = 0;
  let totalPoopCount = 0;

  dayMap.forEach((day) => {
    if (day.hasFeeding) {
      feedingDays += 1;
      totalFeedingCount += day.feedingCount;
      totalFeedingAmount += day.feedingAmount;
    }

    if (day.hasSleep) {
      sleepDays += 1;
      totalSleepMinutes += day.sleepMinutes;
    }

    // 只記了小便的一天也是觀察：那天確實沒有大便，分母要算它。
    if (day.hasDiaper) {
      diaperDays += 1;
      totalPoopCount += day.poopCount;
    }
  });

  const weekSummary: ClinicSummaryData['weekSummary'] = {
    avgFeedingCount:
      feedingDays > 0 ? Math.round((totalFeedingCount / feedingDays) * 10) / 10 : 0,
    avgFeedingAmount:
      feedingDays > 0 ? Math.round(totalFeedingAmount / feedingDays) : 0,
    avgSleepHours:
      sleepDays > 0 ? Math.round((totalSleepMinutes / sleepDays / 60) * 10) / 10 : 0,
    longestSleep: state.longestSleep,
    avgPoopCount:
      diaperDays > 0 ? Math.round((totalPoopCount / diaperDays) * 10) / 10 : 0,
    lastPoopTime: state.lastPoopTime,
    feedingDays,
    sleepDays,
    diaperDays,
    loggedDays: dayMap.size,
  };

  return weekSummary;
}

interface DayTotals {
  feedingCount: number;
  feedingAmount: number;
  sleepMinutes: number;
  poopCount: number;
  hasFeeding: boolean;
  hasSleep: boolean;
  hasDiaper: boolean;
}
interface LogExtremes {
  longestSleep: number;
  lastPoopTime?: string;
}

function recordFeeding(day: DayTotals, log: DailyLog) {
  // 擠奶是媽媽的產出。把它算成一餐，交給醫師的攝取量就會多一倍。
  if (isPumpingLog(log)) {
    return;
  }

  day.hasFeeding = true;
  day.feedingCount++;
  const fd = log.data as FeedingData;

  day.feedingAmount += fd.amount || 0;

  return;
}

function recordSleep(day: DayTotals, log: DailyLog, state: LogExtremes) {
  // 忘了按「醒了」的睡眠只是一個待補的欄位。當成「那天有記睡眠、
  // 但只有 0 分鐘」會把要交給醫師的平均值往下拉。
  if (isStaleOpenSleep(log)) {
    return;
  }

  day.hasSleep = true;
  const sd = log.data as SleepData;
  const dur = sd.duration || calculateSleepDuration(sd) || 0;

  day.sleepMinutes += dur;

  if (dur > state.longestSleep) {
    state.longestSleep = dur;
  }

  return;
}

function recordDiaper(day: DayTotals, log: DailyLog, state: LogExtremes) {
  day.hasDiaper = true;
  const dd = log.data as DiaperData;

  if (dd.type === 'poop' || dd.type === 'both') {
    day.poopCount++;

    if (!state.lastPoopTime || log.timestamp > state.lastPoopTime) {
      state.lastPoopTime = log.timestamp;
    }
  }

  return;
}
