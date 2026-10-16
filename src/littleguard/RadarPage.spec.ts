import { readFileSync } from 'node:fs';
import { expect, test } from '../../e2e/fixtures/test';
import { daysAfter } from '../../e2e/fixtures/clock';
import {
  expectNoPageOverflow, expectRowContainsItsOverflow,
} from '../../e2e/fixtures/layout';
import { LittleGuardPage } from '../../e2e/pages/littleGuardPage';
import { DISEASE_PART_OF } from './domain/diseases/data';
import {
  FRESHNESS_DAYS, STATUS_COPY, describeVisits, formatWeekRange, statusOf, summariseBoard,
} from './domain/radar/radar';
import { type DiseaseCell } from './domain/radar/radar';
import type { RadarData } from './domain/radarModels/index';

test.describe('guard', () => {
  /**
   * GUARD-01…09 — the LittleGuard disease radar.
   *
   * The board is fully public and reads its whole content from
   * `public/data/diseaseRadar.json` at runtime, which is plan §1's "real data
   * files" row: a malformed or missing file typechecks and breaks the page.
   *
   * **The whole group pins the clock**, not only the three freshness cases.
   * Every row's status is gated on `freshnessOf(data.weekEnd)`, and that JSON is
   * refreshed by a manual local command — `refresh-disease-radar.yml` records
   * that `od.cdc.gov.tw` blocks GitHub-hosted runners — so the fixture's
   * `weekEnd` ages inside the repository. An unpinned suite therefore goes red
   * roughly five weeks after every refresh for no product reason. The pin is
   * relative to the fixture's own `weekEnd`, never to a calendar date, so a
   * refresh moves the whole group with it.
   */

  /**
   * The board's data, read from the file the built app serves.
   *
   * Read rather than imported so that neither `tsc` nor the Playwright loader
   * has to infer a type for 79 KB of literals; `RadarData` is the contract the
   * app itself uses, and `diseaseRadar.contract.test.ts` is what proves the file
   * still matches it.
   */
  const RADAR = JSON.parse(
    readFileSync(
      new URL('../../public/data/diseaseRadar.json', import.meta.url),
      'utf8',
    ),
  ) as RadarData;

  /**
   * `DEFAULT_COUNTY` and `DEFAULT_AGE` are module-private in `RadarPage.tsx`, so
   * there is nothing to import: these two restate the defaults a parent with an
   * empty `localStorage` lands on, and a spec fails loudly if either moves.
   */
  const DEFAULT_COUNTY = '台北市';
  const DEFAULT_BAND = '0~2';

  /** The other side of the two switching cases (GUARD-05, GUARD-06). */
  const OTHER_COUNTY = '新北市';
  const OTHER_BAND = '3~6';

  /** The disease whose drawer GUARD-07 opens. Any board row would do. */
  const DRAWER_DISEASE = '類流感';

  /**
   * How far past `weekEnd` each case pins the clock.
   *
   * `freshnessOf` compares with `>`, so the two thresholds are the last day of
   * the *previous* state, not the first day of the next one: at exactly +14 the
   * board is still fresh and at exactly +35 it is still stale. Both boundaries
   * are pinned exactly, because a spec that pinned the state the naive reading
   * suggests would assert a banner that never renders.
   */
  const DAYS_PAST_WEEK_END = {
    fresh: 1,
    lastFreshDay: FRESHNESS_DAYS.stale,
    lastStaleDay: FRESHNESS_DAYS.expired,
    expired: FRESHNESS_DAYS.expired + 1,
  } as const;

  /**
   * The rows the board shows for one county and age band.
   *
   * `RadarPage` drops the diseases that are part of another one — 手足口病 and
   * 疱疹性咽峽炎 are two presentations of 腸病毒 and upstream ships all three, so
   * listing them side by side would count the same visits three times.
   */
  function boardOf(county: string, band: string): DiseaseCell[] {
    const cells = RADAR.counties[county][band];

    return RADAR.diseases
      .filter((disease) => !(disease in DISEASE_PART_OF))
      .map((disease) => ({ disease, cell: cells[disease] }));
  }

  /** Every case pins the clock; the freshness cases re-pin before their own `goto`. */
  test.beforeEach(async ({ pinClock }) => {
    await pinClock(daysAfter(RADAR.weekEnd, DAYS_PAST_WEEK_END.fresh));
  });

  test(('GUARD-01 @p0 the board renders for the default county and age '
    + 'band'), async ({
    page,
  }) => {
    const guard = new LittleGuardPage(page);

    await guard.goto();

    await expect(guard.county(DEFAULT_COUNTY)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await expect(guard.ageBand(DEFAULT_BAND)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    for (const { disease, cell } of boardOf(DEFAULT_COUNTY, DEFAULT_BAND)) {
      await expect(guard.rowVisits(disease, cell.visits)).toBeVisible();

      await expect(
        guard.rowStatus(disease, STATUS_COPY[statusOf(cell)].label),
      ).toBeVisible();
    }

    await expect(guard.emptyState).toHaveCount(0);
  });

  test(('GUARD-02 @p0 fresh data shows the week range and no freshness '
    + 'banner'), async ({
    page,
    pinClock,
  }) => {
    const guard = new LittleGuardPage(page);

    // Exactly +14: the last day that is still fresh.
    await pinClock(daysAfter(RADAR.weekEnd, DAYS_PAST_WEEK_END.lastFreshDay));
    await guard.goto();

    await expect(guard.weekLine).toHaveText(
      `${formatWeekRange(RADAR.weekStart, RADAR.weekEnd)} · 疾管署健保門診就診統計`,
    );

    await expect(guard.staleBanner).toHaveCount(0);
    await expect(guard.expiredBanner).toHaveCount(0);

    await expect(guard.boardSummary).toHaveText(
      summariseBoard(boardOf(DEFAULT_COUNTY, DEFAULT_BAND)),
    );
  });

  test(('GUARD-03 @p0 stale data shows the stale banner and keeps every '
    + 'row status'), async ({
    page,
    pinClock,
  }) => {
    const guard = new LittleGuardPage(page);

    // Exactly +35: past the stale threshold, and the last day before expiry.
    await pinClock(daysAfter(RADAR.weekEnd, DAYS_PAST_WEEK_END.lastStaleDay));
    await guard.goto();

    await expect(guard.staleBanner).toBeVisible();
    await expect(guard.expiredBanner).toHaveCount(0);

    // Stale is a note in the margin, not a retraction: the board still answers
    // the question a parent opened it with.
    for (const { disease, cell } of boardOf(DEFAULT_COUNTY, DEFAULT_BAND)) {
      await expect(
        guard.rowStatus(disease, STATUS_COPY[statusOf(cell)].label),
      ).toBeVisible();
    }

    await expect(guard.boardSummary).toBeVisible();
  });

  test(('GUARD-04 @p0 expired data suppresses every status and the board '
    + 'summary'), async ({
    page,
    pinClock,
  }) => {
    const guard = new LittleGuardPage(page);

    await pinClock(daysAfter(RADAR.weekEnd, DAYS_PAST_WEEK_END.expired));
    await guard.goto();

    await expect(guard.expiredBanner).toBeVisible();
    await expect(guard.staleBanner).toHaveCount(0);

    // The counts stay and the judgement goes. A month-old "最近變多，多留意" is
    // the P0 failure this service can have, and this is the state parents hit
    // most often, given that the data is refreshed by hand.
    for (const { disease, cell } of boardOf(DEFAULT_COUNTY, DEFAULT_BAND)) {
      await expect(guard.rowVisits(disease, cell.visits)).toBeVisible();

      await expect(
        guard.rowStatus(disease, STATUS_COPY[statusOf(cell)].label),
      ).toHaveCount(0);
    }

    await expect(guard.boardSummary).toHaveCount(0);
  });

  test(('GUARD-05 @p1 choosing a county switches the board and is '
    + 'remembered across a reload'), async ({
    page,
  }) => {
    const guard = new LittleGuardPage(page);

    await guard.goto();

    await expect(guard.county(DEFAULT_COUNTY)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await guard.county(OTHER_COUNTY).click();

    await expect(guard.county(OTHER_COUNTY)).toHaveAttribute('aria-pressed', 'true');

    await expect(guard.county(DEFAULT_COUNTY)).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    for (const { disease, cell } of boardOf(OTHER_COUNTY, DEFAULT_BAND)) {
      await expect(guard.rowVisits(disease, cell.visits)).toBeVisible();
    }

    // The choice is a weekly habit worth remembering — it is stored on the
    // device, so it has to come back with the page.
    await page.reload();

    await expect(guard.county(OTHER_COUNTY)).toHaveAttribute('aria-pressed', 'true');

    await expect(guard.county(DEFAULT_COUNTY)).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('GUARD-06 @p1 choosing an age band changes every row', async ({ page }) => {
    const guard = new LittleGuardPage(page);

    await guard.goto();

    await expect(guard.ageBand(DEFAULT_BAND)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await guard.ageBand(OTHER_BAND).click();

    await expect(guard.ageBand(OTHER_BAND)).toHaveAttribute('aria-pressed', 'true');

    await expect(guard.ageBand(DEFAULT_BAND)).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    for (const { disease, cell } of boardOf(DEFAULT_COUNTY, OTHER_BAND)) {
      await expect(guard.rowVisits(disease, cell.visits)).toBeVisible();
    }
  });

  test(('GUARD-07 @p1 a disease drawer opens from its row and closes back '
    + 'to the board'), async ({
    page,
  }) => {
    const guard = new LittleGuardPage(page);

    const { cell } = boardOf(DEFAULT_COUNTY, DEFAULT_BAND).find(
      (row) => row.disease === DRAWER_DISEASE,
    )!;

    await guard.goto();
    await guard.row(DRAWER_DISEASE).click();

    const drawer = guard.drawer(DRAWER_DISEASE);

    await expect(drawer).toBeVisible();

    // The drawer's whole job is to turn one cell into a sentence, so the
    // sentence for *this* cell is the oracle that it opened on the right row.
    await expect(
      drawer.getByText(
        describeVisits({
          county: DEFAULT_COUNTY,
          age: DEFAULT_BAND,
          disease: DRAWER_DISEASE,
          cell,
        }),
      ),
    ).toBeVisible();

    await expect(
      drawer.getByRole('heading', { name: '什麼情況要看醫生' }),
    ).toBeVisible();

    await guard.closeDrawer.click();

    await expect(drawer).toHaveCount(0);
    await expect(guard.rowVisits(DRAWER_DISEASE, cell.visits)).toBeVisible();
  });

  /**
   * GUARD-08 runs with no service worker, and that is the case, not a workaround.
   *
   * `diseaseRadar.json` is inside the PWA precache: `vite.config.ts` precaches
   * every built JSON file and excludes only `nursingRooms.json`. So once the
   * worker controls the page, the board's `fetch` is answered out of the precache
   * and never reaches the network — and Playwright cannot see, let alone block, a
   * request a service worker answers. Whether the worker has claimed the client
   * by the time `RadarPage`'s effect runs is a race between the worker's install
   * and the page's lazy chunk: this machine loses that race and CI wins it, so
   * with the worker left on, the same spec passes locally and fails in CI while
   * the app behaves identically in both.
   *
   * Blocking the worker pins the case to the visit it is actually about — a
   * parent arriving with nothing cached, which is the only state in which the
   * board's failure path is reachable at all. A parent with a warm precache is
   * shown the cached board instead, and the freshness banner then tells them how
   * old it is; that is GUARD-02…04's subject, not this one's.
   */
  test.describe('a first visit, with nothing in the PWA precache', () => {
    test.use({ serviceWorkers: 'block' });

    test(('GUARD-08 @p0 the empty state renders when the radar data cannot '
      + 'be loaded'), async ({
      page,
    }) => {
      const guard = new LittleGuardPage(page);

      await page.route('**/data/diseaseRadar.json', (route) =>
        route.abort('failed'),
      );

      await guard.goto();

      await expect(guard.emptyState).toBeVisible();

      // The failure has to be legible as a failure. A board that renders empty
      // reads as "nothing is going around", which is the one thing this page must
      // never say when it does not know.
      for (const { disease } of boardOf(DEFAULT_COUNTY, DEFAULT_BAND)) {
        await expect(guard.row(disease)).toHaveCount(0);
      }

      await expect(guard.boardSummary).toHaveCount(0);
    });
  });

  test(('GUARD-09 @p2 the county chip row scrolls inside itself, not the '
    + 'page'), async ({
    page,
  }) => {
    const guard = new LittleGuardPage(page);
    const counties = Object.keys(RADAR.counties);
    const lastCounty = counties[counties.length - 1];

    await guard.goto();

    await expect(guard.county(DEFAULT_COUNTY)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await expectRowContainsItsOverflow(guard.countyRow);
    await expectNoPageOverflow(page);

    // The invariant above is deliberately silent about whether the row overflows
    // (see `expectRowContainsItsOverflow`), so the consequence is asserted
    // instead: 22 counties do not fit at 320px, and the last of them still has to
    // be reachable by scrolling the row.
    await guard.county(lastCounty).click();
    await expect(guard.county(lastCounty)).toHaveAttribute('aria-pressed', 'true');
  });
});
