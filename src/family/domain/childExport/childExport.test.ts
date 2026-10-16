import { describe, expect, it } from 'vitest';
import type {
  ChildProfile,
  DailyLog,
  DiaryEntry,
  GrowthRecord,
} from '../familyRecords/index';
import { buildChildExport, childExportFilename, type ChildExportSource } from './index';

/**
 * The export is the copy a parent keeps after they stop using the app, so the
 * failure that matters is a silent one: a field that stops being written, a
 * collection that turns into a missing key, or a name that makes the file
 * undownloadable. Every assertion here is aimed at one of those.
 */

/** Every field a child node can carry, so a dropped one shows up as a failure. */
const child: ChildProfile = {
  id: 'c1',
  name: '小豆',
  birthday: '2025-02-27',
  gender: 'female',
  gestationalAgeWeeks: 33,
  gestationalAgeDays: 4,
  milestoneProgress: { 'roll-over': { achieved: true, achievedDate: '2025-06-01' } },
  vaccineProgress: {
    bcg: { doses: { 1: { administered: true, administeredDate: '2025-03-05' } } },
  },
  foodTrackingProgress: {
    f1: {
      id: 'f1',
      foodName: '米糊',
      firstTriedDate: '2025-09-01',
      trialDates: { '2025-09-01': true },
      hasAllergy: false,
      createdAt: '2025-09-01T00:00:00.000Z',
    },
  },
  developmentProgress: { 'walk-steady': { achieved: false } },
  careTaskProgress: {
    'fluoride-1': {
      taskId: 'fluoride-1',
      completedDate: '2025-08-01',
      location: '某某牙醫',
    },
  },
  toothProgress: { 'lower-left-1': { erupted: true, eruptedDate: '2025-08-20' } },
  isPregnancy: false,
  pregnancyData: {
    childId: 'c1',
    dueDate: '2025-04-20',
    lastPeriodDate: '2024-07-14',
    status: 'archived',
  },
  prenatalProgress: {
    'week-12': { completedDate: '2024-10-05', clinicName: '某某婦產科' },
  },
  createdAt: '2025-02-27T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true, u2: true },
  joinOpen: false,
};

const dailyLogs: DailyLog[] = [
  {
    id: 'l1',
    childId: 'c1',
    type: 'feeding',
    timestamp: '2025-09-02T08:00:00.000Z',
    data: { feedingType: 'formula', amount: 120 },
    createdAt: '2025-09-02T08:00:00.000Z',
    createdBy: 'u2',
    createdByName: '爸爸',
  },
  {
    id: 'l2',
    childId: 'c1',
    type: 'diaper',
    timestamp: '2025-09-01T08:00:00.000Z',
    data: { type: 'both', consistency: 'soft' },
    createdAt: '2025-09-01T08:00:00.000Z',
  },
];

const diaryEntries: DiaryEntry[] = [
  {
    id: 'd1',
    childId: 'c1',
    date: '2025-09-02',
    content: '第一次翻身',
    mood: 'happy',
    createdAt: '2025-09-02T10:00:00.000Z',
  },
];

const growthRecords: GrowthRecord[] = [
  {
    id: 'g1',
    childId: 'c1',
    date: '2025-09-01',
    weight: 6.4,
    height: 62,
    headCircumference: 40.5,
    notes: '健兒門診',
  },
];

const source: ChildExportSource = { child, dailyLogs, diaryEntries, growthRecords };

const NOW = new Date('2026-09-07T04:30:00.000Z');

describe('buildChildExport', () => {
  it('carries every child field except members', () => {
    const exported = buildChildExport(source, NOW);

    // Against the fixture's own key set, not a hand-written list: a field added
    // to ChildProfile later must not be able to fall out of the export unnoticed.
    const expected = Object.keys(child).filter((key) => key !== 'members');

    expect(Object.keys(exported.child).sort()).toEqual(expected.sort());

    for (const key of expected) {
      expect(exported.child[key as keyof typeof exported.child]).toEqual(
        child[key as keyof ChildProfile],
      );
    }
  });

  it(
    'drops members: it is a list of other people\'s'
    + ' accounts, not the parent\'s data',
    () => {
      const exported = buildChildExport(source, NOW);

      expect('members' in exported.child).toBe(false);
      // The co-parent's uid is only in members, so the serialised file must not
      // name them anywhere the child node used to.
      expect(Object.values(exported.child)).not.toContainEqual(child.members);
    },
  );

  it('carries every entry of all three collections', () => {
    const exported = buildChildExport(source, NOW);

    expect(exported.dailyLogs).toEqual(dailyLogs);
    expect(exported.diaryEntries).toEqual(diaryEntries);
    expect(exported.growthRecords).toEqual(growthRecords);
  });

  it('names itself and the moment it was taken', () => {
    const exported = buildChildExport(source, NOW);

    expect(exported.app).toBe('LittleSteps');
    expect(exported.exportedAt).toBe(NOW.toISOString());
  });

  it(
    'survives JSON round-tripping unchanged, becau' + 'se that is how it is delivered',
    () => {
      const exported = buildChildExport(source, NOW);

      expect(JSON.parse(JSON.stringify(exported))).toEqual(exported);
    },
  );

  it('gives a child with no records empty arrays, never missing keys', () => {
    const exported = buildChildExport(
      { child, dailyLogs: [], diaryEntries: [], growthRecords: [] },
      NOW,
    );

    const parsed = JSON.parse(JSON.stringify(exported));

    expect(parsed.dailyLogs).toEqual([]);
    expect(parsed.diaryEntries).toEqual([]);
    expect(parsed.growthRecords).toEqual([]);
  });
});

describe('childExportFilename', () => {
  it('names the file after the child and the local day', () => {
    // 04:30 UTC is already lunchtime in Taipei; the parent's day is the one
    // that belongs in the name.
    expect(childExportFilename('小豆', NOW)).toBe('littlesteps-小豆-2026-09-07.json');
  });

  it('takes the reserved characters out of a free-text name', () => {
    expect(childExportFilename('小豆/小樹', NOW)).toBe(
      'littlesteps-小豆-小樹-2026-09-07.json',
    );

    expect(childExportFilename('a:b*c?d"e<f>g|h', NOW)).toBe(
      'littlesteps-a-b-c-d-e-f-g-h-2026-09-07.json',
    );
  });

  it('collapses whitespace rather than shipping a filename with spaces in it', () => {
    expect(childExportFilename('  Baby   Bean  ', NOW)).toBe(
      'littlesteps-Baby-Bean-2026-09-07.json',
    );
  });

  it(
    'never starts the name with a dot, which hides' + ' the file the parent just saved',
    () => {
      expect(childExportFilename('...小豆.', NOW)).toBe(
        'littlesteps-小豆-2026-09-07.json',
      );
    },
  );

  it('falls back to a word rather than producing a nameless file', () => {
    expect(childExportFilename('///', NOW)).toBe('littlesteps-寶寶-2026-09-07.json');
  });
});
