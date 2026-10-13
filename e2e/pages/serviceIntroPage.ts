import type { Locator, Page as BrowserPage } from '@playwright/test';
import { ROUTE_PATH, type Page } from '../../src/domain/routes';
import { serviceOf } from '../../src/domain/routePolicy';
import { SERVICE_THEME } from '../../src/domain/serviceTheme';

/**
 * What a signed-out visitor gets on a route that requires signing in: that
 * service's own intro page, rendered **at the same URL**.
 *
 * `landingKindFor` picks `steps-intro` or `service-intro` for exactly these
 * routes, so this one page object covers all fifteen of them.
 *
 * Selectors and navigation only; the assertions live in the specs (plan §9).
 */
export class ServiceIntroPage {
  /**
   * The sign-in call to action, and the marker that says a visitor was
   * blocked.
   *
   * `StepsLanding` says 使用 Google 登入開始記錄 and `ServiceLanding` says
   * 使用 Google 登入開始使用, so the prefix has to reach as far as 開始: the
   * public hub also offers sign-in, as plain 使用 Google 登入, and a shorter
   * prefix would match it and call the entry point a blocked route.
   */
  readonly signIn: Locator;

  /**
   * Content that only exists once a child's record is on screen — the
   * two-sided oracle's negative half for AUTH-02.
   *
   * "No child data" has no locator of its own, so this is a fixed list of the
   * things a leak would put on the page, one per gated feature the catalogue
   * names: the daily log's quick-record buttons, the growth chart panel, a
   * vaccine dose control and a milestone toggle.
   *
   * The growth chart is matched by its own heading rather than by an `svg`
   * element selector: every Lucide icon in the app is an `svg` too, so `svg`
   * would match on any page and assert nothing.
   */
  readonly gatedContent: Locator[];

  constructor(private readonly page: BrowserPage) {
    this.signIn = page.getByRole('button', { name: /^使用 Google 登入開始/ });
    this.gatedContent = [
      page.getByRole('button', { name: '餵奶' }),
      page.getByRole('heading', { name: /成長曲線圖/ }),
      page.getByRole('button', { name: /記錄接種日期$/ }),
      page.getByRole('button', { name: /^(標記完成|取消完成)$/ }),
    ];
  }

  async goto(route: Page): Promise<void> {
    await this.page.goto(ROUTE_PATH[route]);
  }

  /**
   * The intro heading for the service that owns this route.
   *
   * Derived through `serviceOf` and `SERVICE_THEME` rather than mapping paths
   * to wordmarks by hand — `serviceOf` returns null only for `home`, which is
   * public and therefore never reaches an intro page.
   */
  heading(route: Page): Locator {
    const service = serviceOf(route);
    if (!service) throw new Error(`no service owns ${route}, so it has no intro page`);
    return this.page.getByRole('heading', { name: SERVICE_THEME[service].name, exact: true });
  }
}
