import type { Locator, Page } from '@playwright/test';
import { ROUTE_PATH } from '../../src/domain/routes';

/**
 * The care guide — one of the two LittleSteps guides that are public, and the
 * only public LittleSteps route that is neither a wiki nor a landing page.
 *
 * Selectors and navigation only; the assertions live in the specs (plan §9).
 */
export class CareGuidePage {
  /**
   * The content column. `App.tsx` renders a `<main>` for every LittleSteps
   * route, so scoping to it keeps the `AppBar` heading out of the counts.
   */
  readonly main: Locator;

  /**
   * One per safety item and one per monthly guide, and nothing else on the
   * page: the two section titles above them are `h2`.
   */
  readonly cardTitles: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.cardTitles = this.main.getByRole('heading', { level: 3 });
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTE_PATH['littlesteps/care-guide']);
  }
}
