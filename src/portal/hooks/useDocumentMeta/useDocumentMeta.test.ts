import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { metaFor } from '~app/portal/domain/pageMeta/pageMeta';
import { requiresAuth } from '~app/portal/domain/routePolicy/routePolicy';
import { ROUTE_PATH, type Page } from '~app/portal/domain/routes/routes';
import { useDocumentMeta } from './useDocumentMeta';

/**
 * The document title is static per route and never names a child.
 *
 * `logPageView` sends `document.title` with every page view, so the about
 * page's promise that usage statistics carry no child's name rests on this
 * hook reading the title from the static meta table and nothing else. A
 * future 「{child.name} 的成長總覽」 in the tab title would leak the name into
 * analytics without touching lib/firebase.ts; this test is where that turns
 * red.
 */
const pages = Object.keys(ROUTE_PATH) as Page[];

describe('useDocumentMeta', () => {
  it(
    'sets the title and description from the static meta table, for '
    + 'every route',
    () => {
      for (const page of pages) {
        const { unmount } = renderHook(() => useDocumentMeta(page));

        expect(document.title, page).toBe(metaFor(page).title);

        expect(
          document.head
            .querySelector('meta[name="description"]')
            ?.getAttribute('content'),
          page,
        ).toBe(metaFor(page).description);

        unmount();
      }
    },
  );

  it(
    'tells crawlers to stay off every route that reads a child, and '
    + 'only those',
    () => {
      for (const page of pages) {
        const { unmount } = renderHook(() => useDocumentMeta(page));

        const robots = document.head
          .querySelector('meta[name="robots"]')
          ?.getAttribute('content');

        expect(robots, page).toBe(
          requiresAuth(page) ? 'noindex, follow' : 'index, follow',
        );

        unmount();
      }
    },
  );
});
