import { buildCalendar, type CalendarEvent } from '~app/family/domain/icsExport';
import type {
  ChildProfile,
  VaccineProgress,
} from '~app/family/domain/familyRecords';
import type {
  VaccineFunding,
  VaccineSchedule,
} from '~app/knowledge/domain/referenceModels';
import {
  resolveVaccineDoses,
  type ResolvedVaccineDose,
} from '~app/family/domain/vaccineSchedule';

/**
 * How each funding state is worded for a parent.
 *
 * The badge on the vaccine page and the note inside an exported event read the
 * same map on purpose. An .ics lands in a calendar with the app nowhere in
 * sight, and a self-paid product described in the words of a publicly funded
 * one is the reason `funding` is a four-value union rather than a boolean.
 */
export const FUNDING_LABEL: Record<VaccineFunding, string> = {
  national: '公費',
  'nhi-conditional': '健保有條件給付',
  'self-paid': '自費',
  'local-varies': '各縣市不同',
};

const PRODID = '-//LittleSteps//兒童疫苗接種時程//ZH-TW';

/**
 * The doses a child has not had yet, earliest first.
 *
 * Two kinds of dose are absent. Ones already recorded as administered, and
 * ones with no age in months, which cannot be dated at all — a few self-paid
 * rows only say "at the same visit as the public dose", and inventing a date
 * for those would be worse than leaving them to the app.
 *
 * The page counts these to label its export action, and the export serialises
 * exactly the same list, so the number a parent taps is the number they get.
 */
export function outstandingVaccineDoses({
  birthday,
  schedules,
  progress,
  now = new Date(),
}: {
  birthday: string;
  schedules: VaccineSchedule[];
  progress: VaccineProgress;
  now?: Date;
}): ResolvedVaccineDose[] {
  return resolveVaccineDoses({
    birthday: birthday,
    schedules: schedules,
    progress: progress,
    today: now,
  }).filter((dose) => dose.status !== 'done');
}

/**
 * Serialise the doses a child has not had yet into an RFC 5545 calendar.
 *
 * Every event is anchored to the start of its recommended window — the child's
 * birthday plus the dose's age in months — through `resolveVaccineDoses`, so
 * the page and the export cannot drift apart on what a due date is. An overdue
 * dose keeps its real date instead of being pulled forward to today: a dose
 * sitting in the past is the honest answer, and an alarm on a past event does
 * not fire at a parent who can no longer act on it.
 *
 * Only outstanding doses appear, on the terms `outstandingVaccineDoses` sets.
 *
 * Pass a single row to export a single dose; the caller decides the scope.
 *
 * `now` is the DTSTAMP and the clock that resolves status. Injected for tests.
 */
export function buildVaccineIcs({
  child,
  schedules,
  progress,
  now = new Date(),
}: {
  child: Pick<ChildProfile, 'id' | 'name' | 'birthday'>;
  schedules: VaccineSchedule[];
  progress: VaccineProgress;
  now?: Date;
}): string {
  const rowById = new Map(schedules.map((vaccine) => [vaccine.id, vaccine]));

  const events = outstandingVaccineDoses({
    birthday: child.birthday,
    schedules: schedules,
    progress: progress,
    now: now,
  }).map((dose): CalendarEvent => {
    const vaccine = rowById.get(dose.vaccineId)!;

    // Funding leads: it is the one line that changes what a parent does next,
    // and in a calendar it has to survive without the badge that carries it
    // on the page. Then the window in the source's own words, the row's own
    // note, and where it came from.
    //
    // An announced change qualifies that leading word rather than being left
    // to the note below it. An .ics outlives the export: an event written
    // today is read on the day of the appointment, which for a dose whose
    // funding changes on a known date can be after that date. "Self-paid"
    // alone would then be the first and most prominent thing a parent reads
    // about a dose that is no longer self-paid.
    const funding = vaccine.fundingChangesOn
      ? `${FUNDING_LABEL[dose.funding]}（${vaccine.fundingChangesOn} 起調整，請以最新公告為準）`
      : FUNDING_LABEL[dose.funding];

    const details = [funding, `建議接種時間：${dose.timing}`];

    if (vaccine.eligibility) {
      details.push(`給付條件：${vaccine.eligibility}`);
    }

    if (vaccine.notes) {
      details.push(vaccine.notes);
    }

    details.push(`資料來源：${vaccine.sourceUrl}`);

    return {
      // The child id keeps two siblings' exports apart. Leaving the date out
      // means a corrected birthday moves the event already in the calendar
      // rather than adding a second one beside it.
      uid: `${child.id}-${dose.vaccineId}-${dose.doseNumber}@littlesteps`,
      date: dose.dueDate,
      title: `${child.name}：${dose.name}`,
      details: details.join('\n'),
    };
  });

  return buildCalendar(events, PRODID, now);
}
