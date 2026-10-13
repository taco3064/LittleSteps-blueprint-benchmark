import type { Locator, Page as BrowserPage } from '@playwright/test';
import { ROUTE_PATH, type Page } from '../../src/domain/routes';
import { PUBLIC_ROUTES } from '../fixtures/routes';
import { BabyOasisPage } from './babyOasisPage';
import { CareGuidePage } from './careGuidePage';
import { HubPage } from './hubPage';
import { LittleGuardPage } from './littleGuardPage';
import { OutingPage } from './outingPage';
import { SleepGuidePage } from './sleepGuidePage';
import { WikiBrowserPage } from './wikiBrowserPage';

/**
 * The ten routes a visitor reaches without an account.
 *
 * Selectors and navigation only; the assertions live in the specs (plan §9).
 *
 * Two markers per route, because the suite asks two different questions of the
 * same page and one locator cannot answer both:
 *
 * - `content` — "this is the real page, not the intro page a blocked visitor
 *   would see". AUTH-03's oracle. The wordmark in the header is deliberately
 *   not used: `/littleexplorer/wiki` renders `LittleExplorer` in its `AppBar`,
 *   and so does the LittleExplorer intro page.
 * - `ready` — "the runtime data has arrived and the page is finished". What
 *   the layout invariants and the console sweep wait on before measuring:
 *   three of the ten fetch a data file after mount, and measuring the painted
 *   shell measures the wrong page.
 *
 * They coincide on some routes and diverge on others, so both are stated per
 * route rather than one being derived from the other.
 */
export class PublicRoutePage {
  constructor(private readonly page: BrowserPage) {}

  async goto(route: Page): Promise<void> {
    await this.page.goto(ROUTE_PATH[route]);
  }

  /** Content only the real page at `route` renders. */
  content(route: Page): Locator {
    const marker = CONTENT[route];
    if (!marker) throw new Error(`${route} is not a public route, so it has no content marker`);
    return marker(this.page);
  }

  /** Content that exists only once `route` has its runtime data on screen. */
  ready(route: Page): Locator {
    const marker = READY[route];
    if (!marker) throw new Error(`${route} is not a public route, so it has no ready marker`);
    return marker(this.page);
  }
}

/**
 * Traditional Chinese appears here because these strings are the literal UI
 * copy a selector matches — the one thing `e2e/README.md` keeps in Chinese.
 * None has a canonical constant in `src/` to import instead; each is written
 * inline in the page that renders it. Where a service already has a page
 * object naming the same control, that page object is the one home for it.
 */
const CONTENT: Partial<Record<Page, (page: BrowserPage) => Locator>> = {
  // The hub's first group heading. It answers the question the page exists to
  // answer — which of the six services is mine — so it is the last thing that
  // would survive the page being replaced by something else.
  home: (page) => page.getByRole('heading', { name: '依孩子的階段' }),
  // The medical disclaimer's heading: the one section of the about page that
  // must never be cut, so the last thing to survive the page being replaced.
  about: (page) => page.getByRole('heading', { name: '這不是醫療建議' }),

  'littlesteps/care-guide': (page) => page.getByRole('heading', { name: '按月齡照顧重點' }),
  'littlesteps/sleep-training': (page) => page.getByRole('heading', { name: '睡眠時間參考表' }),
  // `WikiBrowser`'s search box carries no `aria-label`, so its placeholder is
  // its accessible name.
  'littlesteps/baby-wiki': (page) => page.getByRole('searchbox', { name: '搜尋症狀、關鍵字...' }),
  // `BloomShell` puts the page's own title in the `AppBar`, not the wordmark.
  'littlebloom/wiki': (page) => page.getByRole('heading', { name: '孕期知識庫' }),
  'littleexplorer/wiki': (page) => page.getByRole('heading', { name: '依年齡看' }),
  littleouting: (page) => new OutingPage(page).centreSearch,
  babyoasis: (page) => new BabyOasisPage(page).search,
  // The age-band picker's heading, which renders only once the radar's own
  // data file has arrived — so this also says the page reached its content,
  // not just its shell.
  littleguard: (page) => new LittleGuardPage(page).ageBandHeading,
};

/**
 * The first row of the real content, never the `AppBar`: the header renders
 * while the lazy chunk is still loading, so a marker taken from it says
 * nothing about whether the page is finished.
 */
const READY: Partial<Record<Page, (page: BrowserPage) => Locator>> = {
  // The hub has no `AppBar`, so its `h1` is the only one on the page.
  home: (page) => new HubPage(page).title,
  // Static page: the first source card's link is real content, not AppBar.
  about: (page) => page.getByRole('link', { name: '開啟原始資料' }).first(),
  'littlesteps/care-guide': (page) => new CareGuidePage(page).cardTitles.first(),
  'littlesteps/sleep-training': (page) => new SleepGuidePage(page).ritualSteps.first(),
  'littlesteps/baby-wiki': (page) =>
    new WikiBrowserPage(page, 'littlesteps/baby-wiki').articles.first(),
  'littlebloom/wiki': (page) => new WikiBrowserPage(page, 'littlebloom/wiki').articles.first(),
  'littleexplorer/wiki': (page) =>
    new WikiBrowserPage(page, 'littleexplorer/wiki').articles.first(),
  // Renders on a family-centre card, so it waits for `familyCentres.json`.
  littleouting: (page) => new OutingPage(page).reportButtons.first(),
  // The search input renders once the 1.1 MB nursing-room dataset has arrived.
  babyoasis: (page) => new BabyOasisPage(page).search,
  // The chip row lives inside the `data && cells` branch, so it exists only
  // with a board on screen.
  littleguard: (page) => new LittleGuardPage(page).ageBandRow,
};

/**
 * Both tables cover every public route, checked when this module is imported
 * rather than when a marker is first asked for.
 *
 * A missing entry is a route someone made public without saying how to tell it
 * rendered, and the cases that iterate `PUBLIC_ROUTES` would otherwise fail
 * one at a time, deep inside a run, in a message about a locator. Failing at
 * collection names the real problem once.
 */
for (const route of PUBLIC_ROUTES) {
  if (!CONTENT[route]) {
    throw new Error(`${route} is public but has no content marker: add one to publicRoutePage.ts`);
  }
  if (!READY[route]) {
    throw new Error(`${route} is public but has no ready marker: add one to publicRoutePage.ts`);
  }
}
