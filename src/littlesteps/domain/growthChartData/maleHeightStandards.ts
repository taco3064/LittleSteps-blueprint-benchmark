import type { WHOStandard } from '~app/knowledge/domain/referenceModels';

export /**
 * HEIGHT TABLES — two different WHO indicators spliced at 24 months.
 *
 *   ageMonths 0-24  : length-for-age, measured RECUMBENT (lying down).
 *   ageMonths 27-36 : height-for-age, measured STANDING.
 *
 * WHO publishes these as separate standards, and they deliberately disagree at
 * the join, because standing height measures shorter than recumbent length:
 *
 *              length-for-age @24mo   height-for-age @24mo   difference
 *   BOYS       M = 87.8161 cm         M = 87.1161 cm         -0.70 cm
 *   GIRLS      M = 86.4153 cm         M = 85.7153 cm         -0.70 cm
 *
 * The step is a REAL MEASUREMENT-METHOD CHANGE, NOT A DATA ERROR. WHO applies
 * exactly this 0.7 cm offset when it switches tables at 2 years.
 *
 * We keep the length value at 24 months, so months 0-24 remain pure
 * length-for-age (the range LittleSteps already served) and the method change
 * falls inside the 24->27 interpolation gap. Consequence: `getWHOStandard`
 * blends a length row with a height row for 24 < age < 27, so months 25-26 read
 * up to ~0.45 cm above the true standing-height median.
 *
 * DO NOT "fix" this by nudging the 24- or 27-month row, and do not extend the
 * 0-24 length table past 24 months. Either would replace a documented 0.45 cm
 * interpolation artefact with an undocumented 0.70 cm systematic error.
 */

// Male Height Standards (cm) — WHO length-for-age BOYS 0-2y (0-24), height-
// for-age BOYS 2-5y (27-36)

const maleHeightStandards: WHOStandard[] = [
  { ageMonths: 0, L: 1, M: 49.8842, S: 0.03795 },
  { ageMonths: 1, L: 1, M: 54.7244, S: 0.03557 },
  { ageMonths: 2, L: 1, M: 58.4249, S: 0.03424 },
  { ageMonths: 3, L: 1, M: 61.4292, S: 0.03328 },
  { ageMonths: 4, L: 1, M: 63.886, S: 0.03257 },
  { ageMonths: 5, L: 1, M: 65.9026, S: 0.03204 },
  { ageMonths: 6, L: 1, M: 67.6236, S: 0.03165 },
  { ageMonths: 7, L: 1, M: 69.1645, S: 0.03139 },
  { ageMonths: 8, L: 1, M: 70.5994, S: 0.03124 },
  { ageMonths: 9, L: 1, M: 71.9687, S: 0.03117 },
  { ageMonths: 10, L: 1, M: 73.2812, S: 0.03118 },
  { ageMonths: 11, L: 1, M: 74.5388, S: 0.03125 },
  { ageMonths: 12, L: 1, M: 75.7488, S: 0.03137 },
  { ageMonths: 15, L: 1, M: 79.1458, S: 0.03197 },
  { ageMonths: 18, L: 1, M: 82.2587, S: 0.03279 },
  { ageMonths: 21, L: 1, M: 85.1348, S: 0.03376 },
  // --- end of length-for-age (recumbent) ---
  { ageMonths: 24, L: 1, M: 87.8161, S: 0.03479 },
  // --- start of height-for-age (standing); see note above, -0.70 cm step is correct ---
  { ageMonths: 27, L: 1, M: 89.6197, S: 0.0361 },
  { ageMonths: 30, L: 1, M: 91.9327, S: 0.03704 },
  { ageMonths: 33, L: 1, M: 94.0711, S: 0.03787 },
  { ageMonths: 36, L: 1, M: 96.0835, S: 0.03858 },
];
