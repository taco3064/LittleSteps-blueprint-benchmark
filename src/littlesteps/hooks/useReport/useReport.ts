import { useMemo, useState } from 'react';
import { calculateAge } from '~app/family/domain/dateHelpers';
import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';
import {
  generateMonthlyReport,
  generateWeeklyReport,
  WeeklyReport,
} from '~app/littlesteps/domain/reportGenerator';
import { useGrowthTracking } from '../useGrowthTracking';

export type ReportPeriod = '7days' | '30days';

/**
 * Hook for generating weekly/monthly reports
 * Combines daily logs and growth records to produce a comprehensive report
 */
export function useReport(
  currentChild: ChildProfile | undefined,
  dailyLogs: DailyLog[],
  user: { uid: string } | null,
) {
  const [period, setPeriod] = useState<ReportPeriod>('7days');

  const { records: growthRecords, loading: growthLoading } = useGrowthTracking(
    currentChild?.id || null,
    user,
    currentChild ?? undefined,
  );

  // 月齡只餵給睡眠建議的年齡分段，整數月就夠。這裡原本自己算一份帶小數的
  // 版本，同一個孩子同一天會和全站其他頁面得到不同的月齡。
  const ageMonths = useMemo(
    () => (currentChild?.birthday ? calculateAge(currentChild.birthday) : 0),
    [currentChild?.birthday],
  );

  const report: WeeklyReport | null = useMemo(() => {
    if (!currentChild) {
      return null;
    }

    if (period === '7days') {
      return generateWeeklyReport(dailyLogs, growthRecords, ageMonths);
    }

    return generateMonthlyReport(dailyLogs, growthRecords, ageMonths);
  }, [dailyLogs, growthRecords, ageMonths, period, currentChild]);

  return {
    report,
    period,
    setPeriod,
    loading: growthLoading,
  };
}
