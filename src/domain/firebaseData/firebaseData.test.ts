import { describe, it, expect } from 'vitest';
import { changedFields, removeUndefined, toUpdatePaths } from './firebaseData';

/**
 * These two functions are the hinge every daily-log write turns on: together
 * they decide which leaves of a shared child's record a save touches. Getting
 * them wrong is silent in both directions — writing too much destroys the other
 * caregiver's edit, writing too little drops the parent's own.
 *
 * They were reachable only through a React hook test until now, which is the
 * one shape where a defect can hide behind the harness rather than the code.
 * Every case here is a shape the daily log can actually produce, or one a
 * caller in this repo would plausibly hand them next.
 */

describe('changedFields', () => {
  it('reports only what differs, so an untouched field is never written', () => {
    // The whole point: dad's patch cannot carry mum's field, so it cannot
    // overwrite what she changed while his form was open.
    const before = { feedingType: 'formula', amount: 120, notes: 'ok' };
    const next = { feedingType: 'formula', amount: 150, notes: 'ok' };

    expect(changedFields(before, next)).toEqual({ amount: 150 });
  });

  it('is empty when nothing moved', () => {
    expect(changedFields({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toEqual({});
  });

  it('turns a cleared field into null rather than dropping it', () => {
    // Dropping it leaves the old value in the database, so a note the parent
    // deleted comes back on the next listener push.
    expect(changedFields({ notes: 'oops' }, {})).toEqual({ notes: null });

    expect(changedFields({ notes: 'oops' }, { notes: undefined })).toEqual({
      notes: null,
    });
  });

  it('does not report a field that was already absent', () => {
    // null and undefined both mean "no value here", so neither is a change to
    // the other. Reporting one would write a null nobody asked for.
    expect(changedFields({ a: null }, {})).toEqual({});
    expect(changedFields({}, { a: null })).toEqual({});
    expect(changedFields({ a: undefined }, { a: null })).toEqual({});
  });

  it('treats 0 and the empty string as values, not as emptiness', () => {
    // nightWakings: 0 is "the parent said none", which is not the same as
    // never having been asked — the timeline renders those differently.
    expect(changedFields({ nightWakings: 2 }, { nightWakings: 0 })).toEqual({
      nightWakings: 0,
    });

    expect(changedFields({ nightWakings: 0 }, {})).toEqual({ nightWakings: null });
    expect(changedFields({ notes: 'x' }, { notes: '' })).toEqual({ notes: '' });
  });

  it('descends into a nested object and reports only the leaves that moved', () => {
    expect(changedFields({ data: { a: 1, b: 2 } }, { data: { a: 1, b: 3 } })).toEqual(
      {
        data: { b: 3 },
      },
    );
  });

  it('omits a nested object whose leaves are all unchanged', () => {
    // An empty nested object would otherwise flatten to nothing and still make
    // the patch look non-empty, defeating the no-op check.
    expect(changedFields({ data: { a: 1 } }, { data: { a: 1 } })).toEqual({});
  });

  it('replaces the whole field when the shape changes on either side', () => {
    expect(changedFields({ a: { b: 1 } }, { a: 5 })).toEqual({ a: 5 });
    expect(changedFields({ a: 5 }, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
  });

  it('nulls every field of the old shape when a log changes type', () => {
    // A feeding edited into a sleep must not leave amount and feedingType
    // behind under the new shape, or the row renders as both.
    const before = { feedingType: 'formula', amount: 120 };
    const next = { startTime: '2026-06-15T13:00:00.000Z', duration: 80 };

    expect(changedFields(before, next)).toEqual({
      feedingType: null,
      amount: null,
      startTime: '2026-06-15T13:00:00.000Z',
      duration: 80,
    });
  });

  it('compares arrays by identity, which is why the JSDoc says so', () => {
    // Not a bug today -- no daily-log field holds an array -- but pinned so the
    // behaviour is a decision rather than a surprise for the next caller.
    expect(changedFields({ a: [1, 2] }, { a: [1, 2] })).toEqual({ a: [1, 2] });
  });
});

describe('toUpdatePaths', () => {
  it('flattens a nested patch to the leaf paths update() merges on', () => {
    // `{ data: { nightWakings: 2 } }` handed to update() replaces the whole
    // data node; `data/nightWakings` touches the one leaf.
    expect(toUpdatePaths({ data: { nightWakings: 2 } })).toEqual({
      'data/nightWakings': 2,
    });
  });

  it('keeps top-level fields at the top level', () => {
    expect(toUpdatePaths({ timestamp: 'x', data: { amount: 1 } })).toEqual({
      timestamp: 'x',
      'data/amount': 1,
    });
  });

  it('keeps null, because null is how Realtime Database clears a field', () => {
    expect(toUpdatePaths({ data: { notes: null } })).toEqual({ 'data/notes': null });
  });

  it('drops undefined, which means "leave this alone"', () => {
    // Realtime Database rejects undefined outright, so this is also what keeps
    // an optional field that was never filled in from throwing at the write.
    expect(toUpdatePaths({ data: { notes: undefined, amount: 1 } })).toEqual({
      'data/amount': 1,
    });
  });

  it(
    'produces nothing for an empty patch or one that is undefined all '
    + 'the way down',
    () => {
      // This is what lets updateDailyLog skip the write entirely rather than
      // bumping updatedAt for a save that changed nothing.
      expect(toUpdatePaths({})).toEqual({});
      expect(toUpdatePaths({ data: {} })).toEqual({});
      expect(toUpdatePaths({ data: { notes: undefined } })).toEqual({});
    },
  );

  it('writes an array to one leaf rather than per index', () => {
    expect(toUpdatePaths({ a: [1, 2] })).toEqual({ a: [1, 2] });
  });
});

describe('removeUndefined', () => {
  it('strips undefined at every depth, but keeps null', () => {
    // Still used by fifteen other write paths. Pinned here because the daily
    // log stopped using it, and a function nobody tests is a function that
    // drifts.
    expect(
      removeUndefined({ a: 1, b: undefined, c: { d: undefined, e: null } }),
    ).toEqual({
      a: 1,
      c: { e: null },
    });
  });

  it('cleans the objects inside an array, and keeps the array an array', () => {
    // #91: the food trial form sends `allergyReactions: [{ description:
    // undefined }]` whenever the parent leaves the note blank, and the SDK
    // refuses the whole write over that one property. toStrictEqual, because
    // toEqual treats a key holding undefined as absent and would pass either way.
    const cleaned = removeUndefined({ list: [{ a: 1, b: undefined }] });

    expect(cleaned).toStrictEqual({ list: [{ a: 1 }] });
    expect(Array.isArray(cleaned.list)).toBe(true);
  });

  it('descends through an object inside an array inside an object', () => {
    const cleaned = removeUndefined({
      list: [{ inner: { rows: [{ a: undefined, b: 2 }] } }],
    });

    expect(cleaned).toStrictEqual({ list: [{ inner: { rows: [{ b: 2 }] } }] });
  });

  it('leaves an array of primitives as it was', () => {
    // trialDates is written as one leaf; the elements and their order are the record.
    const cleaned = removeUndefined({
      dates: ['2026-01-01', '2026-01-02'],
      n: [0, null],
    });

    expect(cleaned).toStrictEqual({
      dates: ['2026-01-01', '2026-01-02'],
      n: [0, null],
    });

    expect(Array.isArray(cleaned.dates)).toBe(true);
  });

  it('does not drop an element that is itself undefined, so indices do not shift', () => {
    // The database stores an array as an object keyed by index. Removing the
    // element would quietly turn reaction 2 into reaction 1; leaving it makes
    // the SDK reject the write and name the index, which is the useful failure.
    const cleaned = removeUndefined({ list: [1, undefined, 3] });

    expect(cleaned.list).toHaveLength(3);
    expect(cleaned.list?.[1]).toBeUndefined();
    expect(cleaned.list?.[2]).toBe(3);
  });
});
