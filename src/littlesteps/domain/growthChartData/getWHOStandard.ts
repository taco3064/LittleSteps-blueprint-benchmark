import type { Gender } from '~app/family/domain/familyRecords';
import type {
  MeasurementType,
  WHOStandard,
} from '~app/knowledge/domain/referenceModels';
import { STANDING_HEIGHT_FROM_MONTHS } from './STANDING_HEIGHT_FROM_MONTHS';
import { WHO_MAX_AGE_MONTHS } from './WHO_MAX_AGE_MONTHS';
import { WHO_STANDARDS } from './WHO_STANDARDS';
import { WHO_STANDING_HEIGHT_STANDARDS } from './WHO_STANDING_HEIGHT_STANDARDS';

/**
 * Get WHO standard for specific age, measurement type, and gender
 * Supports interpolation for non-exact ages
 */
export function getWHOStandard(
  ageMonths: number,
  measurementType: MeasurementType,
  gender: Gender,
): WHOStandard {
  if (ageMonths < 0 || ageMonths > WHO_MAX_AGE_MONTHS) {
    throw new Error(
      `Age out of range: WHO standards support 0-${WHO_MAX_AGE_MONTHS} months`,
    );
  }

  // 24 個月起改用站姿身高標準。挑表而不是插值跨過去：兩套標準在接縫差
  // 0.67 公分，混起來的曲線兩邊都不認。
  const standards
    = measurementType === 'height' && ageMonths >= STANDING_HEIGHT_FROM_MONTHS
      ? WHO_STANDING_HEIGHT_STANDARDS[gender]
      : WHO_STANDARDS[gender][measurementType];

  // Find exact match
  const exact = standards.find((s) => s.ageMonths === ageMonths);

  if (exact) {
    return exact;
  }

  // Interpolate between two closest values
  const before = standards.filter((s) => s.ageMonths < ageMonths).pop();
  const after = standards.find((s) => s.ageMonths > ageMonths);

  if (!before || !after) {
    // Return closest available
    return standards.reduce((prev, curr) =>
      Math.abs(curr.ageMonths - ageMonths) < Math.abs(prev.ageMonths - ageMonths)
        ? curr
        : prev,
    );
  }

  // Linear interpolation
  const ratio
    = (ageMonths - before.ageMonths) / (after.ageMonths - before.ageMonths);

  return {
    ageMonths,
    L: before.L + (after.L - before.L) * ratio,
    M: before.M + (after.M - before.M) * ratio,
    S: before.S + (after.S - before.S) * ratio,
  };
}
