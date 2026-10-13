import { describe, it, expect } from 'vitest';
import { trialDatePatch, trialDateSet, trialDatesOf } from './foodTrialDates';

/**
 * trialDates has two shapes in the database and, on a legacy node that has
 * been appended to, both at once. Every reader goes through trialDatesOf, so
 * these cases are the whole contract: whatever the node looks like, the UI
 * sees one sorted list of dates.
 */
describe('trialDatesOf', () => {
  it('is empty for a record with no trial dates', () => {
    expect(trialDatesOf({})).toEqual([]);
    expect(trialDatesOf({ trialDates: undefined })).toEqual([]);
    expect(trialDatesOf({ trialDates: [] })).toEqual([]);
    expect(trialDatesOf({ trialDates: {} })).toEqual([]);
  });

  it('reads the legacy array, sorted and deduplicated', () => {
    expect(
      trialDatesOf({ trialDates: ['2026-09-02', '2026-09-01', '2026-09-02'] }),
    ).toEqual(['2026-09-01', '2026-09-02']);
  });

  it('reads the legacy array as the database returns it, keyed by index', () => {
    expect(
      trialDatesOf({ trialDates: { 0: '2026-09-02', 1: '2026-09-01' } }),
    ).toEqual(['2026-09-01', '2026-09-02']);
  });

  it('reads the date-keyed set', () => {
    expect(
      trialDatesOf({ trialDates: { '2026-09-06': true, '2026-09-05': true } }),
    ).toEqual(['2026-09-05', '2026-09-06']);
  });

  it('reads a legacy node that has grown date keys beside its indices', () => {
    // A legacy array appended to with a leaf write is exactly this object.
    expect(
      trialDatesOf({
        trialDates: {
          0: '2026-09-01',
          1: '2026-09-02',
          '2026-09-06': true,
          '2026-09-02': true,
        },
      }),
    ).toEqual(['2026-09-01', '2026-09-02', '2026-09-06']);
  });

  it('skips a hole or a value of the wrong type rather than showing it as a day', () => {
    expect(
      trialDatesOf({
        trialDates: {
          0: '2026-09-01',
          1: null,
          2: 20260903,
          '2026-09-04': false,
        } as never,
      }),
    ).toEqual(['2026-09-01']);
  });
});

describe('trialDateSet', () => {
  it('keys each date to true, deduplicating', () => {
    expect(trialDateSet(['2026-09-02', '2026-09-01', '2026-09-02'])).toEqual({
      '2026-09-01': true,
      '2026-09-02': true,
    });
  });
});

/**
 * The patch is the minimum that turns what is stored into what the form
 * holds. It never re-asserts a date that is already there — under either
 * key — so a caregiver saving from a stale form cannot resurrect a date the
 * other one removed meanwhile, and a legacy index key is left alone until
 * the day it names is removed.
 */
describe('trialDatePatch', () => {
  it('adds a new date as one leaf and touches nothing else', () => {
    expect(
      trialDatePatch({ '2026-09-01': true }, ['2026-09-01', '2026-09-06']),
    ).toEqual({
      '2026-09-06': true,
    });
  });

  it('adds to a legacy array without rewriting its indices', () => {
    expect(
      trialDatePatch(
        ['2026-09-01', '2026-09-02'],
        ['2026-09-01', '2026-09-02', '2026-09-06'],
      ),
    ).toEqual({
      '2026-09-06': true,
    });
  });

  it('removes a legacy date by nulling its index', () => {
    expect(trialDatePatch(['2026-09-01', '2026-09-02'], ['2026-09-02'])).toEqual({
      0: null,
    });
  });

  it('removes a date key by nulling it', () => {
    expect(
      trialDatePatch({ '2026-09-01': true, '2026-09-02': true }, ['2026-09-02']),
    ).toEqual({
      '2026-09-01': null,
    });
  });

  it('nulls every key that names a removed date on a mixed node', () => {
    expect(
      trialDatePatch({ 0: '2026-09-01', 1: '2026-09-02', '2026-09-02': true }, [
        '2026-09-01',
      ]),
    ).toEqual({ 1: null, '2026-09-02': null });
  });

  it('is empty when nothing changed', () => {
    expect(trialDatePatch(['2026-09-01'], ['2026-09-01'])).toEqual({});
    expect(trialDatePatch({ '2026-09-01': true }, ['2026-09-01'])).toEqual({});
  });

  it('writes every date when nothing was stored', () => {
    expect(trialDatePatch(undefined, ['2026-09-02', '2026-09-01'])).toEqual({
      '2026-09-01': true,
      '2026-09-02': true,
    });
  });
});
