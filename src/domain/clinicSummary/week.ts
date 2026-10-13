import type { DailyLog, FeedingData, SleepData, DiaperData } from '../records';
import {
  getRecentLogs,
  calculateSleepDuration,
  isStaleOpenSleep,
  isPumpingLog,
} from '../logHelpers';
import { toLocalDateKey } from '../dateHelpers';
import type { ClinicSummaryData } from './types';

type Day = {
  feedingCount: number;
  feedingAmount: number;
  sleepMinutes: number;
  poopCount: number;
  hasFeeding: boolean;
  hasSleep: boolean;
  hasDiaper: boolean;
};
type Observations = { longestSleep: number; lastPoopTime?: string };

function emptyDay(): Day {
  return {
    feedingCount: 0,
    feedingAmount: 0,
    sleepMinutes: 0,
    poopCount: 0,
    hasFeeding: false,
    hasSleep: false,
    hasDiaper: false,
  };
}

function addFeeding(log: DailyLog, day: Day) {
  // Pumping is maternal output, not infant intake.
  if (isPumpingLog(log)) {
    return;
  }

  day.hasFeeding = true;
  day.feedingCount++;
  day.feedingAmount += (log.data as FeedingData).amount || 0;
}

function addSleep(log: DailyLog, day: Day, observations: Observations) {
  if (isStaleOpenSleep(log)) {
    return;
  }

  day.hasSleep = true;
  const data = log.data as SleepData;
  const duration = data.duration || calculateSleepDuration(data) || 0;

  day.sleepMinutes += duration;

  if (duration > observations.longestSleep) {
    observations.longestSleep = duration;
  }
}

function addDiaper(log: DailyLog, day: Day, observations: Observations) {
  day.hasDiaper = true;
  const data = log.data as DiaperData;

  if (data.type !== 'poop' && data.type !== 'both') {
    return;
  }

  day.poopCount++;

  if (!observations.lastPoopTime || log.timestamp > observations.lastPoopTime) {
    observations.lastPoopTime = log.timestamp;
  }
}

function collectDays(dailyLogs: DailyLog[]) {
  const days = new Map<string, Day>();
  const observations: Observations = { longestSleep: 0 };

  getRecentLogs(dailyLogs, 7).forEach((log) => {
    const key = toLocalDateKey(log.timestamp);

    if (!days.has(key)) {
      days.set(key, emptyDay());
    }

    const day = days.get(key)!;

    if (log.type === 'feeding') {
      addFeeding(log, day);
    }

    if (log.type === 'sleep') {
      addSleep(log, day, observations);
    }

    if (log.type === 'diaper') {
      addDiaper(log, day, observations);
    }
  });

  return { days, observations };
}

function totalDays(days: Map<string, Day>) {
  const total = {
    feedingDays: 0,
    sleepDays: 0,
    diaperDays: 0,
    feedingCount: 0,
    feedingAmount: 0,
    sleepMinutes: 0,
    poopCount: 0,
  };

  days.forEach((day) => {
    if (day.hasFeeding) {
      total.feedingDays++;
      total.feedingCount += day.feedingCount;
      total.feedingAmount += day.feedingAmount;
    }

    if (day.hasSleep) {
      total.sleepDays++;
      total.sleepMinutes += day.sleepMinutes;
    }

    // A urine-only observation day still contributes to the diaper denominator.
    if (day.hasDiaper) {
      total.diaperDays++;
      total.poopCount += day.poopCount;
    }
  });

  return total;
}

export function summarizeWeek(
  dailyLogs: DailyLog[],
): ClinicSummaryData['weekSummary'] {
  const { days, observations } = collectDays(dailyLogs);
  const t = totalDays(days);

  return {
    avgFeedingCount:
      t.feedingDays > 0 ? Math.round((t.feedingCount / t.feedingDays) * 10) / 10 : 0,
    avgFeedingAmount:
      t.feedingDays > 0 ? Math.round(t.feedingAmount / t.feedingDays) : 0,
    avgSleepHours:
      t.sleepDays > 0
        ? Math.round((t.sleepMinutes / t.sleepDays / 60) * 10) / 10
        : 0,
    longestSleep: observations.longestSleep,
    avgPoopCount:
      t.diaperDays > 0 ? Math.round((t.poopCount / t.diaperDays) * 10) / 10 : 0,
    lastPoopTime: observations.lastPoopTime,
    feedingDays: t.feedingDays,
    sleepDays: t.sleepDays,
    diaperDays: t.diaperDays,
    loggedDays: days.size,
  };
}
