import { CENTRE_ACCESS, CENTRE_ACCESS_UNVERIFIED } from './domain/centreAccess/data';
import { outingChecklist } from './domain/outingChecklist/data';
import { restaurants } from './domain/restaurants/data';
import { expect, test } from '../../e2e/fixtures/test';
import { OutingPage } from '../../e2e/pages/outingPage';

test.describe('outing', () => {
  /**
   * OUTING-01…05 — family centres, restaurants and the checklist.
   *
   * OUTING-03 is the one that matters. The 社家署 roster says where a centre is
   * and nothing about whether a parent can get in, so the entry rules are read
   * off official pages county by county and only four counties have been done.
   * Showing a county's rules where none were verified — or showing nothing,
   * which reads as "no rules" — is public-service information a family plans a
   * trip around, and the P0 the risk model leads with.
   *
   * The rule text, the unverified sentence and the checklist all come from the
   * modules that own them; none of it is retyped here.
   */

  /** A county whose rules were verified, and one where they were not. */
  const VERIFIED_CITY = '臺北市';
  const UNVERIFIED_CITY = '臺南市';

  test(('OUTING-01 @p1 switching views renames the search box and changes '
    + 'the results'), async ({
    page,
  }) => {
    const outing = new OutingPage(page);
    const restaurant = restaurants[0];

    await outing.goto();

    // 親子館 is the landing view.
    await expect(outing.centreTab).toHaveAttribute('aria-pressed', 'true');

    await expect(outing.centreSearch).toHaveAttribute(
      'placeholder',
      '搜尋館名、地址或區域',
    );

    await expect(outing.venueCard(restaurant.name)).toHaveCount(0);

    await outing.restaurantTab.click();

    await expect(outing.restaurantTab).toHaveAttribute('aria-pressed', 'true');
    await expect(outing.centreTab).toHaveAttribute('aria-pressed', 'false');

    await expect(outing.restaurantSearch).toHaveAttribute(
      'placeholder',
      '搜尋餐廳、地址或區域',
    );

    await expect(outing.centreSearch).toHaveCount(0);
    await expect(outing.venueCard(restaurant.name)).toBeVisible();

    // The restaurants are a sample, not a roster, and the page has to say so.
    await expect(
      page.getByRole('heading', { name: '這是精選，不是完整名單' }),
    ).toBeVisible();
  });

  test(('OUTING-02 @p1 a search filters the list and clearing it restores '
    + 'the list'), async ({
    page,
  }) => {
    const outing = new OutingPage(page);
    const [first, second] = restaurants;

    // The restaurant view, because its twelve rows ship with the bundle: the
    // full list is `restaurants.length` rather than whatever arrived over the
    // network, so "restored" is an assertion and not an observation.
    await outing.goto();
    await outing.restaurantTab.click();
    await expect(outing.resultCount).toHaveText(`共 ${restaurants.length} 處`);

    await outing.restaurantSearch.fill(first.name);
    await expect(outing.venueCard(first.name)).toBeVisible();
    await expect(outing.venueCard(second.name)).toHaveCount(0);
    await expect(outing.resultCount).toHaveText('共 1 處');

    await outing.clearSearch.click();
    await expect(outing.restaurantSearch).toHaveValue('');
    await expect(outing.venueCard(second.name)).toBeVisible();
    await expect(outing.resultCount).toHaveText(`共 ${restaurants.length} 處`);
  });

  test(('OUTING-03 @p0 a county shows its verified rules, or says they are '
    + 'unverified'), async ({
    page,
  }) => {
    const outing = new OutingPage(page);
    const access = CENTRE_ACCESS[VERIFIED_CITY];

    // The two counties this case is built on have to still be what it says they
    // are; `centreAccess.ts` grows a county at a time.
    expect(access, `${VERIFIED_CITY} has no verified rules any more`).toBeDefined();

    expect(
      CENTRE_ACCESS[UNVERIFIED_CITY],
      `${UNVERIFIED_CITY} is verified now`,
    ).toBeUndefined();

    await outing.goto();
    await outing.cityChip(VERIFIED_CITY).click();

    await expect(outing.cityChip(VERIFIED_CITY)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await expect(outing.accessHeading(VERIFIED_CITY)).toBeVisible();

    for (const rule of [
      access.fee,
      access.ageLimit,
      access.booking,
      access.residency,
    ]) {
      await expect(page.getByText(rule.value)).toBeVisible();
    }

    await expect(page.getByText(CENTRE_ACCESS_UNVERIFIED)).toHaveCount(0);

    await outing.cityChip(UNVERIFIED_CITY).click();

    await expect(outing.accessHeading(UNVERIFIED_CITY)).toBeVisible();
    await expect(page.getByText(CENTRE_ACCESS_UNVERIFIED)).toBeVisible();
    // Never one county's rules under another county's heading.
    await expect(page.getByText(access.fee.value)).toHaveCount(0);
  });

  /**
   * OUTING-04 runs with no service worker, and that is the case rather than a
   * convenience.
   *
   * `familyCentres.json` is inside the PWA precache — `vite.config.ts` precaches
   * every built JSON file and `globIgnores` excludes only `nursingRooms.json`, so
   * the built worker carries this roster and OASIS-07's dataset is the one that
   * is fetched cold. Once the worker controls the page, the page's `fetch` is
   * answered from that precache and never reaches the network, and Playwright
   * cannot block a request a service worker answers. Whether the worker has
   * claimed the client before `OutingPage`'s effect runs is a race with the lazy
   * chunk, so the same spec passes on one machine and fails on another while the
   * app behaves identically on both.
   *
   * Blocking the worker pins the case to the visit it is about: a parent arriving
   * with nothing cached, which is the only visit on which this failure path is
   * reachable at all. A parent with a warm precache is shown the cached roster
   * instead, which is a different case and not a broken one.
   */
  test.describe('a first visit, with nothing in the PWA precache', () => {
    test.use({ serviceWorkers: 'block' });

    test(('OUTING-04 @p0 a failed familyCentres.json says so instead of '
      + 'listing nothing'), async ({
      page,
    }) => {
      const outing = new OutingPage(page);

      await page.route('**/data/familyCentres.json', (route) =>
        route.abort('failed'),
      );

      await outing.goto();

      await expect(outing.loadFailedTitle).toBeVisible();

      // An empty list here would read as "there are no venues near you".
      await expect(
        page.getByRole('heading', { name: '找不到符合的場地' }),
      ).toHaveCount(0);
    });
  });

  test(('OUTING-05 @p2 the checklist tab renders every item with its '
    + 'reason'), async ({
    page,
  }) => {
    const outing = new OutingPage(page);

    await outing.goto();
    await outing.checklistTab.click();

    // Every item, not a sample: the list is short and each entry is one way a
    // trip gets wasted, so a silently dropped item is a missing warning.
    await expect(outing.checklistQuestions).toHaveCount(outingChecklist.length);

    for (const item of outingChecklist) {
      await expect(page.getByRole('heading', { name: item.question })).toBeVisible();
      await expect(page.getByText(item.why)).toBeVisible();
    }
  });
});
