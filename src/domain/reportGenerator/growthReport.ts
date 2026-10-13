import { GrowthRecord } from '../records';

import { toLocalDateKey } from '../dateHelpers';

/**
 * Build optional growth section data
 */
export function buildGrowthData(growthRecords: GrowthRecord[], days: number) {
  if (growthRecords.length < 2) {
    return undefined;
  }

  const cutoffDate = new Date();

  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = toLocalDateKey(cutoffDate);

  // Filter records within the period
  const periodRecords = growthRecords
    .filter((r) => r.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (periodRecords.length < 2) {
    return undefined;
  }

  const first = periodRecords[0];
  const last = periodRecords[periodRecords.length - 1];

  const weightChange
    = first.weight != null && last.weight != null
      ? Math.round((last.weight - first.weight) * 100) / 100
      : 0;

  const heightChange
    = first.height != null && last.height != null
      ? Math.round((last.height - first.height) * 10) / 10
      : 0;

  const latestPercentiles = reportedPercentiles(last);

  return {
    weightChange,
    heightChange,
    latestPercentiles,
  };
}

export function reportedPercentiles(last: GrowthRecord) {
  // 沒有性別就算不出百分位，percentile 整個物件會不存在——由 LittleBloom
  // 登記出生轉過來的孩子一律如此，recordBirth 不會補 gender。
  const latestPercentiles: Record<string, number> = {};

  if (last.percentile?.weight != null) {
    latestPercentiles['weight'] = last.percentile.weight;
  }

  if (last.percentile?.height != null) {
    latestPercentiles['height'] = last.percentile.height;
  }

  if (last.percentile?.headCircumference != null) {
    latestPercentiles['headCircumference'] = last.percentile.headCircumference;
  }

  return latestPercentiles;
}
