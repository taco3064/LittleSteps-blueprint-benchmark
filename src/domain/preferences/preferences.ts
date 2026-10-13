/**
 * Device-level view preferences.
 *
 * What a parent narrowed down last time: which county, which age band, which
 * tab. LittleGuard is a weekly habit, so without this the same two chips get
 * tapped fifty-two times a year to reach the same board; BabyOasis loses its
 * filters to the page reload a PWA does mid-outing.
 *
 * ## This store never holds child data — do not widen it
 *
 * Signing in is required for anything that reads or writes a child's records,
 * and there is deliberately no guest mode and no LocalStorage fallback for
 * child data anywhere in this app. `localStorage` is readable by any script on
 * the origin, survives signing out, and is shared by everyone who uses the
 * device. So a child's name, birthday, id, or any record of theirs must never
 * be written here — not as a convenience, not as a cache, not "just the id".
 *
 * Everything in `ViewPreferences` is a view choice a stranger reading the blob
 * learns nothing personal from, and `OWNED_KEYS` is what enforces that rather
 * than this comment. The key set is closed in both directions: a write copies
 * the owned fields by name, so a caller that widened its own object cannot
 * smuggle a field through, and a read discards the entire blob if it carries
 * any key this module does not own. `preferences.test.ts` asserts both, and
 * asserts that the persisted payload never contains a child-shaped key.
 *
 * Where a preference is *derived* from a child — LittleGuard's age band, which
 * a signed-in parent gets from their child's birthday — the derived value stays
 * in memory and is never saved. Only a parent's own tap is stored.
 *
 * ## Versioned key
 *
 * The key carries a shape version. A blob written under an older version is
 * never migrated and never parsed: it is simply not read, and every surface
 * falls back to the default it had before this module existed. Within a
 * version, a value that no longer makes sense is dropped field by field. These
 * are public pages; nothing in a parent's `localStorage` may be able to break
 * one.
 */

const STORAGE_KEY = 'littlesteps:view-prefs:v1';

/**
 * The view choices worth remembering. Strings and booleans only.
 *
 * Two things are deliberately absent. BabyOasis's chosen metro station and map
 * viewport are about where a parent is standing right now, not about who the
 * family is, so they reset. LittleSteps' daily log defaults to today, which is
 * already the right answer.
 */
export interface ViewPreferences {
  /** LittleGuard: the county whose board is shown. */
  guardCounty: string | null;
  /** LittleGuard: the age band chip, in the upstream `0~2` form. */
  guardAgeBand: string | null;
  /** LittleOuting: which of the three tabs. */
  outingTab: string | null;
  /** LittleOuting: the county chip, or the all-counties value. */
  outingCity: string | null;
  /** BabyOasis: the area filter. */
  oasisCity: string | null;
  oasisDistrict: string | null;
  /** BabyOasis: the venue-type chip. */
  oasisCategory: string | null;
  /** BabyOasis: hide rooms inside a workplace or a school. */
  oasisExcludeInternal: boolean;
}

/**
 * Every key this module owns, and therefore the only keys it will read back or
 * write out. The list is what makes the boundary enforceable rather than
 * aspirational: a field cannot be added to the stored shape without being
 * added here, and `preferences.test.ts` asserts that the persisted key set is
 * exactly this one and carries nothing child-shaped.
 */
const OWNED_KEYS: readonly string[] = [
  'guardCounty',
  'guardAgeBand',
  'outingTab',
  'outingCity',
  'oasisCity',
  'oasisDistrict',
  'oasisCategory',
  'oasisExcludeInternal',
] as const satisfies readonly (keyof ViewPreferences)[];

/**
 * `localStorage` is not always reachable, and reaching for it is what throws:
 * Safari in private mode and any browser with site data blocked raise a
 * `SecurityError` on property access, before any read or write. Forgetting a
 * filter is not worth an error a parent has to read.
 */
function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    // No storage on this device, so nothing is remembered. That is the same
    // behaviour every surface had before this module existed.
    return null;
  }
}

/** Whatever is under the key, as a bag of unknowns. `{}` when there is nothing usable. */
function readStored(): Record<string, unknown> {
  const raw = storage()?.getItem(STORAGE_KEY);

  if (typeof raw !== 'string') {
    return {};
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    // Truncated or hand-edited blob. Same as no blob at all.
    return {};
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  const stored = parsed as Record<string, unknown>;

  // A key this module does not own means the blob is not this module's: another
  // writer, a hand edit, or a shape that should have bumped the version. It is
  // discarded whole rather than picked over, so a child-shaped key can no more
  // arrive from storage than it can be written to it.
  if (Object.keys(stored).some((key) => !OWNED_KEYS.includes(key))) {
    return {};
  }

  return stored;
}

/** An empty string is not a choice anyone made, so it is not one worth keeping. */
function text(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * The one gate. Every field is copied by name and checked by type, so a stale
 * shape degrades to the defaults instead of reaching a page, and an unknown key
 * never survives a round trip.
 */
function normalise(source: Record<string, unknown>): ViewPreferences {
  return {
    guardCounty: text(source.guardCounty),
    guardAgeBand: text(source.guardAgeBand),
    outingTab: text(source.outingTab),
    outingCity: text(source.outingCity),
    oasisCity: text(source.oasisCity),
    oasisDistrict: text(source.oasisDistrict),
    oasisCategory: text(source.oasisCategory),
    oasisExcludeInternal: source.oasisExcludeInternal === true,
  };
}

/**
 * The stored preferences, or the defaults.
 *
 * A returned value is only known to be well-typed, never to still exist: the
 * datasets behind these pages are regenerated from upstream, so a stored county
 * or district may be gone. Callers check the value against today's data and
 * fall back the way they already fall back — see `RadarPage`'s `DEFAULT_COUNTY`.
 */
export function readPreferences(): ViewPreferences {
  return normalise(readStored());
}

/**
 * Merge a surface's choices into the stored set.
 *
 * A merge rather than a write because three services share one key: BabyOasis
 * saving a filter must not forget LittleGuard's county.
 */
export function savePreferences(patch: Partial<ViewPreferences>): void {
  const store = storage();

  if (store === null) {
    return;
  }

  const next = normalise({ ...readStored(), ...patch });

  try {
    store.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota full, or a private window that allows reads but not writes. The
    // surface keeps working; it just will not remember this choice.
  }
}
