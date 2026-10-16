import type { WHOStandard } from '~app/knowledge/domain/referenceModels';

// Female Weight Standards (kg) — WHO weight-for-age GIRLS, birth to 5 years
// (z-scores)
export const femaleWeightStandards: WHOStandard[] = [
  { ageMonths: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { ageMonths: 1, L: 0.1714, M: 4.1873, S: 0.13724 },
  { ageMonths: 2, L: 0.0962, M: 5.1282, S: 0.13 },
  { ageMonths: 3, L: 0.0402, M: 5.8458, S: 0.12619 },
  { ageMonths: 4, L: -0.005, M: 6.4237, S: 0.12402 },
  { ageMonths: 5, L: -0.043, M: 6.8985, S: 0.12274 },
  { ageMonths: 6, L: -0.0756, M: 7.297, S: 0.12204 },
  { ageMonths: 7, L: -0.1039, M: 7.6422, S: 0.12178 },
  { ageMonths: 8, L: -0.1288, M: 7.9487, S: 0.12181 },
  { ageMonths: 9, L: -0.1507, M: 8.2254, S: 0.12199 },
  { ageMonths: 10, L: -0.17, M: 8.48, S: 0.12223 },
  { ageMonths: 11, L: -0.1872, M: 8.7192, S: 0.12247 },
  { ageMonths: 12, L: -0.2024, M: 8.9481, S: 0.12268 },
  { ageMonths: 15, L: -0.2384, M: 9.6008, S: 0.12299 },
  { ageMonths: 18, L: -0.2637, M: 10.2315, S: 0.12309 },
  { ageMonths: 21, L: -0.2815, M: 10.8534, S: 0.12335 },
  { ageMonths: 24, L: -0.2941, M: 11.4775, S: 0.1239 },
  { ageMonths: 27, L: -0.3032, M: 12.1015, S: 0.12472 },
  { ageMonths: 30, L: -0.3101, M: 12.7055, S: 0.12587 },
  { ageMonths: 33, L: -0.3155, M: 13.2837, S: 0.12737 },
  { ageMonths: 36, L: -0.3201, M: 13.8503, S: 0.12919 },
];
