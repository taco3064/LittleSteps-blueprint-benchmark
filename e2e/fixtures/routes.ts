import { requiresAuth } from "~app/portal/domain/routePolicy";
import { ROUTE_PATH, type Page } from "~app/portal/domain/routes";

/**
 * The two route lists, derived from the product's own allowlist.
 *
 * AUTH-01…04 and SEO-01/02 all need "which routes need signing in", and the
 * catalogue is explicit that they must derive it rather than restate it: a
 * hard-coded path list is a second vocabulary that stays green when someone
 * adds a route and forgets to classify it, which is the one failure
 * `routePolicy.ts` is shaped to prevent.
 *
 * Importing production modules into a spec works here because both are free of
 * runtime dependencies. `types/routes.ts` is a `const` object and two pure
 * functions; `routePolicy.ts` imports only types and re-exports `ServiceId`
 * with `export type`, which the transpiler erases. Neither pulls in React, a
 * stylesheet or the Firebase SDK, so a Node-side import of either costs
 * nothing and cannot fail for a reason unrelated to the test.
 */
export const ALL_ROUTES = Object.keys(ROUTE_PATH) as Page[];

/** Reachable without an account. Ten pages, and the only ones ever indexed. */
export const PUBLIC_ROUTES = ALL_ROUTES.filter((route) => !requiresAuth(route));

/** Everything else: a signed-out visitor gets that service's intro page here. */
export const GATED_ROUTES = ALL_ROUTES.filter((route) => requiresAuth(route));

/** The path a route lives at, for `goto` and for reading `location.pathname`. */
export function pathOf(route: Page): string {
  return ROUTE_PATH[route];
}

/**
 * The pathname the address bar is showing, with any trailing slash removed.
 *
 * `pageFromPath` treats `/littleouting` and `/littleouting/` as one page — a
 * shared link must not fall back to the hub over one character — and a static
 * handler is free to redirect between the two forms. Comparing the normalised
 * path is therefore what "the app did not move the visitor" actually means.
 */
export function currentPath(url: string): string {
  const { pathname } = new URL(url);
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}
