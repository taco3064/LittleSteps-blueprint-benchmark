import type { Locator, Page } from '@playwright/test';
import { ROUTE_PATH } from '../../src/domain/routes';
import { AGE_LABEL } from '../../src/domain/radar';
import { SCROLL_ROW } from '../fixtures/testIds';

/**
 * LittleGuard — the disease radar board.
 *
 * Selectors and navigation only; the assertions live in the specs, so a reader
 * can see what is being claimed without opening a second file (plan §9).
 *
 * The board is a page of Traditional Chinese prose with almost no landmarks:
 * the two freshness banners and the board summary are bare `<p>` elements, so
 * they are selected by the copy `RadarPage.tsx` renders. That copy is inline
 * JSX with no exported constant to import — where the page does have a
 * canonical source, such as `AGE_LABEL` and `STATUS_COPY`, it is imported
 * rather than retyped (plan §6).
 */
export class LittleGuardPage {
  /** The 22 county chips. `data-testid` because a scroll container has no role. */
  readonly countyRow: Locator;
  /** The three age-band chips, same reason. */
  readonly ageBandRow: Locator;
  /**
   * The heading above that row. Like the row itself it lives inside the
   * `data && cells` branch, so either one on screen means the board rendered
   * rather than the empty state — which is what makes it this route's marker
   * in `publicRoutePage`.
   */
  readonly ageBandHeading: Locator;
  /** `8/23–8/29 · 疾管署健保門診就診統計` — the week the board is showing. */
  readonly weekLine: Locator;
  /** Rendered only when the data is stale, never when it is fresh or expired. */
  readonly staleBanner: Locator;
  /** Rendered only when the data is expired. */
  readonly expiredBanner: Locator;
  /**
   * The one-line summary of the whole board, hidden once the data expires.
   *
   * Matched by shape rather than by an expected sentence: every summary
   * `summariseBoard` can return opens with 這一週, and a locator built from the
   * sentence the spec expects would report "hidden" for a summary that is
   * merely wrong. The footnote below the board also mentions 這一週 but does
   * not start with it, so the anchor keeps them apart.
   */
  readonly boardSummary: Locator;
  /** The "現在抓不到資料" empty state's `<h2>`, when the data fails to load. */
  readonly emptyState: Locator;
  /** The disease drawer's close button, present only while a drawer is open. */
  readonly closeDrawer: Locator;

  constructor(private readonly page: Page) {
    this.countyRow = page.getByTestId(SCROLL_ROW.guardCounties);
    this.ageBandRow = page.getByTestId(SCROLL_ROW.guardAgeBands);
    this.ageBandHeading = page.getByRole('heading', { name: '孩子的年齡' });
    this.weekLine = page.getByText(/疾管署健保門診就診統計$/);
    this.staleBanner = page.getByText(/^這份資料有點舊了/);
    this.expiredBanner = page.getByText(/^這份資料超過一個月沒更新/);
    this.boardSummary = page.getByText(/^這一週/);
    this.emptyState = page.getByRole('heading', { name: '現在抓不到資料' });
    this.closeDrawer = page.getByRole('button', { name: '關閉' });
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTE_PATH.littleguard);
  }

  /** One county chip, by the name the upstream data uses. */
  county(name: string): Locator {
    return this.countyRow.getByRole('button', { name });
  }

  /** One age-band chip, by the upstream band key such as `0~2`. */
  ageBand(band: string): Locator {
    return this.ageBandRow.getByRole('button', { name: AGE_LABEL[band] ?? band });
  }

  /**
   * One disease's row on the board.
   *
   * A row is a button whose accessible name is assembled from four nested
   * spans, so it is filtered by its text rather than named: no other button on
   * the page carries a disease name, and 手足口病 and 疱疹性咽峽炎 are folded
   * into the 腸病毒 row rather than being rows of their own.
   */
  row(disease: string): Locator {
    return this.page.getByRole('button').filter({ hasText: disease });
  }

  /** The status line inside one row, by the `STATUS_COPY` label it should carry. */
  rowStatus(disease: string, label: string): Locator {
    return this.row(disease).getByText(label, { exact: true });
  }

  /** The visit count inside one row — the half that survives an expired board. */
  rowVisits(disease: string, visits: number): Locator {
    return this.row(disease).getByText(`${visits} 人次`, { exact: true });
  }

  /** The drawer for one disease. `ModalFrame` labels the dialog with its title. */
  drawer(disease: string): Locator {
    return this.page.getByRole('dialog', { name: disease });
  }
}
