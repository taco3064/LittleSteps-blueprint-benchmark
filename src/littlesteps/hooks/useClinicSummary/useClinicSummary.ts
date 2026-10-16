import { useMemo } from 'react';
import type { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';
import { clinicSummary } from '~app/littlesteps/domain/clinicSummary';
import { useGrowthTracking } from '../useGrowthTracking';

export function useClinicSummary(
  currentChild: ChildProfile | undefined,
  dailyLogs: DailyLog[],
  user: { uid: string } | null,
) {
  const { records, loading } = useGrowthTracking(
    currentChild?.id || null,
    user,
    currentChild ?? undefined,
  );

  const data = useMemo(
    () => (currentChild ? clinicSummary(currentChild, records, dailyLogs) : null),
    [currentChild, records, dailyLogs],
  );

  return { data, loading };
}
