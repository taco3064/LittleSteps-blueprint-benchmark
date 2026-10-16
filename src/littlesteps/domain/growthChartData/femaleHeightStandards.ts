import type { WHOStandard } from '~app/knowledge/domain/referenceModels';

// Female Height Standards (cm) — WHO length-for-age GIRLS 0-2y (0-24),
// height-for-age GIRLS 2-5y (27-36)
export const femaleHeightStandards: WHOStandard[] = [
  { ageMonths: 0, L: 1, M: 49.1477, S: 0.0379 },
  { ageMonths: 1, L: 1, M: 53.6872, S: 0.0364 },
  { ageMonths: 2, L: 1, M: 57.0673, S: 0.03568 },
  { ageMonths: 3, L: 1, M: 59.8029, S: 0.0352 },
  { ageMonths: 4, L: 1, M: 62.0899, S: 0.03486 },
  { ageMonths: 5, L: 1, M: 64.0301, S: 0.03463 },
  { ageMonths: 6, L: 1, M: 65.7311, S: 0.03448 },
  { ageMonths: 7, L: 1, M: 67.2873, S: 0.03441 },
  { ageMonths: 8, L: 1, M: 68.7498, S: 0.0344 },
  { ageMonths: 9, L: 1, M: 70.1435, S: 0.03444 },
  { ageMonths: 10, L: 1, M: 71.4818, S: 0.03452 },
  { ageMonths: 11, L: 1, M: 72.771, S: 0.03464 },
  { ageMonths: 12, L: 1, M: 74.015, S: 0.03479 },
  { ageMonths: 15, L: 1, M: 77.5099, S: 0.03534 },
  { ageMonths: 18, L: 1, M: 80.7079, S: 0.03598 },
  { ageMonths: 21, L: 1, M: 83.6654, S: 0.03666 },
  // --- end of length-for-age (recumbent) ---
  { ageMonths: 24, L: 1, M: 86.4153, S: 0.03734 },
  // --- start of height-for-age (standing); see note above, -0.70 cm step is correct ---
  { ageMonths: 27, L: 1, M: 88.283, S: 0.0383 },
  { ageMonths: 30, L: 1, M: 90.6797, S: 0.03893 },
  { ageMonths: 33, L: 1, M: 92.9239, S: 0.03952 },
  { ageMonths: 36, L: 1, M: 95.0515, S: 0.04006 },
];
