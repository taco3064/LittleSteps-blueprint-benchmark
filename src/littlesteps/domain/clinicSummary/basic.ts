import {
  correctedAgeMonths,
  gestationalAgeLabel,
  isCorrecting,
} from '~app/family/domain/correctedAge';
import type { ChildProfile, GrowthRecord } from '~app/family/domain/familyRecords';
import { calculateAgeDisplay } from '~app/family/domain/summaryCalculator';

export function basicSummary(
  currentChild: ChildProfile,
  growthRecords: GrowthRecord[],
) {
  // --- Basic info ---
  const ageDisplay = calculateAgeDisplay(currentChild.birthday);
  const correcting = isCorrecting(currentChild);

  const gestationalAge = correcting
    ? (gestationalAgeLabel(currentChild) ?? undefined)
    : undefined;

  const correctedAgeDisplay = correcting
    ? `${correctedAgeMonths(currentChild)} 個月`
    : undefined;

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

  return {
    ageDisplay,
    gestationalAge,
    correctedAgeDisplay,
    recentGrowthRecords,
    latestGrowth,
  };
}
