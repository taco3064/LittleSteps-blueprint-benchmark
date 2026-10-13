import { ACCESS_LABEL, type RoomAccess } from '../../src/domain/roomCategory';
import { isBlockedUrl } from '../fixtures/blockedHosts';
import { expectNoOverlap } from '../fixtures/layout';
import { expect, test } from '../fixtures/test';
import { BabyOasisPage } from '../pages/babyOasisPage';

/**
 * OASIS-01…08 — the nursing-room map (`docs/E2E_TEST_CASES.md`).
 *
 * The group the access-label invariant lives in. 474 rooms sit behind a staff
 * entrance and 973 need a word at a service desk, and both facts are inferred
 * from the venue's name and its remarks rather than published by the 國健署.
 * A list and a report that disagree about which one applies is a silent
 * failure: nothing throws, the report just describes a claim the app never
 * made. That is what issue #38 was opened about and PR #53 consolidated, and
 * OASIS-02 is the browser-level proof it holds.
 *
 * Every label comes from `ACCESS_LABEL`. Retyping one here would recreate the
 * second vocabulary the consolidation removed.
 */

/**
 * One room per access kind, chosen from `public/data/nursingRooms.json`.
 *
 * `keyword` matches exactly one room today, so a spec never has to reason
 * about which of thirty rendered rows it is looking at. The `access` value is
 * what `accessOf` derives from the published record — a school with no
 * statutory listing is `internal`, 洽…服務台登記 in the remarks is
 * `staff_help`, and a room with neither is a walk-in.
 */
const ROOM = {
  internal: {
    kind: 'an internal venue',
    keyword: '東吳大學',
    name: '東吳大學',
    access: 'internal',
  },
  staffHelp: {
    kind: 'a staff-help venue',
    keyword: '大葉高島屋',
    name: '大葉高島屋百貨股份有限公司',
    address: '臺北市士林區三玉里忠誠路2段55號',
    access: 'staff_help',
  },
  walkIn: {
    kind: 'a walk-in venue',
    keyword: '劍潭站',
    name: '臺北大眾捷運股份有限公司-劍潭站',
    access: 'open',
  },
} as const satisfies Record<
  string,
  { kind: string; keyword: string; name: string; address?: string; access: RoomAccess }
>;

/** A county and a district with internal venues in it, for OASIS-04. */
const AREA = { city: '臺北市', district: '北投區' };

/** The number the results header states, which is the total before the cap. */
async function statedTotal(oasis: BabyOasisPage): Promise<number> {
  const header = await oasis.resultCount.innerText();
  const digits = header.match(/\d+/);
  if (!digits) throw new Error(`no count in the results header: ${header}`);
  return Number(digits[0]);
}

test('OASIS-01 @p1 search finds rooms by name, by address and by district', async ({ page }) => {
  const oasis = new BabyOasisPage(page);
  await oasis.goto();
  await expect(oasis.search).toBeVisible();

  // By name. A keyword matching one venue cannot reach the cap, so the header
  // states a bare count.
  await oasis.search.fill(ROOM.internal.keyword);
  await expect(oasis.resultRow(ROOM.internal.name)).toBeVisible();
  await expect(oasis.resultCount).toHaveText(/^共 \d+ 處$/);

  // By address: 士東路 appears in this room's address and nowhere in its name,
  // so finding it here is the address field being searched.
  await oasis.search.fill('士東路');
  await expect(oasis.resultRow('臺灣士林地方法院')).toBeVisible();

  // By district, which is also where the cap is stated. 30 is `MAX_RESULTS` in
  // `RoomSearch`, which is module-private and cannot be imported.
  await oasis.search.fill(AREA.district);
  await expect(oasis.resultCount).toHaveText(/^共 \d+ 處，先顯示 30 處$/);
  expect(await statedTotal(oasis)).toBeGreaterThan(30);
});

for (const room of [ROOM.internal, ROOM.staffHelp]) {
  test(`OASIS-02 @p0 the list tag and the report agree for ${room.kind}`, async ({ page }) => {
    const oasis = new BabyOasisPage(page);
    const label = ACCESS_LABEL[room.access];

    await oasis.goto();
    await expect(oasis.search).toBeVisible();
    await oasis.search.fill(room.keyword);

    // What the search list claims.
    await expect(oasis.resultTag(room.name, label)).toBeVisible();

    // What the report is about to send about the same room. Selecting the row
    // clears the keyword and opens the sheet, so the list is gone by now —
    // which is the point: the two claims are made on different surfaces.
    await oasis.resultRow(room.name).click();
    await expect(oasis.roomSheet(room.name)).toBeVisible();
    await oasis.reportButton(room.name).click();
    await expect(oasis.reportSheet).toBeVisible();
    await expect(oasis.reportClaim('使用條件')).toContainText(label);
  });
}

test('OASIS-03 @p0 a walk-in room shows no tag but the report still names it', async ({ page }) => {
  const oasis = new BabyOasisPage(page);
  const room = ROOM.walkIn;

  await oasis.goto();
  await expect(oasis.search).toBeVisible();
  await oasis.search.fill(room.keyword);
  await expect(oasis.resultRow(room.name)).toBeVisible();

  // Asserted as an absence, and against every label rather than only the
  // walk-in one: a row with nothing on it is how the list says "just walk in",
  // and a row wearing the wrong tag is the failure this case exists for.
  for (const label of Object.values(ACCESS_LABEL)) {
    await expect(oasis.resultTag(room.name, label)).toHaveCount(0);
  }

  // The report cannot leave it blank, because a blank field there reads as "we
  // have no data" rather than as "there is nothing to say".
  await oasis.resultRow(room.name).click();
  await oasis.reportButton(room.name).click();
  await expect(oasis.reportClaim('使用條件')).toContainText(ACCESS_LABEL.open);
});

test('OASIS-04 @p1 excluding internal venues narrows a filtered list, and clears again', async ({
  page,
}) => {
  const oasis = new BabyOasisPage(page);
  await oasis.goto();
  await expect(oasis.search).toBeVisible();

  // Start from a district, because pressing 排除內部場所 from a clean state is
  // what creates the list — there would be no prior count to compare against.
  await oasis.areaChip.click();
  await oasis.cityChip(AREA.city).click();
  await oasis.districtChip(AREA.district).click();
  await expect(oasis.areaPicker).toBeHidden();

  const withInternal = await statedTotal(oasis);

  await oasis.excludeInternalChip.click();
  await expect(oasis.excludeInternalChip).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => statedTotal(oasis)).toBeLessThan(withInternal);

  await oasis.excludeInternalChip.click();
  await expect(oasis.excludeInternalChip).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => statedTotal(oasis)).toBe(withInternal);
});

test('OASIS-05 @p1 a room sheet opens with its details, and the report form opens signed out', async ({
  page,
}) => {
  const oasis = new BabyOasisPage(page);
  const room = ROOM.staffHelp;

  await oasis.goto();
  await expect(oasis.search).toBeVisible();
  await oasis.search.fill(room.keyword);
  await oasis.resultRow(room.name).click();

  const sheet = oasis.roomSheet(room.name);
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText(room.address)).toBeVisible();
  await expect(sheet.getByRole('heading', { name: '設施' })).toBeVisible();
  // `getFacilityLabel` is module-private in `BabyOasisPage.tsx`, so this label
  // has no canonical source to import; it is the copy for `nursingChair`.
  await expect(sheet.getByText('哺乳椅', { exact: true })).toBeVisible();

  // Visible and usable while signed out. The rules require an account to write
  // the report, which governs what happens after the tap — not whether a
  // parent standing at a locked door has anywhere to go.
  await oasis.reportButton(room.name).click();
  await expect(oasis.reportSheet).toBeVisible();
  await expect(oasis.reportSheet.getByRole('button', { name: '用 Google 登入' })).toBeVisible();
});

test('OASIS-06 @p1 Leaflet mounts and draws clusters with the tiles blocked', async ({ page }) => {
  const oasis = new BabyOasisPage(page);

  // The tiles are declared unreachable, not discovered as a timeout (plan §8),
  // so this collects the evidence that the declaration took effect. Images to
  // a blocked host are the map's tiles; the analytics hosts are blocked too
  // and are not what this case is about.
  const blockedTiles: string[] = [];
  page.on('requestfailed', (request) => {
    if (request.resourceType() === 'image' && isBlockedUrl(request.url())) {
      blockedTiles.push(request.url());
    }
  });

  await oasis.goto();

  await expect(oasis.map).toBeVisible();
  // Clusters are drawn by Leaflet into the container, so one being on screen
  // is the map having mounted and rendered the dataset. `.first()`: the
  // starting zoom draws sixteen of them.
  await expect(oasis.cluster.first()).toBeVisible();
  expect(await oasis.cluster.count()).toBeGreaterThan(0);
  // Leaflet's own attribution control, which only exists once it has mounted.
  await expect(page.getByRole('link', { name: 'OpenStreetMap' })).toBeVisible();
  await expect.poll(() => blockedTiles.length).toBeGreaterThan(0);
});

/**
 * `page.route` intercepts what the page asks for, not what the service worker
 * answers.
 *
 * The 1.1 MB roster is outside the precache — `globIgnores` in
 * `vite.config.ts` keeps it out, so that installing the PWA does not download
 * it for a parent who never opens the map. But the same config gives it a
 * `runtimeCaching` `CacheFirst` entry, and `registerType: 'autoUpdate'` turns
 * on `clientsClaim`, so once a worker is active it serves that URL from its
 * own cache and this abort never happens. Precache-exempt is not
 * fetch-exempt, and that is the distinction the next load-failure case will
 * get wrong.
 *
 * Blocking the worker pins the case to the visit it is about: a parent
 * arriving with nothing cached, which is the only visit on which this failure
 * path is reachable at all.
 */
test.describe('a first visit, with nothing in the PWA precache', () => {
  test.use({ serviceWorkers: 'block' });

  test('OASIS-07 @p0 a failed nursingRooms.json says so and offers a retry', async ({ page }) => {
    const oasis = new BabyOasisPage(page);

    await page.route('**/data/nursingRooms.json', (route) => route.abort('failed'));

    await oasis.goto();

    await expect(oasis.loadFailedTitle).toBeVisible();
    await expect(oasis.reloadRooms).toBeVisible();
    await expect(oasis.appBarSubtitle).toBeVisible();
    // No search box: searching an empty dataset answers "there are no nursing
    // rooms here", which is the sentence this state exists to avoid.
    await expect(oasis.search).toHaveCount(0);
  });
});

test('OASIS-08 @p2 a long venue name truncates beside its tag', async ({ page }) => {
  const oasis = new BabyOasisPage(page);
  const room = ROOM.staffHelp;

  await oasis.goto();
  await expect(oasis.search).toBeVisible();
  await oasis.search.fill(room.keyword);

  // Thirteen characters and a tag beside them: the name truncates, the tag
  // keeps its full width, and the two do not sit on top of each other.
  await expectNoOverlap(
    oasis.resultName(room.name),
    oasis.resultTag(room.name, ACCESS_LABEL[room.access]),
  );
});
