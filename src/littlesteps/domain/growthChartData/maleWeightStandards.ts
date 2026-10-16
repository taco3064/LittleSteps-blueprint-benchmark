import type { WHOStandard } from '~app/knowledge/domain/referenceModels';

export /**
 * WHO Child Growth Standards (2006) — LMS parameters, 0-36 months.
 *
 * LMS method: L (Box-Cox power), M (median), S (coefficient of variation).
 * Every row below is transcribed verbatim from the WHO published month-by-month
 * z-score tables (the "Month / L / M / S" columns). Rows exist for months 0-12
 * monthly, then every 3 months to 36; `getWHOStandard` interpolates in between.
 *
 * Sources (WHO Child Growth Standards, https://www.who.int/tools/child-growth-standards):
 *   weight-for-age BOYS  birth to 5 years  — wfa-boys-0-5-zscores.pdf
 *   weight-for-age GIRLS birth to 5 years  — wfa-girls-0-5-zscores.pdf
 *   length-for-age BOYS  birth to 2 years  — lfa_boys_0_2_zscores.pdf
 *   length-for-age GIRLS birth to 2 years  — lfa_girls_0_2_zscores.pdf
 *   height-for-age BOYS  2 to 5 years      — hfa_boys_2_5_zscores.pdf
 *   height-for-age GIRLS 2 to 5 years      — hfa_girls_2_5_zscores.pdf
 *   head circumference-for-age BOYS  birth to 5 years — hcfa_boys_0_5_zscores.pdf
 *   head circumference-for-age GIRLS birth to 5 years — hcfa_girls_0_5_zscores.pdf
 *
 * Do not adjust a value to make a curve look smoother. If a number looks wrong,
 * check it against the PDF above; the tables are not smooth by construction.
 */

// Male Weight Standards (kg) — WHO weight-for-age BOYS, birth to 5 years (z-scores)
const maleWeightStandards: WHOStandard[] = [
  { ageMonths: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { ageMonths: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
  { ageMonths: 2, L: 0.197, M: 5.5675, S: 0.12385 },
  { ageMonths: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { ageMonths: 4, L: 0.1553, M: 7.0023, S: 0.11316 },
  { ageMonths: 5, L: 0.1395, M: 7.5105, S: 0.1108 },
  { ageMonths: 6, L: 0.1257, M: 7.934, S: 0.10958 },
  { ageMonths: 7, L: 0.1134, M: 8.297, S: 0.10902 },
  { ageMonths: 8, L: 0.1021, M: 8.6151, S: 0.10882 },
  { ageMonths: 9, L: 0.0917, M: 8.9014, S: 0.10881 },
  { ageMonths: 10, L: 0.082, M: 9.1649, S: 0.10891 },
  { ageMonths: 11, L: 0.073, M: 9.4122, S: 0.10906 },
  { ageMonths: 12, L: 0.0644, M: 9.6479, S: 0.10925 },
  { ageMonths: 15, L: 0.0413, M: 10.3108, S: 0.11007 },
  { ageMonths: 18, L: 0.0211, M: 10.9385, S: 0.11119 },
  { ageMonths: 21, L: 0.0029, M: 11.5486, S: 0.11261 },
  { ageMonths: 24, L: -0.0137, M: 12.1515, S: 0.11426 },
  { ageMonths: 27, L: -0.0289, M: 12.7401, S: 0.11604 },
  { ageMonths: 30, L: -0.0431, M: 13.3, S: 0.11781 },
  { ageMonths: 33, L: -0.0564, M: 13.8309, S: 0.11953 },
  { ageMonths: 36, L: -0.0689, M: 14.3429, S: 0.12116 },
];
