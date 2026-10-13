import type { Locator, Page } from '@playwright/test';
import { ROUTE_PATH, type Page as RoutePage } from '../../src/domain/routes';
import { SCROLL_ROW } from '../fixtures/testIds';

/** The three routes that render `WikiBrowser`. */
export type WikiRoute = Extract<
  RoutePage,
  'littlesteps/baby-wiki' | 'littlebloom/wiki' | 'littleexplorer/wiki'
>;

/**
 * A knowledge base — `common/components/wiki/WikiBrowser`, rendered by all
 * three services with nothing but their own data and colours swapped.
 *
 * Selectors and navigation only; the assertions live in the specs (plan §9).
 */
export class WikiBrowserPage {
  /** The only searchbox on the page; its accessible name is its placeholder. */
  readonly search: Locator;
  readonly clearSearch: Locator;
  readonly categoryRow: Locator;

  /**
   * The collapsed article cards, which are the list a parent scrolls.
   *
   * `WikiArticleCard` is a `div` carrying `pressable()`, so every card is a
   * `role="button"` with `aria-expanded` — the one state that separates the
   * cards from the category chips (`aria-pressed`) and the clear button
   * (neither). Expanding a card moves it from this locator to `openArticle`.
   */
  readonly articles: Locator;

  /** The one expanded card, if any. */
  readonly openArticle: Locator;

  /** The heading `CrossWikiResults` renders above its hits. */
  readonly crossWikiHeading: Locator;

  /**
   * The hits from the other two knowledge bases.
   *
   * They are the only buttons on the page holding a level-4 heading: an
   * article card's own title is an `h3`, and the `h4`s inside a card belong to
   * its sections, which exist only while it is expanded. Selecting hits this
   * way therefore assumes no article is open — true for every case that uses
   * it, and a strict-mode violation rather than a silent mismatch if it stops
   * being true.
   */
  readonly crossWikiHits: Locator;

  constructor(
    private readonly page: Page,
    private readonly route: WikiRoute,
  ) {
    this.search = page.getByRole('searchbox');
    this.clearSearch = page.getByRole('button', { name: '清除搜尋' });
    this.categoryRow = page.getByTestId(SCROLL_ROW.wikiCategories);
    this.articles = page.getByRole('button', { expanded: false });
    this.openArticle = page.getByRole('button', { expanded: true });
    this.crossWikiHeading = page.getByRole('heading', { name: '其他階段也有相關文章' });
    this.crossWikiHits = page
      .getByRole('button')
      .filter({ has: page.getByRole('heading', { level: 4 }) });
  }

  get path(): string {
    return ROUTE_PATH[this.route];
  }

  /**
   * One category chip, by the label the owning service passes in — 全部 for
   * the one that clears the filter. Scoped to the row so a category whose
   * label also appears in an article title cannot match the article instead.
   */
  categoryChip(label: string): Locator {
    return this.categoryRow.getByRole('button', { name: label, exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
