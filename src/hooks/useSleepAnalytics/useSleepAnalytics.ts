import { useMemo } from 'react';
import type { DailyLog, SleepAnalytics, SleepPattern } from '~app/domain/records';
import {
  analyzeSleepPatterns,
  getSleepPatternsByDate,
} from '~app/domain/sleepAnalytics';

/**
 * Hook for analyzing sleep patterns and providing insights
 *
 * @param logs - All daily logs (will filter sleep logs internally)
 * @param days - Number of days to analyze for patterns (default: 7)
 * @returns Sleep analytics and patterns
 *
 * @example
 * ```tsx
 * const { analytics, patterns } = useSleepAnalytics(dailyLogs);
 * console.log(analytics.isSleepingThroughNight);
 * console.log(analytics.recommendations);
 * ```
 */
export function useSleepAnalytics(
  logs: DailyLog[],
  days: number = 7,
): {
  analytics: SleepAnalytics;
  patterns: SleepPattern[];
} {
  // Calculate sleep analytics (memoized)
  const analytics = useMemo(() => {
    return analyzeSleepPatterns(logs, new Date());
  }, [logs]);

  // Get sleep patterns by date (memoized)
  const patterns = useMemo(() => {
    return getSleepPatternsByDate(logs, days, new Date());
  }, [logs, days]);

  return {
    analytics,
    patterns,
  };
}
