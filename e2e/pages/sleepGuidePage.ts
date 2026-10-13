import type { Locator, Page } from '@playwright/test';
import { ROUTE_PATH } from '../../src/domain/routes';

/**
 * The sleep guide. Public, static, and the largest of the two guides: five
 * datasets render into one page.
 *
 * Selectors and navigation only; the assertions live in the specs (plan §9).
 */
export class SleepGuidePage {
  readonly main: Locator;

  /**
   * The bedtime-ritual steps. Each row is a `role="checkbox"`, which nothing
   * else on the page is, so the role alone counts them.
   */
  readonly ritualSteps: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.ritualSteps = this.main.getByRole('checkbox');
  }

  /** A card title — a sleep-stage range, a safety rule, a training method. */
  cardTitle(name: string): Locator {
    return this.main.getByRole('heading', { level: 3, name });
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTE_PATH['littlesteps/sleep-training']);
  }
}
