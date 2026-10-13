import { useMemo } from 'react';
import { buildClinicSummary } from '~app/domain/clinicSummary';
import type { ChildProfile, DailyLog } from '~app/domain/records';
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
    () => buildClinicSummary(currentChild, records, dailyLogs),
    [currentChild, records, dailyLogs],
  );

  return { data, loading };
}
