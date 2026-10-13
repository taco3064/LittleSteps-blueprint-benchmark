import { describe, it, expect } from 'vitest';
import type { VaccineProgress, VaccineSchedule } from '../records';
import { buildVaccineIcs } from './vaccineCalendar';

const CRLF = '\r\n';

/**
 * Synthetic rows on purpose. The real schedule in `data/vaccines.ts` is edited
 * whenever the CDC changes a funding state, and a test that breaks on a data
 * correction tests the data, not the export.
 */
const schedule = (overrides: Partial<VaccineSchedule> = {}): VaccineSchedule => ({
  id: 'synthetic-2m',
  name: '合成疫苗 第1劑',
  timing: '出生滿2個月',
  funding: 'national',
  sourceUrl: 'https://example.invalid/synthetic',
  ageInMonths: 2,
  ageLabel: '2個月',
  doses: 1,
  currentDose: 1,
  sideEffects: ['注射部位紅腫'],
  ...overrides,
});

const child = { id: 'child-a', name: '小樹', birthday: '2026-01-15' };

const administered = (
  vaccineId: string,
  doseNumber = 1,
  administeredDate?: string,
): VaccineProgress => ({
  [vaccineId]: { doses: { [doseNumber]: { administered: true, administeredDate } } },
});

/** RFC 5545 §3.1 line folding undone, so assertions can read whole values. */
const unfold = (ics: string) => ics.replace(/\r\n /g, '');

const eventCount = (ics: string) => ics.split('BEGIN:VEVENT').length - 1;

const descriptionsOf = (ics: string) =>
  unfold(ics)
    .split(CRLF)
    .filter((line) => line.startsWith('DESCRIPTION:'));

describe('buildVaccineIcs', () => {
  it('wraps the doses in a VCALENDAR a calendar app will accept', () => {
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule()],
      progress: {},
    });

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//LittleSteps//');
    expect(ics).toContain('CALSCALE:GREGORIAN');
  });

  it('anchors the event to the birthday plus the dose age in months', () => {
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule({ ageInMonths: 5 })],
      progress: {},
      now: new Date(Date.UTC(2026, 1, 1)),
    });

    // 2026-01-15 + 5 months, all-day, so DTEND is the exclusive next day.
    expect(ics).toContain('DTSTART;VALUE=DATE:20260615');
    expect(ics).toContain('DTEND;VALUE=DATE:20260616');
  });

  it('keeps an overdue dose on its real date rather than moving it to today', () => {
    // Nobody exports the schedule on the day the child is born. A five-month-old
    // whose two-month doses were never recorded must still get those doses, on
    // the dates they were actually due, or the export quietly rewrites history.
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule()],
      progress: {},
      now: new Date(Date.UTC(2026, 5, 20)),
    });

    expect(eventCount(ics)).toBe(1);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260315');
    expect(ics).not.toContain('DTSTART;VALUE=DATE:20260620');
  });

  it('excludes a dose already recorded as administered', () => {
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule()],
      progress: administered('synthetic-2m', 1, '2026-03-20'),
    });

    expect(ics).not.toContain('BEGIN:VEVENT');
  });

  it('excludes a dose ticked as administered with no date recorded', () => {
    // Ticking the dose without filling in a date is a real state in the app;
    // treating it as outstanding would remind a parent about a dose they gave.
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule()],
      progress: administered('synthetic-2m'),
    });

    expect(ics).not.toContain('BEGIN:VEVENT');
  });

  it('names the dose, its funding state and the recommended age window', () => {
    const ics = unfold(
      buildVaccineIcs({
        child: child,
        schedules: [schedule({ funding: 'self-paid' })],
        progress: {},
      }),
    );

    expect(ics).toContain('SUMMARY:小樹：合成疫苗 第1劑');
    expect(descriptionsOf(ics)[0]).toContain('自費');
    expect(descriptionsOf(ics)[0]).toContain('建議接種時間：出生滿2個月');
  });

  it('qualifies the funding line when the row announces a funding change', () => {
    // The event outlives the export. Read on the day of the appointment, which
    // can be after the change date, a bare "self-paid" is the first thing a
    // parent sees about a dose that is no longer self-paid.
    const ics = unfold(
      buildVaccineIcs({
        child: child,
        schedules: [
          schedule({ funding: 'self-paid', fundingChangesOn: '2027-01-01' }),
        ],
        progress: {},
      }),
    );

    const description = descriptionsOf(ics)[0];

    expect(description).toContain('自費');
    expect(description).toContain('2027-01-01');
  });

  it('leaves the funding line alone when nothing is announced', () => {
    const description = descriptionsOf(
      unfold(
        buildVaccineIcs({
          child: child,
          schedules: [schedule({ funding: 'self-paid' })],
          progress: {},
        }),
      ),
    )[0];

    expect(description).toContain('自費');
    expect(description).not.toMatch(/\d{4}-\d{2}-\d{2} 起/);
  });

  it('carries the eligibility condition and the note the dose already has', () => {
    const ics = buildVaccineIcs({
      child: child,
      schedules: [
        schedule({
          funding: 'nhi-conditional',
          eligibility: '1歲以下高危險群幼兒',
          notes: '出生後儘速接種',
        }),
      ],
      progress: {},
    });

    const description = descriptionsOf(ics)[0];

    expect(description).toContain('健保有條件給付');
    expect(description).toContain('給付條件：1歲以下高危險群幼兒');
    expect(description).toContain('出生後儘速接種');
    expect(description).toContain('https://example.invalid/synthetic');
  });

  it('alarms a week ahead, not the day before', () => {
    // A dose is given at a clinic that has to be booked; a reminder the evening
    // before is a reminder that the parent is already late.
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule()],
      progress: {},
    });

    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-P7D');
    expect(ics).toContain('END:VALARM');
  });

  it('escapes the RFC 5545 special characters a note can contain', () => {
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule({ notes: 'a\\b;c,d\ne' })],
      progress: {},
    });

    expect(ics).toContain('a\\\\b\\;c\\,d\\ne');
  });

  it('folds a long Chinese note to 75 octets a line without losing a character', () => {
    const notes
      = '接種前請告知醫師孩子近期的用藥與過敏史，並攜帶兒童健康手冊。'.repeat(3);

    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule({ notes })],
      progress: {},
    });

    const encoder = new TextEncoder();

    for (const line of ics.split(CRLF)) {
      expect(encoder.encode(line).length, line).toBeLessThanOrEqual(75);
    }

    expect(descriptionsOf(ics)[0]).toContain(notes);
  });

  it('skips a dose whose timing cannot be turned into a date', () => {
    // Some self-paid rows only say "at the same visit as the public dose".
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule(), schedule({ id: 'relative', ageInMonths: undefined })],
      progress: {},
    });

    expect(eventCount(ics)).toBe(1);
    expect(ics).not.toContain('relative');
  });

  it('exports only the dose it is given, for the parent who wants the next one', () => {
    const rows = [schedule(), schedule({ id: 'synthetic-4m', ageInMonths: 4 })];
    const ics = buildVaccineIcs({ child: child, schedules: [rows[1]], progress: {} });

    expect(eventCount(ics)).toBe(1);
    expect(ics).toContain('synthetic-4m');
  });

  it('orders events by due date so a re-export reads like the schedule', () => {
    const ics = buildVaccineIcs({
      child: child,
      schedules: [
        schedule({ id: 'late', ageInMonths: 12 }),
        schedule({ id: 'early' }),
      ],
      progress: {},
    });

    const dates = [...ics.matchAll(/DTSTART;VALUE=DATE:(\d+)/g)].map(
      (match) => match[1],
    );

    expect(dates).toEqual(['20260315', '20270115']);
  });

  it('gives two siblings different uids for the same dose', () => {
    // One uid per dose would make the second child's export silently overwrite
    // the first child's events in the same calendar.
    const sibling = { id: 'child-b', name: '小花', birthday: '2024-03-01' };
    const uidOf = (ics: string) => unfold(ics).match(/UID:(.+)\r\n/)![1];

    expect(
      uidOf(buildVaccineIcs({ child: child, schedules: [schedule()], progress: {} })),
    ).not.toBe(
      uidOf(
        buildVaccineIcs({ child: sibling, schedules: [schedule()], progress: {} }),
      ),
    );
  });

  it('reuses the same uid when the same dose is exported twice', () => {
    const uidOf = (ics: string) => unfold(ics).match(/UID:(.+)\r\n/)![1];

    expect(
      uidOf(buildVaccineIcs({ child: child, schedules: [schedule()], progress: {} })),
    ).toBe(
      uidOf(buildVaccineIcs({ child: child, schedules: [schedule()], progress: {} })),
    );
  });

  it('stamps every event with a DTSTAMP, which RFC 5545 requires', () => {
    // Without it Outlook and some CalDAV servers reject the whole file.
    const ics = buildVaccineIcs({
      child: child,
      schedules: [schedule()],
      progress: {},
      now: new Date(Date.UTC(2026, 8, 4, 1, 2, 3)),
    });

    expect(ics).toContain('DTSTAMP:20260904T010203Z');
  });

  it('produces an empty but valid calendar when nothing is outstanding', () => {
    const ics = buildVaccineIcs({ child: child, schedules: [], progress: {} });

    expect(eventCount(ics)).toBe(0);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
  });

  it('exports nothing for a child with no birthday on record', () => {
    const ics = buildVaccineIcs({
      child: { ...child, birthday: '' },
      schedules: [schedule()],
      progress: {},
    });

    expect(eventCount(ics)).toBe(0);
  });
});
