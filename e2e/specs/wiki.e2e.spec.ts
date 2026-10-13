import { expect, test } from '../fixtures/test';
import { CareGuidePage } from '../pages/careGuidePage';
import { SleepGuidePage } from '../pages/sleepGuidePage';
import { WikiBrowserPage, type WikiRoute } from '../pages/wikiBrowserPage';
import { ROUTE_PATH } from '../../src/domain/routes';
import { babyWikiArticles, wikiCategoryLabels } from '../../src/domain/babyWiki';
import type { WikiCategory } from '../../src/domain/records';
import { pregnancyWikiArticles } from '../../src/domain/pregnancyWiki';
import { toddlerWikiArticles } from '../../src/domain/toddlerWiki';
import { generalSafetyItems, monthlyCareGuides } from '../../src/domain/careGuides';
import {
  sleepRequirements,
  sleepRitualSteps,
  sleepTrainingMethods,
} from '../../src/domain/sleep';

/**
 * WIKI-01…05 — the three knowledge bases, the care guide and the sleep guide.
 *
 * All five pages are public and all of them render a real data file at
 * runtime, which is the gap in the plan's §1 table that a component test
 * cannot see: a wiki whose data failed to arrive renders a perfectly healthy
 * empty state, and nothing throws.
 *
 * The article counts are imported rather than typed out. A literal here would
 * be a second copy of the corpus size that goes stale the day someone adds an
 * article, and the point of the assertion is that *every* article the file
 * holds reached the browser — not that some did.
 */

const WIKIS: { route: WikiRoute; articles: readonly { title: string }[] }[] = [
  { route: 'littlesteps/baby-wiki', articles: babyWikiArticles },
  { route: 'littlebloom/wiki', articles: pregnancyWikiArticles },
  // The toddler wiki filters by age band above the browser, but its default is
  // 全部 whenever there is no child — which is every Phase 1 visitor — so the
  // list it renders is the whole file, like the other two.
  { route: 'littleexplorer/wiki', articles: toddlerWikiArticles },
];

for (const { route, articles } of WIKIS) {
  test(`WIKI-01 @p0 ${route} lists all ${articles.length} of its articles`, async ({ page }) => {
    const wiki = new WikiBrowserPage(page, route);

    await wiki.goto();

    await expect(wiki.articles).toHaveCount(articles.length);
  });
}

test('WIKI-02 @p1 an article expands and collapses in place, without touching the URL', async ({
  page,
}) => {
  const wiki = new WikiBrowserPage(page, 'littlesteps/baby-wiki');
  await wiki.goto();
  await expect(wiki.articles).toHaveCount(babyWikiArticles.length);

  // Articles are an accordion — `WikiBrowser` holds `expandedId` in state and
  // writes nothing to the address bar. So this case asserts the URL is
  // untouched rather than asserting a history entry: there is no per-article
  // route to go back to, and inventing one is a product decision, not a fix
  // for a red test.
  const urlBeforeExpanding = page.url();
  const first = wiki.articles.first();
  const title = (await first.getByRole('heading', { level: 3 }).innerText()).trim();

  await first.click();

  // In place: the sections render inside the same card as the title, which is
  // what `openArticle` scoping these two locators asserts.
  await expect(wiki.openArticle).toHaveCount(1);
  await expect(wiki.openArticle.getByRole('heading', { level: 3, name: title })).toBeVisible();
  await expect(wiki.openArticle.getByRole('heading', { name: '處理方式' })).toBeVisible();
  await expect(wiki.articles).toHaveCount(babyWikiArticles.length - 1);
  expect(page.url(), 'expanding an article changed the URL').toBe(urlBeforeExpanding);

  await wiki.openArticle.click();

  await expect(wiki.openArticle).toHaveCount(0);
  await expect(wiki.articles).toHaveCount(babyWikiArticles.length);
  expect(page.url(), 'collapsing an article changed the URL').toBe(urlBeforeExpanding);
});

test('WIKI-03 @p1 searching narrows the list and clearing restores it', async ({ page }) => {
  const wiki = new WikiBrowserPage(page, 'littlesteps/baby-wiki');
  await wiki.goto();
  await expect(wiki.articles).toHaveCount(babyWikiArticles.length);

  await wiki.search.fill('發燒');

  // How many articles match is a property of the corpus on the day, and
  // recomputing it here with the app's own `matchesKeyword` would assert
  // nothing but that the function is itself. What must hold is that the search
  // narrowed the list without emptying it.
  await expect(wiki.articles).not.toHaveCount(babyWikiArticles.length);
  const narrowed = await wiki.articles.count();
  expect(narrowed, 'searching a keyword the corpus contains emptied the list').toBeGreaterThan(0);

  await wiki.clearSearch.click();

  await expect(wiki.articles).toHaveCount(babyWikiArticles.length);
});

test('WIKI-03 @p1 a category chip narrows the list and 全部 restores it', async ({ page }) => {
  const wiki = new WikiBrowserPage(page, 'littlesteps/baby-wiki');
  // The chip's label comes from the data file that defines the category, not
  // from a copy of it here.
  const category: WikiCategory = 'fever';
  const inCategory = babyWikiArticles.filter((article) => article.category === category).length;

  await wiki.goto();
  await expect(wiki.articles).toHaveCount(babyWikiArticles.length);

  await wiki.categoryChip(wikiCategoryLabels[category]).click();

  // Unlike the search, this filter is a plain equality on a field the data
  // file states, so the expected count is data rather than a second copy of
  // the app's matching rule.
  expect(inCategory, 'the chosen category has no articles to filter down to').toBeGreaterThan(0);
  await expect(wiki.articles).toHaveCount(inCategory);
  await expect(wiki.categoryChip(wikiCategoryLabels[category])).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await wiki.categoryChip('全部').click();

  await expect(wiki.articles).toHaveCount(babyWikiArticles.length);
});

test('WIKI-04 @p1 the care guide renders its guides signed out', async ({ page }) => {
  const careGuide = new CareGuidePage(page);

  await careGuide.goto();

  // One card title per safety item and one per monthly guide. Counting both
  // datasets in one assertion is what catches a file that loaded halfway.
  await expect(careGuide.cardTitles).toHaveCount(
    generalSafetyItems.length + monthlyCareGuides.length,
  );
  const last = monthlyCareGuides[monthlyCareGuides.length - 1];
  await expect(careGuide.main.getByRole('heading', { level: 3, name: last.title })).toBeVisible();
});

test('WIKI-04 @p1 the sleep guide renders its methods and ritual signed out', async ({ page }) => {
  const sleepGuide = new SleepGuidePage(page);

  await sleepGuide.goto();

  for (const method of sleepTrainingMethods) {
    await expect(sleepGuide.cardTitle(method.title)).toBeVisible();
  }
  const lastStage = sleepRequirements[sleepRequirements.length - 1];
  await expect(sleepGuide.cardTitle(lastStage.ageRange)).toBeVisible();
  await expect(sleepGuide.ritualSteps).toHaveCount(sleepRitualSteps.length);
});

test('WIKI-05 @p1 a cross-wiki hit lands on the other wiki with the keyword kept', async ({
  page,
}) => {
  const keyword = '發燒';
  const sourceRoute: WikiRoute = 'littlesteps/baby-wiki';
  const source = new WikiBrowserPage(page, sourceRoute);

  await source.goto();
  await source.search.fill(keyword);

  // The other two wikis arrive through a dynamic import, so this heading is
  // also the signal that the lazy chunk resolved.
  await expect(source.crossWikiHeading).toBeVisible();
  const hit = source.crossWikiHits.first();
  const hitTitle = (await hit.getByRole('heading', { level: 4 }).innerText()).trim();

  await hit.click();

  // One click exercises the path parser, the query string and a second lazy
  // chunk. `goTo` pushes the path and the query in a single `pushState`, so
  // waiting for the path to change is enough to have both.
  await page.waitForURL((url) => url.pathname !== source.path);
  const landed = new URL(page.url());
  const landedRoute = WIKIS.map(({ route }) => route).find(
    (route) => route !== sourceRoute && ROUTE_PATH[route] === landed.pathname,
  );
  if (!landedRoute) {
    throw new Error(`the hit did not land on another wiki: ${landed.pathname}`);
  }
  expect(landed.searchParams.get('q'), 'the keyword did not survive the navigation').toBe(keyword);

  // Landing mid-search is the whole point: `WikiBrowser` seeds its query from
  // the URL, so the article the parent tapped is in the filtered list rather
  // than 30 articles below it.
  const target = new WikiBrowserPage(page, landedRoute);
  await expect(target.search).toHaveValue(keyword);
  await expect(
    target.articles.filter({ has: page.getByRole('heading', { level: 3, name: hitTitle }) }),
    'the article behind the hit is not in the list it landed on',
  ).toHaveCount(1);
});
