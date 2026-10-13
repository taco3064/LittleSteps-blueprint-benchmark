import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  CORRECTION_UNTIL_MONTHS,
  correctedAgeMonths,
  correctionDays,
  gestationalAgeLabel,
  growthAgeMonths,
  isCorrecting,
} from './correctedAge';

// A term baby and a 32+0 baby born the same day. Every case below reads the
// clock, so freeze it.
const BIRTHDAY = '2026-01-15';

function at(date: string) {
  vi.setSystemTime(new Date(`${date}T12:00:00`));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('correctionDays', () => {
  it('is zero for a child with no gestational age recorded', () => {
    expect(correctionDays({ birthday: BIRTHDAY })).toBe(0);
  });

  it('is zero at 37 weeks, the term boundary', () => {
    expect(correctionDays({ birthday: BIRTHDAY, gestationalAgeWeeks: 37 })).toBe(0);
  });

  it('is zero for a 38-week baby even though 40 weeks is the reference', () => {
    // 280 - 266 = 14, but a 38-week birth is term and needs no correction.
    expect(correctionDays({ birthday: BIRTHDAY, gestationalAgeWeeks: 38 })).toBe(0);
  });

  it('is the gap to 40 weeks for a preterm baby', () => {
    vi.useFakeTimers();
    at('2026-07-15');
    expect(correctionDays({ birthday: BIRTHDAY, gestationalAgeWeeks: 32 })).toBe(56);

    expect(
      correctionDays({
        birthday: BIRTHDAY,
        gestationalAgeWeeks: 32,
        gestationalAgeDays: 3,
      }),
    ).toBe(53);

    // 36+6 is 258 days, i.e. 22 days short of the 280-day reference.
    expect(
      correctionDays({
        birthday: BIRTHDAY,
        gestationalAgeWeeks: 36,
        gestationalAgeDays: 6,
      }),
    ).toBe(22);
  });

  it('is zero once the corrected age passes the correction window', () => {
    vi.useFakeTimers();
    // 32+0 means a 56-day shift. Corrected 24 months lands ~26 months
    // chronological; a day past that stops correcting.
    at('2028-01-15'); // exactly 24 months chronological -> still correcting
    expect(correctionDays({ birthday: BIRTHDAY, gestationalAgeWeeks: 32 })).toBe(56);

    at('2028-04-15'); // 27 months chronological -> corrected 25.2 months
    expect(correctionDays({ birthday: BIRTHDAY, gestationalAgeWeeks: 32 })).toBe(0);
  });

  it('ignores values outside the plausible range instead of guessing', () => {
    expect(correctionDays({ birthday: BIRTHDAY, gestationalAgeWeeks: 12 })).toBe(0);
    expect(correctionDays({ birthday: BIRTHDAY, gestationalAgeWeeks: 45 })).toBe(0);

    expect(
      correctionDays({
        birthday: BIRTHDAY,
        gestationalAgeWeeks: 32,
        gestationalAgeDays: 9,
      }),
    ).toBe(0);
  });
});

describe('correctedAgeMonths', () => {
  it('equals the chronological age for a term baby', () => {
    vi.useFakeTimers();
    at('2026-07-15');
    expect(correctedAgeMonths({ birthday: BIRTHDAY })).toBe(6);

    expect(correctedAgeMonths({ birthday: BIRTHDAY, gestationalAgeWeeks: 40 })).toBe(
      6,
    );
  });

  it('subtracts the prematurity for a preterm baby', () => {
    vi.useFakeTimers();
    at('2026-07-15');

    // Chronological 6 months; 8 weeks early -> 4 months corrected.
    expect(correctedAgeMonths({ birthday: BIRTHDAY, gestationalAgeWeeks: 32 })).toBe(
      4,
    );
  });

  it('never returns a negative age in the first weeks of life', () => {
    vi.useFakeTimers();
    at('2026-01-20');

    expect(correctedAgeMonths({ birthday: BIRTHDAY, gestationalAgeWeeks: 28 })).toBe(
      0,
    );
  });

  it('returns the chronological age again once correction stops', () => {
    vi.useFakeTimers();
    at('2029-01-15'); // 36 months chronological, well past the window

    expect(correctedAgeMonths({ birthday: BIRTHDAY, gestationalAgeWeeks: 32 })).toBe(
      36,
    );
  });
});

describe('isCorrecting', () => {
  it('is false for a term baby and true for a preterm one inside the window', () => {
    vi.useFakeTimers();
    at('2026-07-15');
    expect(isCorrecting({ birthday: BIRTHDAY })).toBe(false);
    expect(isCorrecting({ birthday: BIRTHDAY, gestationalAgeWeeks: 34 })).toBe(true);
  });

  it('turns off after the correction window so the label disappears', () => {
    vi.useFakeTimers();
    at(`2029-01-15`);
    expect(isCorrecting({ birthday: BIRTHDAY, gestationalAgeWeeks: 32 })).toBe(false);
    expect(CORRECTION_UNTIL_MONTHS).toBe(24);
  });
});

describe('growthAgeMonths', () => {
  it('matches the uncorrected fractional age for a term baby', () => {
    const record = new Date('2026-04-15T00:00:00');

    expect(growthAgeMonths({ birthday: BIRTHDAY }, record)).toBeCloseTo(3, 5);
  });

  it('uses the measurement date, not today, to decide the correction', () => {
    vi.useFakeTimers();
    // The child is 3 years old now, long past the correction window, but this
    // record was taken at 6 months chronological and must stay corrected.
    at('2029-06-01');
    const record = new Date('2026-07-15T00:00:00');

    // 2026-07-15 minus 56 days is 2026-05-20: four whole months plus 5/30.
    const months = growthAgeMonths(
      { birthday: BIRTHDAY, gestationalAgeWeeks: 32 },
      record,
    );

    expect(months).toBeCloseTo(4 + 5 / 30, 5);
  });
});

describe('gestationalAgeLabel', () => {
  it('reads back whole weeks and weeks with days', () => {
    expect(gestationalAgeLabel({ birthday: BIRTHDAY, gestationalAgeWeeks: 32 })).toBe(
      '出生 32 週',
    );

    expect(
      gestationalAgeLabel({
        birthday: BIRTHDAY,
        gestationalAgeWeeks: 32,
        gestationalAgeDays: 3,
      }),
    ).toBe('出生 32 週 3 天');
  });

  it('is null when there is nothing to report', () => {
    expect(gestationalAgeLabel({ birthday: BIRTHDAY })).toBeNull();

    expect(
      gestationalAgeLabel({ birthday: BIRTHDAY, gestationalAgeWeeks: 99 }),
    ).toBeNull();
  });
});
