import { describe, it, expect } from 'vitest';
import type { AllergyReaction, FoodTrialInput, FoodTrialRecord } from '../records';
import { foodTrialChanges } from './foodTrialEdit';
import { trialDateSet, trialDatesOf } from '../foodTrialDates';

/**
 * The patch a food-trial edit sends. Every case here is a field that used to
 * be written on every save (clobbering the other caregiver) or one that could
 * not be cleared at all, because the form sends `undefined` and `undefined`
 * means "leave it alone" (#104).
 */

const stored = (overrides: Partial<FoodTrialRecord> = {}): FoodTrialRecord => ({
  id: 'f1',
  foodName: '米糊',
  category: '穀類',
  firstTriedDate: '2026-09-01',
  trialDates: { '2026-09-01': true },
  hasAllergy: false,
  preference: 'like',
  notes: '吃得很快',
  createdAt: '2026-09-01T08:00:00.000Z',
  ...overrides,
});

/** What the modal submits: the stored record as the form re-reads it. */
const submitted = (
  record: FoodTrialRecord,
  overrides: Partial<FoodTrialInput> = {},
): FoodTrialInput => ({
  foodName: record.foodName,
  category: record.category,
  firstTriedDate: record.firstTriedDate,
  trialDates: trialDateSet(trialDatesOf(record)),
  hasAllergy: record.hasAllergy,
  allergyReactions: record.allergyReactions,
  preference: record.preference,
  notes: record.notes,
  // The form stamps its own; the data layer stamps the one that counts.
  updatedAt: '2026-09-07T09:00:00.000Z',
  ...overrides,
});

const rash = (): AllergyReaction => ({
  type: 'rash',
  severity: 'mild',
  description: '臉頰有點紅',
  date: '2026-09-02',
});

describe('foodTrialChanges', () => {
  it('sends nothing when the parent opened the form and saved it untouched', () => {
    const before = stored();

    expect(foodTrialChanges(before, submitted(before))).toEqual({});
  });

  it('sends only the field the parent changed', () => {
    const before = stored();

    expect(
      foodTrialChanges(before, submitted(before, { preference: 'love' })),
    ).toEqual({
      preference: 'love',
    });
  });

  it('clears a note with null rather than dropping it from the patch', () => {
    const before = stored();

    // A cleared textarea reaches the page as `undefined`; omitting the key
    // would leave the old note in the database.
    expect(foodTrialChanges(before, submitted(before, { notes: undefined }))).toEqual(
      {
        notes: null,
      },
    );
  });

  it('clears a category with null', () => {
    const before = stored();

    expect(
      foodTrialChanges(before, submitted(before, { category: undefined })),
    ).toEqual({
      category: null,
    });
  });

  it('clears a preference with null', () => {
    const before = stored();

    expect(
      foodTrialChanges(before, submitted(before, { preference: undefined })),
    ).toEqual({
      preference: null,
    });
  });

  it('drops the stored reactions when the allergy toggle goes off', () => {
    const before = stored({ hasAllergy: true, allergyReactions: [rash()] });

    expect(
      foodTrialChanges(
        before,
        submitted(before, { hasAllergy: false, allergyReactions: undefined }),
      ),
    ).toEqual({ hasAllergy: false, allergyReactions: null });
  });

  it('does not re-send an allergy list the parent never touched', () => {
    // The list arrives back as a fresh array with the blank note spelled
    // `undefined` instead of absent. Compared by identity it looks changed,
    // and re-sending replaces the whole leaf — taking out any reaction the
    // other caregiver added in the meantime.
    const before = stored({
      hasAllergy: true,
      allergyReactions: [{ type: 'rash', severity: 'mild', date: '2026-09-02' }],
    });

    const next = submitted(before, {
      allergyReactions: [
        {
          type: 'rash',
          severity: 'mild',
          description: undefined,
          date: '2026-09-02',
        },
      ],
    });

    expect(foodTrialChanges(before, next)).toEqual({});
  });

  it('sends the whole list as one leaf when a reaction is added', () => {
    const before = stored({ hasAllergy: true, allergyReactions: [rash()] });

    const added: AllergyReaction = {
      type: 'cough',
      severity: 'moderate',
      date: '2026-09-05',
    };

    expect(
      foodTrialChanges(
        before,
        submitted(before, { allergyReactions: [rash(), added] }),
      ),
    ).toEqual({ allergyReactions: [rash(), added] });
  });

  it('never diffs id, createdAt or updatedAt', () => {
    const before = stored();
    const next = submitted(before, { updatedAt: '2030-01-01T00:00:00.000Z' });

    expect(Object.keys(foodTrialChanges(before, next))).toEqual([]);
  });

  it('writes one leaf per added or removed day and leaves the rest alone', () => {
    const before = stored({ trialDates: { '2026-09-01': true, '2026-09-02': true } });

    const next = submitted(before, {
      trialDates: trialDateSet(['2026-09-02', '2026-09-06']),
    });

    expect(foodTrialChanges(before, next)).toEqual({
      trialDates: { '2026-09-01': null, '2026-09-06': true },
    });
  });

  it('removes a legacy index key by name when that day goes', () => {
    const before = stored({ trialDates: ['2026-09-01', '2026-09-02'] });
    const next = submitted(before, { trialDates: trialDateSet(['2026-09-02']) });

    expect(foodTrialChanges(before, next)).toEqual({ trialDates: { 0: null } });
  });

  it('leaves trialDates out entirely when the days are unchanged', () => {
    const before = stored({ trialDates: ['2026-09-01', '2026-09-02'] });

    expect(foodTrialChanges(before, submitted(before, { notes: '改一下' }))).toEqual({
      notes: '改一下',
    });
  });
});
