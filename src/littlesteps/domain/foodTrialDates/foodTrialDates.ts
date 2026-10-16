import type {
  FoodTrialRecord,
  StoredTrialDates,
  TrialDatePatch,
  TrialDateSet,
} from '~app/family/domain/familyRecords';

/**
 * The one place that knows what `trialDates` looks like in the database.
 *
 * It started as an array of `YYYY-MM-DD` strings, which the database stores
 * as an object keyed by index. Appending a day meant rewriting the whole
 * array, and a child is shared by design: two caregivers pressing "record
 * today" on the same food each replayed their own copy, and the second one
 * to land erased the first (#89). New rows keep the dates as a set,
 * `{ '2026-09-06': true }`, so a day is one leaf that `update()` merges.
 *
 * Legacy rows are never migrated, and a leaf write onto one leaves both key
 * shapes side by side: `{ 0: '2026-09-01', '2026-09-06': true }`. Every
 * reader goes through {@link trialDatesOf}, and every writer builds its
 * patch with {@link trialDatePatch}, so no consumer needs to know which of
 * the three shapes it holds.
 */

/** Sorted, deduplicated dates from whatever shape the record holds. */
export function trialDatesOf(record: Pick<FoodTrialRecord, 'trialDates'>): string[] {
  const dates = new Set<string>();

  for (const [key, value] of entriesOf(record.trialDates)) {
    const date = dateOf(key, value);

    if (date !== undefined) {
      dates.add(date);
    }
  }

  return [...dates].sort();
}

/** The write shape for a new record: each date keyed to `true`. */
export function trialDateSet(dates: Iterable<string>): TrialDateSet {
  const set: TrialDateSet = {};

  for (const date of dates) {
    set[date] = true;
  }

  return set;
}

/**
 * The smallest set of leaf writes that turns `stored` into `next`.
 *
 * A date already present — under a date key or a legacy index — is not
 * written again. That is what keeps a save from a stale form from putting
 * back a day the other caregiver removed in the meantime, and it is why a
 * legacy index is left alone until the day it names is removed, when every
 * key naming that day goes to `null`.
 */
export function trialDatePatch(
  stored: StoredTrialDates | undefined,
  next: Iterable<string>,
): TrialDatePatch {
  const wanted = new Set(next);
  const present = new Set<string>();
  const patch: TrialDatePatch = {};

  for (const [key, value] of entriesOf(stored)) {
    const date = dateOf(key, value);

    if (date === undefined) {
      continue;
    }

    if (wanted.has(date)) {
      present.add(date);
    } else {
      patch[key] = null;
    }
  }

  for (const date of wanted) {
    if (!present.has(date)) {
      patch[date] = true;
    }
  }

  return patch;
}

function entriesOf(stored: StoredTrialDates | undefined): [string, unknown][] {
  if (!stored || typeof stored !== 'object') {
    return [];
  }

  return Object.entries(stored);
}

/**
 * A key holding `true` is a date key; a key holding a string is a legacy
 * index and the string is the date. Anything else — a hole, a number, a
 * `false` — is not a day and is skipped rather than rendered.
 */
function dateOf(key: string, value: unknown): string | undefined {
  if (value === true) {
    return key;
  }

  if (typeof value === 'string') {
    return value;
  }

  return undefined;
}
