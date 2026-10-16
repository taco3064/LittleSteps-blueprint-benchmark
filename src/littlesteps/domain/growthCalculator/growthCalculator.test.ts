import { describe, expect, it } from 'vitest';
import {
  calculatePercentile,
  calculateZScore,
  getPercentileCategory,
} from './growthCalculator';

describe('growthCalculator', () => {
  describe('calculateZScore', () => {
    it('should calculate z-score correctly for weight', () => {
      // Boy, 6 months, 8kg (median is 7.9341kg for WHO standards)
      const zScore = calculateZScore({
        measurement: 8,
        ageMonths: 6,
        measurementType: 'weight',
        gender: 'male',
      });

      expect(zScore).toBeGreaterThan(-0.5);
      expect(zScore).toBeLessThan(0.5); // Should be close to median
    });

    it('should return positive z-score for above average measurements', () => {
      // Boy, 6 months, 10kg (well above median)
      const zScore = calculateZScore({
        measurement: 10,
        ageMonths: 6,
        measurementType: 'weight',
        gender: 'male',
      });

      expect(zScore).toBeGreaterThan(1);
    });

    it('should return negative z-score for below average measurements', () => {
      // Boy, 6 months, 6kg (below median)
      const zScore = calculateZScore({
        measurement: 6,
        ageMonths: 6,
        measurementType: 'weight',
        gender: 'male',
      });

      expect(zScore).toBeLessThan(-1);
    });

    it('should handle female gender correctly', () => {
      // Girl, 12 months, 9kg (median is ~9kg for WHO standards)
      const zScore = calculateZScore({
        measurement: 9,
        ageMonths: 12,
        measurementType: 'weight',
        gender: 'female',
      });

      expect(zScore).toBeCloseTo(0, 1);
    });

    it('should calculate for height measurements', () => {
      // Boy, 12 months, 76cm (median is 75.7488cm)
      const zScore = calculateZScore({
        measurement: 76,
        ageMonths: 12,
        measurementType: 'height',
        gender: 'male',
      });

      expect(zScore).toBeGreaterThan(-0.5);
      expect(zScore).toBeLessThan(0.5); // Should be close to median
    });

    it('should calculate for head circumference', () => {
      // Boy, 6 months, 43.5cm (median is 43.3306cm)
      const zScore = calculateZScore({
        measurement: 43.5,
        ageMonths: 6,
        measurementType: 'headCircumference',
        gender: 'male',
      });

      expect(zScore).toBeGreaterThan(-0.5);
      expect(zScore).toBeLessThan(0.5); // Should be close to median
    });
  });

  describe('calculatePercentile', () => {
    it('should calculate percentile from z-score', () => {
      // z-score of 0 should be 50th percentile
      const percentile = calculatePercentile(0);

      expect(percentile).toBeCloseTo(50, 0);
    });

    it('should return high percentile for positive z-score', () => {
      // z-score of 1 should be ~84th percentile
      const percentile = calculatePercentile(1);

      expect(percentile).toBeGreaterThan(80);
      expect(percentile).toBeLessThan(90);
    });

    it('should return low percentile for negative z-score', () => {
      // z-score of -1 should be ~16th percentile
      const percentile = calculatePercentile(-1);

      expect(percentile).toBeGreaterThan(10);
      expect(percentile).toBeLessThan(20);
    });

    it('should cap at 99.9 for very high z-scores', () => {
      const percentile = calculatePercentile(5);

      expect(percentile).toBeLessThanOrEqual(99.9);
    });

    it('should cap at 0.1 for very low z-scores', () => {
      const percentile = calculatePercentile(-5);

      expect(percentile).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('getPercentileCategory', () => {
    it('should categorize low percentile correctly', () => {
      const category = getPercentileCategory(10);

      expect(category).toBe('low'); // <15%
    });

    it('should categorize normal percentile correctly', () => {
      const category = getPercentileCategory(50);

      expect(category).toBe('normal'); // 15-85%
    });

    it('should categorize high percentile correctly', () => {
      const category = getPercentileCategory(90);

      expect(category).toBe('high'); // >85%
    });

    it('should handle edge cases at boundaries', () => {
      expect(getPercentileCategory(15)).toBe('normal');
      expect(getPercentileCategory(14.9)).toBe('low');
      expect(getPercentileCategory(85)).toBe('normal');
      expect(getPercentileCategory(85.1)).toBe('high');
    });
  });
});
