import { describe, it, expect } from 'vitest';
import { TODDLER_AGE_BANDS, bandForMonths } from './ageBands';

describe('bandForMonths', () => {
  it('每個年齡段的起始月齡都落在自己的段', () => {
    expect(bandForMonths(12)).toBe('12-15');
    expect(bandForMonths(15)).toBe('15-18');
    expect(bandForMonths(18)).toBe('18-24');
    expect(bandForMonths(24)).toBe('24-30');
    expect(bandForMonths(30)).toBe('30-36');
  });

  it('段內的月齡不會提前跳到下一段', () => {
    expect(bandForMonths(14)).toBe('12-15');
    expect(bandForMonths(17)).toBe('15-18');
    expect(bandForMonths(23)).toBe('18-24');
    expect(bandForMonths(29)).toBe('24-30');
    expect(bandForMonths(35)).toBe('30-36');
  });

  it('未滿 12 個月夾到第一段', () => {
    expect(bandForMonths(0)).toBe('12-15');
    expect(bandForMonths(11)).toBe('12-15');
  });

  it('滿 36 個月以上夾到最後一段', () => {
    expect(bandForMonths(36)).toBe('30-36');
    expect(bandForMonths(60)).toBe('30-36');
  });

  it('回傳值一定是有效的年齡段', () => {
    for (let months = 0; months <= 72; months++) {
      expect(TODDLER_AGE_BANDS).toContain(bandForMonths(months));
    }
  });
});
