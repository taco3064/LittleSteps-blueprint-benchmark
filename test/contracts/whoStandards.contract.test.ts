import { describe, it, expect } from 'vitest';
import type { Gender, MeasurementType } from '../../src/domain/records';
import {
  calculatePercentile,
  calculateZScore,
} from '../../src/domain/growthCalculator';
import {
  STANDING_HEIGHT_FROM_MONTHS,
  getPercentileValue,
  getWHOStandard,
} from '../../src/domain/growthChartData';

/**
 * 把 WHO 公布的 z-score 表當成外部真相，反算回來對帳。
 *
 * 這一整條鏈——抄下來的 L/M/S、LMS 公式、常態分布近似——最後變成家長拿去給
 * 醫師看的百分位。原本的測試只斷言「有定義」、「男生比女生重」、範圍寬鬆，
 * 沒有任何一個數字對過 WHO；任何一格抄錯都照樣全綠。
 *
 * 下面的參考值不是手打的，是從 WHO 檔案用程式抽出來再貼進來的（查證日期
 * 2026-08-29）：
 *   體重  wfa-boys-0-5-zscores.pdf / wfa-girls-0-5-zscores.pdf
 *   身長/身高  lhfa-{boys,girls}-zscore-expanded-tables.xlsx
 *   頭圍  hcfa-{boys,girls}-0-5-zscores.xlsx
 * 手打過一次，當場打錯一個數（33 個月的身高），所以改成生成。
 */

/** 每個月齡對應 -3 到 +3 SD 的實測值 */
type Reference = Record<Gender, Record<number, number[]>>;

const Z_SCORES = [-3, -2, -1, 0, 1, 2, 3];

/** WHO 體重 z-score 表（wfa-boys/girls-0-5-zscores.pdf），單位公斤 */
const WEIGHT_KG_AT_SD: Reference = {
  male: {
    0: [2.1, 2.5, 2.9, 3.3, 3.9, 4.4, 5.0],
    6: [5.7, 6.4, 7.1, 7.9, 8.8, 9.8, 10.9],
    12: [6.9, 7.7, 8.6, 9.6, 10.8, 12.0, 13.3],
    24: [8.6, 9.7, 10.8, 12.2, 13.6, 15.3, 17.1],
    36: [10.0, 11.3, 12.7, 14.3, 16.2, 18.3, 20.7],
  },
  female: {
    0: [2.0, 2.4, 2.8, 3.2, 3.7, 4.2, 4.8],
    6: [5.1, 5.7, 6.5, 7.3, 8.2, 9.3, 10.6],
    12: [6.3, 7.0, 7.9, 8.9, 10.1, 11.5, 13.1],
    24: [8.1, 9.0, 10.2, 11.5, 13.0, 14.8, 17.0],
    36: [9.6, 10.8, 12.2, 13.9, 15.8, 18.1, 20.9],
  },
};

/** WHO 躺姿身長 z-score 展開表，單位公分。月別列定義在 day = 月 × 30.4375 */
const LENGTH_CM_AT_SD: Reference = {
  male: {
    0: [44.205, 46.098, 47.991, 49.884, 51.777, 53.67, 55.564],
    6: [61.2022, 63.3429, 65.4831, 67.6238, 69.7638, 71.9044, 74.045],
    12: [68.6193, 70.9958, 73.3723, 75.7488, 78.1252, 80.5018, 82.8783],
    24: [78.638, 81.693, 84.747, 87.802, 90.856, 93.911, 96.966],
  },
  female: {
    0: [43.56, 45.422, 47.285, 49.148, 51.01, 52.873, 54.736],
    6: [58.932, 61.1983, 63.4649, 65.7311, 67.9974, 70.2636, 72.5303],
    12: [66.29, 68.8653, 71.4398, 74.015, 76.5902, 79.1647, 81.74],
    24: [76.725, 79.95, 83.175, 86.401, 89.626, 92.851, 96.077],
  },
};

/** WHO 站姿身高 z-score 展開表，單位公分。24 個月起適用 */
const STANDING_HEIGHT_CM_AT_SD: Reference = {
  male: {
    24: [77.961, 81.017, 84.074, 87.13, 90.187, 93.243, 96.3],
    27: [79.9141, 83.1497, 86.3845, 89.6199, 92.8547, 96.0904, 99.325],
    36: [84.9633, 88.67, 92.3768, 96.0835, 99.7905, 103.4973, 107.204],
  },
  female: {
    24: [76.049, 79.276, 82.503, 85.73, 88.957, 92.184, 95.411],
    27: [78.1399, 81.5207, 84.9021, 88.2829, 91.6644, 95.0452, 98.4258],
    36: [83.6257, 87.4342, 91.2428, 95.0513, 98.8597, 102.6685, 106.477],
  },
};

/** WHO 頭圍 z-score 表（hcfa-boys/girls-0-5-zscores.xlsx），單位公分 */
const HEAD_CM_AT_SD: Reference = {
  male: {
    0: [30.7, 31.9, 33.2, 34.5, 35.7, 37.0, 38.3],
    6: [39.7, 40.9, 42.1, 43.3, 44.6, 45.8, 47.0],
    12: [42.2, 43.5, 44.8, 46.1, 47.4, 48.6, 49.9],
    24: [44.2, 45.5, 46.9, 48.3, 49.6, 51.0, 52.3],
    36: [45.2, 46.6, 48.0, 49.5, 50.9, 52.3, 53.7],
  },
  female: {
    0: [30.3, 31.5, 32.7, 33.9, 35.1, 36.2, 37.4],
    6: [38.3, 39.6, 40.9, 42.2, 43.5, 44.8, 46.1],
    12: [40.8, 42.2, 43.5, 44.9, 46.3, 47.6, 49.0],
    24: [43.0, 44.4, 45.8, 47.2, 48.6, 50.0, 51.4],
    36: [44.3, 45.7, 47.1, 48.5, 49.9, 51.3, 52.7],
  },
};

/**
 * 容許誤差要從 WHO 印出來的精度推，不是隨手給一個常數。
 *
 * 體重與頭圍只印到小數一位，身長印到三位。把印出來的值反算回 z，誤差上限就是
 * 「半個最小刻度」乘上該點的 dz/dX。新生兒特別敏感：出生時 M=3.35、S=0.146，
 * dz/dX ≈ 2.05 /公斤，所以 0.05 公斤的進位就是 0.1 個 z——比整個中段的誤差
 * 都大。一開始用固定的 0.06 就是在這裡破的，破得對。
 *
 * LMS 的導數：z = ((X/M)^L − 1)/(L·S) ⇒ dz/dX = (X/M)^(L−1) / (M·S)
 */
function toleranceFor(
  measurement: number,
  ageMonths: number,
  type: MeasurementType,
  gender: Gender,
  printedStep: number,
): number {
  const { L, M, S } = getWHOStandard(ageMonths, type, gender);
  const dzdx = Math.pow(measurement / M, L - 1) / (M * S);

  // 加一點餘裕給 erf 近似（A&S 7.1.26，誤差 ≤1.5e-7）與 L/M/S 本身的位數。
  return (printedStep / 2) * dzdx + 0.01;
}

const CASES: Array<{
  label: string;
  type: MeasurementType;
  reference: Reference;
  /** WHO 表上的最小刻度 */
  printedStep: number;
}> = [
  { label: '體重', type: 'weight', reference: WEIGHT_KG_AT_SD, printedStep: 0.1 },
  {
    label: '躺姿身長',
    type: 'height',
    reference: LENGTH_CM_AT_SD,
    printedStep: 0.001,
  },
  {
    label: '頭圍',
    type: 'headCircumference',
    reference: HEAD_CM_AT_SD,
    printedStep: 0.1,
  },
];

describe('WHO 標準對帳', () => {
  for (const { label, type, reference, printedStep } of CASES) {
    for (const gender of ['male', 'female'] as Gender[]) {
      it(`${label}（${gender}）反算回 WHO 印出來的 SD`, () => {
        for (const [month, values] of Object.entries(reference[gender])) {
          const ageMonths = Number(month);

          // 身長表只到 24 個月，24 個月起是站姿身高，另一組測試負責。
          if (type === 'height' && ageMonths >= STANDING_HEIGHT_FROM_MONTHS) {
            continue;
          }

          values.forEach((measurement, index) => {
            const expected = Z_SCORES[index];

            const actual = calculateZScore({
              measurement: measurement,
              ageMonths: ageMonths,
              measurementType: type,
              gender: gender,
            });

            const tolerance = toleranceFor(
              measurement,
              ageMonths,
              type,
              gender,
              printedStep,
            );

            expect(
              Math.abs(actual - expected),
              `${label} ${gender} ${ageMonths}m ${measurement} 應該是 ${expected} SD，算出 ${actual.toFixed(3)}（容許 ${tolerance.toFixed(3)}）`,
            ).toBeLessThan(tolerance);
          });
        }
      });
    }
  }

  it('中位數就是第 50 百分位', () => {
    for (const gender of ['male', 'female'] as Gender[]) {
      for (const type of [
        'weight',
        'height',
        'headCircumference',
      ] as MeasurementType[]) {
        for (const ageMonths of [0, 6, 12, 24, 36]) {
          const { M } = getWHOStandard(ageMonths, type, gender);

          expect(
            calculatePercentile(
              calculateZScore({
                measurement: M,
                ageMonths: ageMonths,
                measurementType: type,
                gender: gender,
              }),
            ),
          ).toBeCloseTo(50, 1);
        }
      }
    }
  });
});

describe('身長與身高是兩套標準', () => {
  for (const gender of ['male', 'female'] as Gender[]) {
    it(`${gender}：24 個月起用站姿身高反算回 WHO 的 SD`, () => {
      for (const [month, values] of Object.entries(
        STANDING_HEIGHT_CM_AT_SD[gender],
      )) {
        const ageMonths = Number(month);

        values.forEach((measurement, index) => {
          const actual = calculateZScore({
            measurement: measurement,
            ageMonths: ageMonths,
            measurementType: 'height',
            gender: gender,
          });

          const tolerance = toleranceFor(
            measurement,
            ageMonths,
            'height',
            gender,
            0.001,
          );

          expect(
            Math.abs(actual - Z_SCORES[index]),
            `站姿身高 ${gender} ${ageMonths}m ${measurement} 應該是 ${Z_SCORES[index]} SD，算出 ${actual.toFixed(3)}`,
          ).toBeLessThan(tolerance);
        });
      }
    });
  }

  it('接縫兩側是不同的標準，差距約 0.67 公分', () => {
    // 這不是誤差，是姿勢造成的真實差異。WHO 的合併表就在第 731 天直接跳過去。
    for (const gender of ['male', 'female'] as Gender[]) {
      const recumbent = getWHOStandard(
        STANDING_HEIGHT_FROM_MONTHS - 0.01,
        'height',
        gender,
      );

      const standing = getWHOStandard(STANDING_HEIGHT_FROM_MONTHS, 'height', gender);

      expect(recumbent.M - standing.M).toBeGreaterThan(0.6);
      expect(recumbent.M - standing.M).toBeLessThan(0.75);
    }
  });

  it('25 個月的身高不是兩套標準的混合值', () => {
    // 修之前 getWHOStandard 會在 24（身長）與 27（身高）之間線性插值，
    // 25 個月、90 公分的男孩因此被算成第 69 百分位。
    const percentile = calculatePercentile(
      calculateZScore({
        measurement: 90,
        ageMonths: 25,
        measurementType: 'height',
        gender: 'male',
      }),
    );

    expect(percentile).toBeGreaterThan(72);
    expect(percentile).toBeLessThan(77);
  });
});

/**
 * 整數 z 對應的百分位。這是常態分布的常數，不是 WHO 的資料。
 * 用它把上面那些 WHO 印出來的公斤/公分反過來考一次曲線繪製用的逆運算。
 */
const PERCENTILE_AT_Z: Record<number, number> = {
  [-3]: 0.13499,
  [-2]: 2.27501,
  [-1]: 15.86553,
  [0]: 50,
  [1]: 84.13447,
  [2]: 97.72499,
  [3]: 99.86501,
};

describe('畫曲線用的反算', () => {
  /**
   * 圖上那五條參考線走的是 getPercentileValue，跟 calculateZScore 是不同的
   * 程式路徑：另一套公式（LMS 逆運算）加另一個近似（probit）。前面的測試
   * 一條都沒碰到它，等於家長真正看到的那幾條線從來沒有對過帳。
   */
  const CASES: Array<{
    label: string;
    type: MeasurementType;
    reference: Reference;
    step: number;
  }> = [
    { label: '體重', type: 'weight', reference: WEIGHT_KG_AT_SD, step: 0.1 },
    { label: '躺姿身長', type: 'height', reference: LENGTH_CM_AT_SD, step: 0.001 },
    { label: '頭圍', type: 'headCircumference', reference: HEAD_CM_AT_SD, step: 0.1 },
  ];

  for (const { label, type, reference, step } of CASES) {
    for (const gender of ['male', 'female'] as Gender[]) {
      it(`${label}（${gender}）的百分位曲線落在 WHO 印出來的值上`, () => {
        for (const [month, values] of Object.entries(reference[gender])) {
          const ageMonths = Number(month);

          if (type === 'height' && ageMonths >= STANDING_HEIGHT_FROM_MONTHS) {
            continue;
          }

          const standard = getWHOStandard(ageMonths, type, gender);

          values.forEach((printed, index) => {
            const percentile = PERCENTILE_AT_Z[Z_SCORES[index]];
            const drawn = getPercentileValue(standard, percentile);
            // 容許 WHO 的進位，加上 probit 近似造成的位移
            const slack = step / 2 + 4.5e-4 * standard.M * standard.S + 1e-6;

            expect(
              Math.abs(drawn - printed),
              `${label} ${gender} ${ageMonths}m 第 ${percentile} 百分位應該是 ${printed}，畫出 ${drawn.toFixed(4)}`,
            ).toBeLessThan(slack);
          });
        }
      });
    }
  }

  it('曲線與百分位互為反函數', () => {
    // 兩條路徑各自對過 WHO 還不夠：它們必須是同一條曲線的兩個方向。
    for (const gender of ['male', 'female'] as Gender[]) {
      for (const type of [
        'weight',
        'height',
        'headCircumference',
      ] as MeasurementType[]) {
        for (const ageMonths of [0, 6, 18, 24, 36]) {
          for (const percentile of [3, 15, 50, 85, 97]) {
            const value = getPercentileValue(
              getWHOStandard(ageMonths, type, gender),
              percentile,
            );

            const back = calculatePercentile(
              calculateZScore({
                measurement: value,
                ageMonths: ageMonths,
                measurementType: type,
                gender: gender,
              }),
            );

            expect(
              back,
              `${type} ${gender} ${ageMonths}m P${percentile}`,
            ).toBeCloseTo(percentile, 1);
          }
        }
      }
    }
  });

  it('L 趨近 0 換公式時，跳動小到秤不出來', () => {
    /**
     * LMS 在 L=0 要換公式：X = M·(1+L·S·z)^(1/L) 的極限是 M·exp(S·z)。
     * 程式用 |L| < 1e-4 切換，而插值出來的 L 真的會掃過 0——女生體重在
     * 3.89 個月、男生體重在 21.51 個月，前者正是 LittleSteps 的主要年齡帶。
     *
     * 兩個公式在門檻上不會完全相等：展開後差 exp(−L·(S·z)²/2)，在 |L|=1e-4
     * 時是 2e-6 的相對誤差，也就是九公斤的孩子差 0.02 公克。所以判準是
     * 「跳動小到秤不出來」，不是「完全連續」。
     *
     * 前兩版判準都寫錯，而且都是被自己的測試擋下來的：先用「數值變化要小」，
     * 量到的是四個月大一個月長半公斤的正常成長；再用「斜率差千分之一」，
     * 量到的是上面那個 0.02 公克的極限誤差。兩次都是判準離題，不是程式有錯。
     */
    const NEGLIGIBLE_KG = 0.001; // 一公克

    for (const [gender, crossing] of [
      ['female', 3.89],
      ['male', 21.51],
    ] as Array<[Gender, number]>) {
      const step = 0.02;
      const ages = [-2, -1, 0, 1, 2].map((k) => crossing + k * step);

      const values = ages.map((ageMonths) =>
        getPercentileValue(getWHOStandard(ageMonths, 'weight', gender), 3),
      );

      // 真的有掃過切換門檻，否則這個測試是空的
      expect(
        ages.some(
          (ageMonths) =>
            Math.abs(getWHOStandard(ageMonths, 'weight', gender).L) < 0.0001,
        ),
        `${gender} 沒有掃過 L≈0`,
      ).toBe(true);

      // 曲線必須遞增：換公式不能讓孩子在某個月齡「變輕」
      for (let i = 1; i < values.length; i += 1) {
        expect(values[i], `${gender} 在 ${ages[i]} 個月倒退`).toBeGreaterThan(
          values[i - 1],
        );
      }

      // 二階差分把「彎折」量出來：平滑曲線在 0.02 個月的窗內接近 0，
      // 換公式造成的那一格也遠小於一公克。真的斷掉會是好幾百公克。
      for (let i = 1; i < values.length - 1; i += 1) {
        const bend = Math.abs(values[i + 1] - 2 * values[i] + values[i - 1]);

        expect(
          bend,
          `${gender} 在 ${ages[i]} 個月彎折 ${(bend * 1000).toFixed(3)} 公克`,
        ).toBeLessThan(NEGLIGIBLE_KG);
      }
    }
  });

  it('L 正好是 0 時走極限公式，不會除以零', () => {
    // 上面那個測試證明了 L=7.8e-5 時冪次型還算得動，所以那個分支不是為了精度，
    // 是為了 L 恰好是 0 的除以零。插值出來的 L 會連續掃過 0，總有機會踩到。
    const atZero = { ageMonths: 12, L: 0, M: 9.6479, S: 0.10925 };

    const median = getPercentileValue(atZero, 50);

    expect(Number.isFinite(median)).toBe(true);
    expect(median).toBeCloseTo(atZero.M, 6);

    // L→0 的極限是 X = M·exp(S·z)
    const p3 = getPercentileValue(atZero, 3);

    expect(Number.isFinite(p3)).toBe(true);
    expect(p3).toBeCloseTo(atZero.M * Math.exp(atZero.S * -1.88079), 3);
  });

  it('百分位必須落在 0 到 100 之間，不能靜靜吐出 NaN', () => {
    const standard = getWHOStandard(12, 'weight', 'male');

    expect(() => getPercentileValue(standard, 0)).toThrow();
    expect(() => getPercentileValue(standard, 100)).toThrow();
  });
});
