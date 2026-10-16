import { DURATION_POINTS } from './DURATION_POINTS';

export function durationPoints(minutes: number): number {
  // Optimal: 2-3 hours per nap for babies
  if (minutes >= 120 && minutes <= 180) {
    return DURATION_POINTS.optimal;
  }

  if (minutes >= 60) {
    return DURATION_POINTS.long;
  }

  if (minutes >= 30) {
    return DURATION_POINTS.short;
  }

  return DURATION_POINTS.tooShort;
}
