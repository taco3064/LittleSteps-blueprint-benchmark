import type { GrowthRecord } from '../records';

export function summarizegrowth(growthRecords: GrowthRecord[]) {
  // --- Growth records (already sorted newest-first by the hook) ---
  const recentGrowthRecords = growthRecords.slice(0, 3).map((r) => ({
    date: r.date,
    weight: r.weight,
    height: r.height,
    headCircumference: r.headCircumference,
  }));

  const latestGrowth
    = growthRecords.length > 0
      ? {
          date: growthRecords[0].date,
          weight: growthRecords[0].weight,
          height: growthRecords[0].height,
          headCircumference: growthRecords[0].headCircumference,
          percentile: growthRecords[0].percentile,
        }
      : undefined;

  return { recentGrowthRecords, latestGrowth };
}
