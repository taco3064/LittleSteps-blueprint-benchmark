import { useMemo } from 'react';
import { calculateAge } from '~app/family/domain/dateHelpers';
import { ChildProfile } from '~app/family/domain/familyRecords';
import { getSleepRequirementForAge } from '~app/littlesteps/domain/sleep';
import {
  calculateSleepRegularity,
  calculateSleepStats,
  generateSleepAdvice,
} from '~app/littlesteps/domain/sleepAnalysis';

import type { DailyLog } from '~app/family/domain/familyRecords';

export function useSleepAnalysisData({
  logs, currentChild, period,
}: {
  logs: DailyLog[];
  currentChild?: ChildProfile | null;
  period: 'today' | 'week' | 'month';
}) {
  // Filter sleep logs
  const sleepLogs = useMemo(() => {
    return logs.filter((log) => log.type === 'sleep');
  }, [logs]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateSleepStats(sleepLogs, period);
  }, [sleepLogs, period]);

  const regularity = useMemo(() => {
    return calculateSleepRegularity(sleepLogs);
  }, [sleepLogs]);

  const ageInMonths = useMemo(() => {
    return currentChild ? calculateAge(currentChild.birthday) : 0;
  }, [currentChild]);

  const recommendation = useMemo(() => {
    return getSleepRequirementForAge(ageInMonths);
  }, [ageInMonths]);

  const advice = useMemo(() => {
    return generateSleepAdvice(stats, ageInMonths);
  }, [stats, ageInMonths]);

  return { sleepLogs, stats, regularity, ageInMonths, recommendation, advice };
}
