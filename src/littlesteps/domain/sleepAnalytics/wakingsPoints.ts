import { WAKINGS_POINTS } from './WAKINGS_POINTS';

export function wakingsPoints(nightWakings: number | undefined): number {
  if (nightWakings === undefined) {
    return WAKINGS_POINTS.unrecorded;
  }

  if (nightWakings <= 0) {
    return WAKINGS_POINTS.none;
  }

  if (nightWakings === 1) {
    return WAKINGS_POINTS.one;
  }

  if (nightWakings === 2) {
    return WAKINGS_POINTS.two;
  }

  return WAKINGS_POINTS.many;
}
