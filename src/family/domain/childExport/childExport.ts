import type {
  ChildProfile,
  DailyLog,
  DiaryEntry,
  GrowthRecord,
} from '../familyRecords';
import { toLocalDateKey } from '~app/platform/domain/calendar';

/**
 * One child's complete record, assembled into the file a parent keeps.
 *
 * The clinic summary, the weekly report and the calendar export are all
 * digests: rendered, aggregated or vaccine-dates-only. This is the whole
 * thing — every feed, every nap, every diary entry, every measurement — for a
 * parent who wants to keep it, move it, or hand it to a paediatrician.
 *
 * Pure on purpose: the four reads happen in the data layer, so the shape of
 * the document is testable without Firebase.
 */

/** The four nodes an export is assembled from, already read. */
export interface ChildExportSource {
  child: ChildProfile;
  dailyLogs: DailyLog[];
  diaryEntries: DiaryEntry[];
  growthRecords: GrowthRecord[];
}

const APP_NAME = 'LittleSteps';

/**
 * The downloaded document.
 *
 * Deliberately shaped like the database, so it needs no schema of its own:
 * whoever reads the file back — a person, a spreadsheet, a future importer —
 * can hold it against `README.md`'s database shape and be right.
 *
 * `members` is the one thing dropped. It is a list of other people's account
 * ids: authorisation, not the parent's data, and of no use outside the app.
 */
export interface ChildExport {
  exportedAt: string;
  app: typeof APP_NAME;
  child: Omit<ChildProfile, 'members'>;
  dailyLogs: DailyLog[];
  diaryEntries: DiaryEntry[];
  growthRecords: GrowthRecord[];
}

/**
 * Assemble the export document.
 *
 * The child node is spread rather than picked field by field: a profile field
 * added later belongs in the export by default, and a parent should never
 * discover that the copy they kept quietly stopped carrying something.
 *
 * `now` is injected for tests only.
 */
export function buildChildExport(
  source: ChildExportSource,
  now: Date = new Date(),
): ChildExport {
  const { members: _members, ...child } = source.child;

  void _members;

  return {
    exportedAt: now.toISOString(),
    app: APP_NAME,
    child,
    // Always present, empty or not: a missing key reads as "this version had
    // no diary", an empty array reads as "this child has no entries".
    dailyLogs: source.dailyLogs,
    diaryEntries: source.diaryEntries,
    growthRecords: source.growthRecords,
  };
}

/**
 * A child's name is free text: it can hold a slash, a colon, an emoji or
 * nothing but spaces, and every one of those either breaks a filename or
 * silently loses the download.
 *
 * Reserved characters and control characters go, whitespace collapses to a
 * hyphen, and a leading dot — which hides the file on every Unix desktop —
 * cannot survive.
 */
const RESERVED_IN_FILENAME = /[\p{Cc}/\\:*?"<>|]+/gu;

/** Shown to a parent in their own file manager, so it stays Traditional Chinese. */
const UNNAMED = '寶寶';

function safeFilenamePart(name: string): string {
  const cleaned = name
    .replace(RESERVED_IN_FILENAME, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  return cleaned || UNNAMED;
}

/**
 * `littlesteps-<child name>-<YYYY-MM-DD>.json`, dated in the parent's own
 * timezone — the file is named after the day they pressed the button, not
 * after UTC's idea of it.
 */
export function childExportFilename(childName: string, now: Date = new Date()): string {
  return `littlesteps-${safeFilenamePart(childName)}-${toLocalDateKey(now)}.json`;
}

/** The MIME type the export downloads as. */
export const CHILD_EXPORT_MIME = 'application/json;charset=utf-8';
