import { describe, it, expect } from 'vitest';
import { sleepRequirements, getSleepRequirementForAge } from './sleep';

/**
 * `sleepRequirements` is consumed by age resolvers (sleepAnalysis,
 * trendCalculator) that pick a band for a child's age in months. These tests
 * pin the invariants those resolvers rely on: the bands must tile the whole
 * supported age range without a gap or an overlap, so every age lands in
 * exactly one band.
 */
describe('sleepRequirements', () => {
  it('starts at birth and covers through 36 months', () => {
    expect(sleepRequirements[0].minMonths).toBe(0);
    expect(sleepRequirements[sleepRequirements.length - 1].maxMonths).toBe(36);
  });

  it('is ordered by age', () => {
    const starts = sleepRequirements.map((band) => band.minMonths);

    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  it('has bands that are contiguous with no gap or overlap', () => {
    for (const band of sleepRequirements) {
      expect(band.maxMonths).toBeGreaterThan(band.minMonths);
    }

    for (let i = 1; i < sleepRequirements.length; i++) {
      expect(sleepRequirements[i].minMonths).toBe(sleepRequirements[i - 1].maxMonths);
    }
  });

  it('resolves every whole month in 0-36 to exactly one band', () => {
    for (let months = 0; months < 36; months++) {
      const matches = sleepRequirements.filter(
        (band) => months >= band.minMonths && months < band.maxMonths,
      );

      expect(matches).toHaveLength(1);
    }
  });

  it('has non-empty hour fields on every band', () => {
    for (const band of sleepRequirements) {
      expect(band.id).not.toBe('');
      expect(band.ageRange).not.toBe('');
      expect(band.totalHours).not.toBe('');
      expect(band.daytimeHours).not.toBe('');
      expect(band.nighttimeHours).not.toBe('');
      expect(band.characteristics).not.toBe('');
    }
  });

  it('has unique ids', () => {
    const ids = sleepRequirements.map((band) => band.id);

    for (const id of ids) {
      expect(ids.filter((other) => other === id)).toHaveLength(1);
    }
  });

  it('covers toddlers up to 3 years old', () => {
    // LittleExplorer serves 1-3 year olds; the table used to stop at 2 years.
    expect(sleepRequirements.some((band) => band.ageRange === '2-3 歲')).toBe(true);
  });
});

describe('getSleepRequirementForAge', () => {
  it('selects the band whose age window contains the age', () => {
    expect(getSleepRequirementForAge(0).ageRange).toBe('0-1 個月');
    expect(getSleepRequirementForAge(2).ageRange).toBe('1-3 個月');
    expect(getSleepRequirementForAge(4).ageRange).toBe('3-6 個月');
    expect(getSleepRequirementForAge(9).ageRange).toBe('6-12 個月');
    expect(getSleepRequirementForAge(15).ageRange).toBe('1-1.5 歲');
    expect(getSleepRequirementForAge(20).ageRange).toBe('1.5-2 歲');
    expect(getSleepRequirementForAge(30).ageRange).toBe('2-3 歲');
  });

  it('switches band exactly at each lower bound', () => {
    for (const band of sleepRequirements) {
      expect(getSleepRequirementForAge(band.minMonths).id).toBe(band.id);
    }
  });

  it('clamps ages past the last band to the oldest band', () => {
    const oldest = sleepRequirements[sleepRequirements.length - 1];

    expect(getSleepRequirementForAge(36).id).toBe(oldest.id);
    expect(getSleepRequirementForAge(120).id).toBe(oldest.id);
  });

  it('clamps ages below the first band to the youngest band', () => {
    expect(getSleepRequirementForAge(-1).id).toBe(sleepRequirements[0].id);
  });
});
