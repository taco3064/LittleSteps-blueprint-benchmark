import { useMemo } from 'react';
import {
  calculateMilestoneSummary,
  calculateVaccineSummary,
  MilestoneSummary,
  VaccineSummary,
} from '~app/family/domain/summaryCalculator';
import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';
import { calculateDailySummary } from '~app/littlesteps/domain/logHelpers';

/**
 * 計算寶寶的各項摘要統計
 */
export function useChildSummary(
  currentChild: ChildProfile | undefined,
  dailyLogs: DailyLog[],
) {
  const milestoneSummary: MilestoneSummary | null = useMemo(() => {
    if (!currentChild) {
      return null;
    }

    return calculateMilestoneSummary(currentChild.milestoneProgress || {});
  }, [currentChild]);

  const vaccineSummary: VaccineSummary | null = useMemo(() => {
    if (!currentChild) {
      return null;
    }

    return calculateVaccineSummary(
      currentChild.vaccineProgress || {},
      currentChild.birthday,
    );
  }, [currentChild]);

  const todaySummary = useMemo(() => {
    return calculateDailySummary(dailyLogs);
  }, [dailyLogs]);

  return {
    milestoneSummary,
    vaccineSummary,
    todaySummary,
  };
}
