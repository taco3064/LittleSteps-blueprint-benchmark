import { describe, it, expect, afterEach, vi } from 'vitest';
import { calculateAge, dueDateFromLmp, lmpFromDueDate } from './index';

/**
 * Builds an instant from *local* calendar fields (month is 1-based).
 *
 * `getCurrentDateTimeLocal`, `dateTimeLocalToISO` and `formatTime` all operate on
 * the local wall clock, so fixtures are pinned by local fields instead of a UTC
 * literal. That keeps every expectation exact no matter which timezone the test
 * runner sits in.
 */
const localDate = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  ms = 0,
): Date => new Date(year, month - 1, day, hours, minutes, seconds, ms);

describe('calculateAge', () => {
  const at = (year: number, month: number, day: number) => {
    vi.useFakeTimers();
    vi.setSystemTime(localDate(year, month, day, 12));
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it('計算整月數', () => {
    at(2026, 8, 27);
    expect(calculateAge('2024-08-27')).toBe(24);
    expect(calculateAge('2025-02-27')).toBe(18);
  });

  it('尚未過當月生日時不計入該月', () => {
    at(2026, 8, 26);
    expect(calculateAge('2024-08-27')).toBe(23);
  });

  it('月底出生的孩子不會在隔月一號就多一個月', () => {
    at(2026, 2, 1);
    expect(calculateAge('2026-01-31')).toBe(0);
  });

  it('尚未出生時回傳 0 而非負數', () => {
    at(2026, 8, 27);
    expect(calculateAge('2027-01-01')).toBe(0);
  });

  it('生日當天即進位', () => {
    at(2026, 8, 27);
    expect(calculateAge('2025-08-27')).toBe(12);
  });
});

describe('Naegele 預產期換算', () => {
  it('末次月經加 280 天為預產期', () => {
    expect(dueDateFromLmp('2026-01-01')).toBe('2026-10-08');
  });

  it('預產期回推 280 天為末次月經', () => {
    expect(lmpFromDueDate('2026-10-08')).toBe('2026-01-01');
  });

  it('兩者互為反函式', () => {
    for (const lmp of ['2026-01-31', '2026-02-28', '2024-02-29', '2026-12-15']) {
      expect(lmpFromDueDate(dueDateFromLmp(lmp)), lmp).toBe(lmp);
    }
  });

  it('跨月與跨年都正確，不會被月底天數影響', () => {
    // 2024 是閏年，2/29 存在；加 280 天應落在同年 12 月。
    expect(dueDateFromLmp('2024-02-29')).toBe('2024-12-05');
  });
});
