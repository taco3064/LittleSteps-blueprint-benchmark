import { describe, expect, it } from 'vitest';
import type { MeasurementType } from '../../../knowledge/domain/referenceModels/index';
import {
  getPercentileValue,
  getWHOStandard,
  WHO_MAX_AGE_MONTHS,
  WHO_STANDARDS,
} from './data';

const MEASUREMENT_TYPES: MeasurementType[] = [
  'weight',
  'height',
  'headCircumference',
];

const GENDERS = ['male', 'female'] as const;

describe('growthChartData', () => {
  describe('getWHOStandard', () => {
    it('should return weight standards for male at 6 months', () => {
      const standard = getWHOStandard(6, 'weight', 'male');

      expect(standard).toBeDefined();
      expect(standard.ageMonths).toBe(6);
      expect(standard.L).toBeDefined();
      expect(standard.M).toBeDefined(); // Median (50th percentile)
      expect(standard.S).toBeDefined(); // Standard deviation
    });

    it('should return different values for male vs female', () => {
      const maleStandard = getWHOStandard(6, 'weight', 'male');
      const femaleStandard = getWHOStandard(6, 'weight', 'female');

      // Males typically have slightly higher median weight
      expect(maleStandard.M).toBeGreaterThan(femaleStandard.M);
    });

    it('should return height standards', () => {
      const standard = getWHOStandard(12, 'height', 'male');

      expect(standard).toBeDefined();
      expect(standard.M).toBeGreaterThan(70); // 12-month-old should be >70cm
      expect(standard.M).toBeLessThan(80); // But <80cm
    });

    it('should return head circumference standards', () => {
      const standard = getWHOStandard(6, 'headCircumference', 'male');

      expect(standard).toBeDefined();
      expect(standard.M).toBeGreaterThan(40); // 6-month-old head >40cm
      expect(standard.M).toBeLessThan(50); // But <50cm
    });

    it('should interpolate for non-exact months', () => {
      // WHO data might be monthly, test interpolation for 6.5 months
      const standard = getWHOStandard(6.5, 'weight', 'male');
      const standard6 = getWHOStandard(6, 'weight', 'male');
      const standard7 = getWHOStandard(7, 'weight', 'male');

      // Interpolated value should be between 6 and 7 months
      expect(standard.M).toBeGreaterThanOrEqual(standard6.M);
      expect(standard.M).toBeLessThanOrEqual(standard7.M);
    });

    it('should handle age 0 (birth)', () => {
      const standard = getWHOStandard(0, 'weight', 'male');

      expect(standard).toBeDefined();
      expect(standard.M).toBeGreaterThan(3); // Birth weight typically >3kg
      expect(standard.M).toBeLessThan(4); // But <4kg median
    });

    it('should handle age 24 months (2 years)', () => {
      const standard = getWHOStandard(24, 'height', 'male');

      expect(standard).toBeDefined();
      expect(standard.M).toBeGreaterThan(85); // 2-year-old >85cm
      expect(standard.M).toBeLessThan(90); // But <90cm
    });

    it('should handle age 36 months (3 years) for every table', () => {
      for (const type of MEASUREMENT_TYPES) {
        for (const gender of GENDERS) {
          const standard = getWHOStandard(36, type, gender);

          expect(standard.ageMonths).toBe(36);
          expect(standard.M).toBeGreaterThan(0);
          expect(standard.S).toBeGreaterThan(0);
        }
      }
    });

    it('should use standing height-for-age from 24 months', () => {
      // 這個測試原本斷言 24→27 的增幅小於 21→24，把「24 個月那一列是身長、
      // 27 個月那一列是身高」當成正確行為記了下來。描述是對的，結論不對：
      // 那代表 24 到 27 個月之間的插值橫跨兩套標準，25 個月大的孩子拿到一條
      // 兩邊都不認的曲線。現在 24 個月起直接改用站姿身高表。
      const male24 = getWHOStandard(24, 'height', 'male');
      const male27 = getWHOStandard(27, 'height', 'male');

      // 24 與 27 都在站姿身高表上，插值不再跨標準。
      expect(male24.M).toBeCloseTo(87.1303, 4);
      expect(male27.M).toBeCloseTo(89.6197, 4);

      // 24 個月前一刻仍是躺姿身長，比站姿高約 0.67 公分。
      expect(getWHOStandard(23.99, 'height', 'male').M - male24.M).toBeGreaterThan(
        0.6,
      );

      // 3-year-old boy median standing height, WHO hfa 2-5y month 36
      expect(getWHOStandard(36, 'height', 'male').M).toBeCloseTo(96.0835, 4);
      expect(getWHOStandard(36, 'height', 'female').M).toBeCloseTo(95.0515, 4);
    });

    it('should throw error above 36 months', () => {
      // WHO tables in this module stop at 36 months
      expect(() => {
        getWHOStandard(37, 'weight', 'male');
      }).toThrow('Age out of range');

      expect(() => {
        getWHOStandard(60, 'height', 'female');
      }).toThrow('Age out of range');

      expect(() => {
        getWHOStandard(-1, 'weight', 'male');
      }).toThrow('Age out of range');
    });
  });

  describe('getPercentileValue', () => {
    it('should return correct value for 50th percentile (median)', () => {
      const standard = getWHOStandard(6, 'weight', 'male');
      const p50 = getPercentileValue(standard, 50);

      // 50th percentile should equal the median (M)
      expect(p50).toBeCloseTo(standard.M, 1);
    });

    it('should return values for 3rd percentile', () => {
      const standard = getWHOStandard(6, 'weight', 'male');
      const p3 = getPercentileValue(standard, 3);

      // 3rd percentile should be significantly lower than median
      expect(p3).toBeLessThan(standard.M);
      expect(p3).toBeGreaterThan(standard.M * 0.8); // Sanity check
    });

    it('should return values for 97th percentile', () => {
      const standard = getWHOStandard(6, 'weight', 'male');
      const p97 = getPercentileValue(standard, 97);

      // 97th percentile should be significantly higher than median
      expect(p97).toBeGreaterThan(standard.M);
      expect(p97).toBeLessThan(standard.M * 1.3); // Sanity check
    });

    it('should return ordered values across percentiles', () => {
      const standard = getWHOStandard(12, 'weight', 'male');

      const p3 = getPercentileValue(standard, 3);
      const p15 = getPercentileValue(standard, 15);
      const p50 = getPercentileValue(standard, 50);
      const p85 = getPercentileValue(standard, 85);
      const p97 = getPercentileValue(standard, 97);

      // Should be in ascending order
      expect(p3).toBeLessThan(p15);
      expect(p15).toBeLessThan(p50);
      expect(p50).toBeLessThan(p85);
      expect(p85).toBeLessThan(p97);
    });

    it('should handle edge percentiles (1st and 99th)', () => {
      const standard = getWHOStandard(6, 'weight', 'male');

      const p1 = getPercentileValue(standard, 1);
      const p99 = getPercentileValue(standard, 99);

      expect(p1).toBeGreaterThan(0);
      expect(p99).toBeGreaterThan(p1);
    });
  });

  describe('Data Integrity', () => {
    it('should have complete data for all months 0-36', () => {
      for (let age = 0; age <= WHO_MAX_AGE_MONTHS; age++) {
        for (const type of MEASUREMENT_TYPES) {
          for (const gender of GENDERS) {
            const standard = getWHOStandard(age, type, gender);

            // A table that stops early falls back to its closest row, which
            // silently answers a different age than the one asked for.
            expect(standard.ageMonths).toBe(age);
            expect(standard.M).toBeGreaterThan(0);
            expect(standard.S).toBeGreaterThan(0);
          }
        }
      }
    });

    it('should have realistic median values', () => {
      // Birth weight (0 months)
      const birthWeight = getWHOStandard(0, 'weight', 'male');

      expect(birthWeight.M).toBeGreaterThan(3.0);
      expect(birthWeight.M).toBeLessThan(3.7);

      // 12-month weight
      const weight12mo = getWHOStandard(12, 'weight', 'male');

      expect(weight12mo.M).toBeGreaterThan(9);
      expect(weight12mo.M).toBeLessThan(10.5);

      // Birth length
      const birthLength = getWHOStandard(0, 'height', 'male');

      expect(birthLength.M).toBeGreaterThan(48);
      expect(birthLength.M).toBeLessThan(52);

      // 12-month height
      const height12mo = getWHOStandard(12, 'height', 'male');

      expect(height12mo.M).toBeGreaterThan(74);
      expect(height12mo.M).toBeLessThan(77);
    });

    it('should show growth over time', () => {
      // Weight should increase from 0 to 24 months
      const weight0 = getWHOStandard(0, 'weight', 'male');
      const weight6 = getWHOStandard(6, 'weight', 'male');
      const weight12 = getWHOStandard(12, 'weight', 'male');
      const weight24 = getWHOStandard(24, 'weight', 'male');

      expect(weight6.M).toBeGreaterThan(weight0.M);
      expect(weight12.M).toBeGreaterThan(weight6.M);
      expect(weight24.M).toBeGreaterThan(weight12.M);

      // Height should also increase
      const height0 = getWHOStandard(0, 'height', 'male');
      const height24 = getWHOStandard(24, 'height', 'male');

      expect(height24.M).toBeGreaterThan(height0.M);
      // At least 30cm growth in 2 years
      expect(height24.M - height0.M).toBeGreaterThan(30);
    });

    it('should tabulate the same ages in all six tables', () => {
      const tables = Object.entries(WHO_STANDARDS).flatMap(([gender, byType]) =>
        Object.entries(byType).map(([type, rows]) => ({
          name: `${gender}/${type}`,
          ages: rows.map((r) => r.ageMonths),
        })),
      );

      expect(tables).toHaveLength(6);

      const expectedAges = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 21, 24, 27, 30, 33, 36,
      ];

      for (const table of tables) {
        // Named per table so a failure says which indicator lags behind
        expect({ [table.name]: table.ages }).toEqual({
          [table.name]: expectedAges,
        });
      }

      // The guard in getWHOStandard must not outrun the data
      expect(expectedAges[expectedAges.length - 1]).toBe(WHO_MAX_AGE_MONTHS);
    });

    it('should have a strictly increasing median in every table', () => {
      for (const [gender, byType] of Object.entries(WHO_STANDARDS)) {
        for (const [type, rows] of Object.entries(byType)) {
          for (let i = 1; i < rows.length; i++) {
            const prev = rows[i - 1];
            const curr = rows[i];
            const where = `${gender}/${type} ${prev.ageMonths}->${curr.ageMonths}mo`;

            // Ascending ages are required by the interpolation in getWHOStandard
            expect({ [where]: curr.ageMonths > prev.ageMonths }).toEqual({
              [where]: true,
            });

            // A mistyped M shows up here as a median that stops growing
            expect({ [where]: curr.M > prev.M }).toEqual({ [where]: true });
          }
        }
      }
    });
  });

  describe('LMS Method Validation', () => {
    it('should have valid L, M, S parameters', () => {
      const standard = getWHOStandard(6, 'weight', 'male');

      // L (Box-Cox transformation): typically between -2 and 2
      expect(standard.L).toBeGreaterThan(-3);
      expect(standard.L).toBeLessThan(3);

      // M (Median): should be positive
      expect(standard.M).toBeGreaterThan(0);

      // S (Coefficient of variation): typically between 0.05 and 0.20
      expect(standard.S).toBeGreaterThan(0);
      expect(standard.S).toBeLessThan(0.3);
    });

    it('should produce consistent z-scores using LMS method', () => {
      const standard = getWHOStandard(6, 'weight', 'male');

      // Calculate z-score for median value (should be ~0)
      const { L, M, S } = standard;
      const measurement = M;

      // LMS formula: Z = ((X/M)^L - 1) / (L * S) when L ≠ 0
      let zScore: number;

      if (Math.abs(L) < 0.0001) {
        zScore = Math.log(measurement / M) / S;
      } else {
        zScore = (Math.pow(measurement / M, L) - 1) / (L * S);
      }

      expect(zScore).toBeCloseTo(0, 1);
    });
  });
});
