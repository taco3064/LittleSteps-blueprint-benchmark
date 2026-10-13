import {
  correctedAgeMonths,
  gestationalAgeLabel,
  isCorrecting,
} from '../correctedAge';
import type { ChildProfile } from '../records';
import { calculateAgeDisplay } from '../summaryCalculator';

export function summarizebasic(currentChild: ChildProfile) {
  // --- Basic info ---
  const ageDisplay = calculateAgeDisplay(currentChild.birthday);
  const correcting = isCorrecting(currentChild);

  const gestationalAge = correcting
    ? (gestationalAgeLabel(currentChild) ?? undefined)
    : undefined;

  const correctedAgeDisplay = correcting
    ? `${correctedAgeMonths(currentChild)} 個月`
    : undefined;

  return { ageDisplay, gestationalAge, correctedAgeDisplay };
}
