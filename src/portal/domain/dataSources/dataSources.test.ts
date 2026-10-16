import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms/index';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import { babyWikiArticles } from '~app/knowledge/domain/babyWiki';
import { nursingRoomsMeta } from '~app/knowledge/domain/nursingRoomsMeta';
import { toddlerWikiArticles } from '~app/knowledge/domain/toddlerWiki';
import { pregnancyWikiArticles } from '~app/knowledge/domain/wiki';
import type { RadarData } from '~app/littleguard/domain/radarModels/index';
import { CENTRE_ACCESS } from '~app/littleouting/domain/centreAccess';
import { restaurants } from '~app/littleouting/domain/restaurants';
import type { Venue } from '~app/littleouting/domain/venueModels/index';
import { vaccineSchedules } from '~app/knowledge/domain/vaccines';
import {
  ABOUT_LAST_UPDATED,
  COVERAGE,
  DATA_SOURCES,
  HONEST_GAPS,
} from './dataSources';

/**
 * The about page's claims, held against the things they are claims about.
 *
 * The page promises a parent that every number in the app has a source and
 * that the numbers are real. A page making that promise with a stale count on
 * it is worse than no page. So each literal in `dataSources.ts` is compared to
 * the data it describes, and each source URL is held to the same allowlist
 * `centreAccess.test.ts` uses to keep blog reposts out of the venue rules.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

// public/ JSON cannot be imported; read it. `fileURLToPath` rather than
// `new URL(...)`, because happy-dom replaces the global URL.
const readJson = <T>(...segments: string[]): T =>
  JSON.parse(readFileSync(join(ROOT, ...segments), 'utf8'));

const rooms = readJson<NursingRoom[]>('public', 'data', 'nursingRooms.json');
const venues = readJson<Venue[]>('public', 'data', 'familyCentres.json');
const radar = readJson<RadarData>('public', 'data', 'diseaseRadar.json');

const centres = venues.filter((venue) => venue.id.startsWith('centre-'));
const counties = new Set(rooms.map((room) => room.city));

/** Government bodies, the WHO, and OpenStreetMap. Nothing else may be cited here. */
const OFFICIAL_HOSTS
  = /^https:\/\/([a-z0-9-]+\.)*(gov\.tw|gov\.taipei|who\.int|openstreetmap\.org)(\/|$)/;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  return (
    ISO_DATE.test(value) && new Date(value).toISOString().slice(0, 10) === value
  );
}

const coverage = Object.fromEntries(
  COVERAGE.map(({ unit, value }) => [unit, value]),
);

describe('the number strip', () => {
  it('counts nursing rooms from the dataset the map fetches', () => {
    expect(coverage['處哺乳室']).toBe(rooms.length);
  });

  it(
    'counts family centres, not the Taipei parenting rooms in the same '
    + 'file',
    () => {
      expect(coverage['間親子館']).toBe(centres.length);
    },
  );

  it('counts the doses on the vaccine schedule', () => {
    expect(coverage['劑疫苗']).toBe(vaccineSchedules.length);
  });

  it('counts the articles across all three wikis', () => {
    expect(coverage['篇百科文章']).toBe(
      babyWikiArticles.length
      + pregnancyWikiArticles.length
      + toddlerWikiArticles.length,
    );
  });

  it('counts the diseases the radar tracks', () => {
    expect(coverage['種傳染病']).toBe(radar.diseases.length);
  });

  it('has no number the cases above did not check', () => {
    expect(Object.keys(coverage).sort()).toEqual(
      ['處哺乳室', '間親子館', '劑疫苗', '篇百科文章', '種傳染病'].sort(),
    );
  });
});

describe('the gaps the page admits to', () => {
  it('names the counties whose centre rules are unverified', () => {
    // 22 counties come from the nursing-room dataset rather than a constant,
    // so the count follows the country and not a number typed here.
    expect(counties.size).toBe(22);

    expect(HONEST_GAPS.unverifiedCentreCounties).toBe(
      counties.size - Object.keys(CENTRE_ACCESS).length,
    );
  });

  it('names the size of the restaurant sample', () => {
    expect(HONEST_GAPS.restaurantSample).toBe(restaurants.length);
  });
});

describe('the source cards', () => {
  it('cite only a government body, the WHO or OpenStreetMap', () => {
    const offsite = DATA_SOURCES.filter(
      (source) => !OFFICIAL_HOSTS.test(source.sourceUrl),
    );

    expect(offsite.map((source) => source.sourceUrl)).toEqual([]);
  });

  it('each carry a real verification date that is not in the future', () => {
    const today = toLocalDateKey();

    const bad = DATA_SOURCES.filter(
      (source) => !isRealDate(source.verifiedOn) || source.verifiedOn > today,
    );

    expect(
      bad.map((source) => `${source.dataset} ${source.verifiedOn}`),
    ).toEqual([]);
  });

  it(
    'take the nursing-room date from the sidecar the build script ' + 'writes',
    () => {
      // The dataset is a bare array with no date of its own, so the date lives in
      // a sidecar next to it. The sidecar is only trustworthy while it describes
      // the array that is actually shipped: a regenerated nursingRooms.json with a
      // stale sidecar would put last month's date under this month's rooms, and
      // the counts are what catch that.
      expect(nursingRoomsMeta.count).toBe(rooms.length);

      expect(nursingRoomsMeta.statutoryCount).toBe(
        rooms.filter((room) => room.statutory).length,
      );

      expect(isRealDate(nursingRoomsMeta.verifiedOn)).toBe(true);

      expect(Number.isNaN(Date.parse(nursingRoomsMeta.generatedAt))).toBe(
        false,
      );

      // generatedAt is UTC and verifiedOn is the local calendar day of the same
      // run, so they may differ by one day across midnight — never by more.
      const generatedDay = nursingRoomsMeta.generatedAt.slice(0, 10);

      const dayApart
        = Math.abs(
          Date.parse(generatedDay) - Date.parse(nursingRoomsMeta.verifiedOn),
        ) / 86_400_000;

      expect(dayApart).toBeLessThanOrEqual(1);

      // Found by its host, which is the source's identity; the prose on the card
      // is free to change.
      const card = DATA_SOURCES.find((source) =>
        source.sourceUrl.includes('mammy.hpa.gov.tw'),
      );

      expect(card?.verifiedOn).toBe(nursingRoomsMeta.verifiedOn);
    },
  );

  it('each say what in the app is built from them', () => {
    const empty = DATA_SOURCES.filter(
      (source) =>
        !source.agency.trim() || !source.dataset.trim() || !source.what.trim(),
    );

    expect(empty.map((source) => source.dataset)).toEqual([]);
  });

  it('do not repeat a dataset', () => {
    const keys = DATA_SOURCES.map(
      (source) => `${source.agency} ${source.dataset}`,
    );

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('cover the datasets the number strip counts', () => {
    // A count on the strip with no card under it is a number without a source,
    // which is the one thing this page says never happens.
    const cited = DATA_SOURCES.map((source) => source.what).join('\n');

    for (const phrase of ['哺乳室', '親子館', '疫苗', '百科', '疫情雷達']) {
      expect(cited, phrase).toContain(phrase);
    }
  });
});

describe('the last-updated line', () => {
  it('is a real date, not in the future', () => {
    expect(isRealDate(ABOUT_LAST_UPDATED)).toBe(true);
    expect(ABOUT_LAST_UPDATED <= toLocalDateKey()).toBe(true);
  });

  it('is no older than the newest source it summarises', () => {
    // The page was read against the system on this day; a source checked
    // after that day means the page has not been re-read since.
    const dates = DATA_SOURCES.map((source) => source.verifiedOn).sort();
    const newest = dates[dates.length - 1];

    expect(ABOUT_LAST_UPDATED >= newest).toBe(true);
  });
});
