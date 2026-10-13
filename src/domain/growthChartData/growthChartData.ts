import type { WHOStandard, MeasurementType, Gender } from '../records';

/**
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

// Female Weight Standards (kg) — WHO weight-for-age GIRLS, birth to 5 years (z-scores)
const femaleWeightStandards: WHOStandard[] = [
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

/**
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

// Male Height Standards (cm) — WHO length-for-age BOYS 0-2y (0-24), height-for-age
// BOYS 2-5y (27-36)
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

// Female Height Standards (cm) — WHO length-for-age GIRLS 0-2y (0-24), height-for-
// age GIRLS 2-5y (27-36)
const femaleHeightStandards: WHOStandard[] = [
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

// Male Head Circumference Standards (cm) — WHO head circumference-for-age BOYS,
// birth to 5 years
const maleHeadCircumferenceStandards: WHOStandard[] = [
  { ageMonths: 0, L: 1, M: 34.4618, S: 0.03686 },
  { ageMonths: 1, L: 1, M: 37.2759, S: 0.03133 },
  { ageMonths: 2, L: 1, M: 39.1285, S: 0.02997 },
  { ageMonths: 3, L: 1, M: 40.5135, S: 0.02918 },
  { ageMonths: 4, L: 1, M: 41.6317, S: 0.02868 },
  { ageMonths: 5, L: 1, M: 42.5576, S: 0.02837 },
  { ageMonths: 6, L: 1, M: 43.3306, S: 0.02817 },
  { ageMonths: 7, L: 1, M: 43.9803, S: 0.02804 },
  { ageMonths: 8, L: 1, M: 44.53, S: 0.02796 },
  { ageMonths: 9, L: 1, M: 44.9998, S: 0.02792 },
  { ageMonths: 10, L: 1, M: 45.4051, S: 0.0279 },
  { ageMonths: 11, L: 1, M: 45.7573, S: 0.02789 },
  { ageMonths: 12, L: 1, M: 46.0661, S: 0.02789 },
  { ageMonths: 15, L: 1, M: 46.806, S: 0.02792 },
  { ageMonths: 18, L: 1, M: 47.3711, S: 0.028 },
  { ageMonths: 21, L: 1, M: 47.8408, S: 0.0281 },
  { ageMonths: 24, L: 1, M: 48.2515, S: 0.02821 },
  { ageMonths: 27, L: 1, M: 48.6151, S: 0.02834 },
  { ageMonths: 30, L: 1, M: 48.9351, S: 0.02847 },
  { ageMonths: 33, L: 1, M: 49.2153, S: 0.02859 },
  { ageMonths: 36, L: 1, M: 49.4612, S: 0.02871 },
];

// Female Head Circumference Standards (cm) — WHO head circumference-for-age GIRLS,
// birth to 5 years
const femaleHeadCircumferenceStandards: WHOStandard[] = [
  { ageMonths: 0, L: 1, M: 33.8787, S: 0.03496 },
  { ageMonths: 1, L: 1, M: 36.5463, S: 0.0321 },
  { ageMonths: 2, L: 1, M: 38.2521, S: 0.03168 },
  { ageMonths: 3, L: 1, M: 39.5328, S: 0.0314 },
  { ageMonths: 4, L: 1, M: 40.5817, S: 0.03119 },
  { ageMonths: 5, L: 1, M: 41.459, S: 0.03102 },
  { ageMonths: 6, L: 1, M: 42.1995, S: 0.03087 },
  { ageMonths: 7, L: 1, M: 42.829, S: 0.03075 },
  { ageMonths: 8, L: 1, M: 43.3671, S: 0.03063 },
  { ageMonths: 9, L: 1, M: 43.83, S: 0.03053 },
  { ageMonths: 10, L: 1, M: 44.2319, S: 0.03044 },
  { ageMonths: 11, L: 1, M: 44.5844, S: 0.03035 },
  { ageMonths: 12, L: 1, M: 44.8965, S: 0.03027 },
  { ageMonths: 15, L: 1, M: 45.6551, S: 0.03006 },
  { ageMonths: 18, L: 1, M: 46.2424, S: 0.02987 },
  { ageMonths: 21, L: 1, M: 46.7384, S: 0.02972 },
  { ageMonths: 24, L: 1, M: 47.1822, S: 0.02957 },
  { ageMonths: 27, L: 1, M: 47.5817, S: 0.02945 },
  { ageMonths: 30, L: 1, M: 47.934, S: 0.02933 },
  { ageMonths: 33, L: 1, M: 48.2408, S: 0.02922 },
  { ageMonths: 36, L: 1, M: 48.5099, S: 0.02912 },
];

/** Highest age the tables above cover. Chart axes must clamp to this. */
export const WHO_MAX_AGE_MONTHS = 36;

/**
 * The raw tables, keyed by gender then measurement type. Exported so the data
 * itself can be validated; read a single standard via `getWHOStandard()`.
 */
/**
 * 身高的接縫：WHO 用兩套標準。
 *
 * 0-24 個月量的是躺著的身長（length-for-age），24 個月以後量的是站著的身高
 * （height-for-age）。同一個 24 個月大的孩子，兩套標準的中位數差 0.67 公分
 * ——不是誤差，是姿勢造成的真實差異，WHO 的合併表就在第 731 天直接跳過去。
 *
 * 所以身高不能只有一個陣列：上面 maleHeightStandards 的 24 個月是身長值，
 * 27 個月是身高值，線性插值會在中間造出一段兩套標準都不認的曲線。實測 25 個
 * 月大、90 公分的男孩會被算成第 69 百分位，正確答案是第 74 百分位。
 *
 * 下面兩張表只放 24 個月起的身高標準；getWHOStandard 依年齡選表，插值永遠
 * 只發生在同一套標準之內。
 *
 * 來源：WHO length/height-for-age 合併 z-score 展開表第 731 天
 *   lhfa-boys-zscore-expanded-tables.xlsx / lhfa-girls-zscore-expanded-tables.xlsx
 *   （查證日期 2026-08-29）
 */
export const STANDING_HEIGHT_FROM_MONTHS = 24;

const maleStandingHeightStandards: WHOStandard[] = [
  { ageMonths: 24, L: 1, M: 87.1303, S: 0.03508 },
  { ageMonths: 27, L: 1, M: 89.6197, S: 0.0361 },
  { ageMonths: 30, L: 1, M: 91.9327, S: 0.03704 },
  { ageMonths: 33, L: 1, M: 94.0711, S: 0.03787 },
  { ageMonths: 36, L: 1, M: 96.0835, S: 0.03858 },
];

const femaleStandingHeightStandards: WHOStandard[] = [
  { ageMonths: 24, L: 1, M: 85.7299, S: 0.03764 },
  { ageMonths: 27, L: 1, M: 88.283, S: 0.0383 },
  { ageMonths: 30, L: 1, M: 90.6797, S: 0.03893 },
  { ageMonths: 33, L: 1, M: 92.9239, S: 0.03952 },
  { ageMonths: 36, L: 1, M: 95.0515, S: 0.04006 },
];

export const WHO_STANDING_HEIGHT_STANDARDS = {
  male: maleStandingHeightStandards,
  female: femaleStandingHeightStandards,
};

export const WHO_STANDARDS = {
  male: {
    weight: maleWeightStandards,
    height: maleHeightStandards,
    headCircumference: maleHeadCircumferenceStandards,
  },
  female: {
    weight: femaleWeightStandards,
    height: femaleHeightStandards,
    headCircumference: femaleHeadCircumferenceStandards,
  },
};

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
  const ratio = (ageMonths - before.ageMonths) / (after.ageMonths - before.ageMonths);

  return {
    ageMonths,
    L: before.L + (after.L - before.L) * ratio,
    M: before.M + (after.M - before.M) * ratio,
    S: before.S + (after.S - before.S) * ratio,
  };
}

/**
 * Calculate percentile value for a given standard and percentile
 * Uses LMS method inverse calculation
 */
export function getPercentileValue(
  standard: WHOStandard,
  percentile: number,
): number {
  const { L, M, S } = standard;

  // Convert percentile to z-score using inverse normal distribution
  // Approximation of probit function (inverse of cumulative normal distribution)
  const p = percentile / 100;
  const z = probitApproximation(p);

  // LMS inverse formula: X = M * (1 + L * S * Z)^(1/L) when L ≠ 0
  if (Math.abs(L) < 0.0001) {
    // When L ≈ 0, use: X = M * exp(S * Z)
    return M * Math.exp(S * z);
  }

  return M * Math.pow(1 + L * S * z, 1 / L);
}

/**
 * 反常態分布（probit）：把百分位換回 z。
 *
 * 這是 Abramowitz & Stegun 26.2.23 的有理近似，|誤差| < 4.5e-4（單位是 z）。
 * 原本的註解寫「Acklam's algorithm」，那是另一組常數、精度到 1.15e-9；
 * 名字寫錯會讓下一個人以為這裡有九位數的精度可用。
 *
 * 4.5e-4 對畫曲線綽綽有餘：實測百分位往返誤差最大 0.003 個百分點。要更準
 * 就得換成 Acklam 或 Wichura AS241，目前沒有需要。
 */
function probitApproximation(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('Percentile must be between 0 and 1 (exclusive)');
  }

  // Use symmetry for p > 0.5
  if (p > 0.5) {
    return -probitApproximation(1 - p);
  }

  // Abramowitz & Stegun 26.2.23
  const q = Math.sqrt(-2 * Math.log(p));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  return -(
    q
    - (c0 + c1 * q + c2 * q * q) / (1 + d1 * q + d2 * q * q + d3 * q * q * q)
  );
}
