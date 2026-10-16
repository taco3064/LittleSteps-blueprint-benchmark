import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTE_PATH, type Page } from '~app/portal/domain/routes/routes';

/**
 * What the analytics events are allowed to carry.
 *
 * The about page promises that usage statistics never contain a child's name,
 * birthday or the content of any record. Nothing enforced that: `logEvent` is
 * exported to any caller, and two helpers used to send a milestone id and a
 * vaccine id plus dose number, which tied to an Analytics client id is a
 * per-device trace of which milestones a child reached and which doses were
 * given. This file pins every helper's payload to a closed key set, so a field
 * added to any event has to be added here on purpose.
 *
 * The real module is loaded with importActual because test/setup.ts mocks
 * lib/firebase wholesale for every other test. `firebase/analytics` is mocked
 * to capture what would have been sent.
 */

const send = vi.fn();

vi.unmock('~app/platform/services/firebase');

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

vi.mock('firebase/database', () => ({ getDatabase: vi.fn(() => ({})) }));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  isSupported: vi.fn(async () => true),
  logEvent: (
    _instance: unknown,
    name: string,
    params?: Record<string, unknown>,
  ) => send(name, params),
}));

type Analytics = typeof import('./telemetry');

async function loadRealFirebase(): Promise<Analytics> {
  vi.resetModules();

  return (await vi.importActual('./telemetry')) as Analytics;
}

/** Every event a helper can emit, and the only keys each may carry. */
const ALLOWED: Record<string, string[]> = {
  page_view: [
    'page_name',
    'page_path',
    'page_location',
    'page_title',
    'app_name',
    'app_section',
    'app_feature',
  ],
  milestone_toggle: ['achieved'],
  vaccine_toggle: ['administered'],
  child_profile_action: ['action'],
  auth_action: ['action'],
};

/**
 * A key that would name something about a child. `name` on its own is not in
 * the list because `page_name` and `app_name` are legitimate page dimensions;
 * the closed allowlist above is what stops a `child_name` from arriving.
 */
const CHILD_SHAPED
  = /child|birth|gender|member|uid|milestone_id|vaccine_id|dose|record|diary/i;

const sent = () =>
  send.mock.calls as [string, Record<string, unknown> | undefined][];

describe('analytics payloads', () => {
  beforeEach(() => {
    send.mockClear();
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('every helper sends only the keys on its allowlist', async () => {
    const fb = await loadRealFirebase();

    fb.logPageView('littlesteps/dashboard');
    fb.logMilestoneToggle(true);
    fb.logVaccineToggle(false);
    fb.logChildProfileAction('create');
    fb.logAuthEvent('login');

    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(5));

    for (const [name, params] of sent()) {
      expect(Object.keys(ALLOWED), `unexpected event ${name}`).toContain(name);

      expect(Object.keys(params ?? {}).sort(), name).toEqual(
        [...ALLOWED[name]].sort(),
      );
    }
  });

  it('carries no key that could name something about a child', async () => {
    const fb = await loadRealFirebase();

    fb.logPageView('littlesteps/vaccine-tracking');
    fb.logMilestoneToggle(false);
    fb.logVaccineToggle(true);

    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(3));

    for (const [name, params] of sent()) {
      for (const key of Object.keys(params ?? {})) {
        expect(key, `${name}.${key}`).not.toMatch(CHILD_SHAPED);
      }
    }
  });

  it('the toggle events say what happened, never to which item', async () => {
    // The mutation this exists for: putting the id back. A test on the
    // allowlist alone would also catch it, but this one names the reason.
    const fb = await loadRealFirebase();

    fb.logMilestoneToggle(true);
    fb.logVaccineToggle(true);

    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));

    expect(sent()).toEqual([
      ['milestone_toggle', { achieved: true }],
      ['vaccine_toggle', { administered: true }],
    ]);
  });

  it('page_title is the static title of the route, for every route', async () => {
    // page_view sends document.title. It is safe today only because
    // useDocumentMeta sets a title from the static meta table; a title that
    // named the current child would ride out in every page view.
    const fb = await loadRealFirebase();
    const { metaFor } = await import('~app/portal/domain/pageMeta/pageMeta');
    const pages = Object.keys(ROUTE_PATH) as Page[];

    for (const page of pages) {
      document.title = metaFor(page).title;
      fb.logPageView(page);
    }

    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(pages.length));

    for (const [, params] of sent()) {
      const title = params?.page_title as string;

      expect(pages.map((page) => metaFor(page).title)).toContain(title);
    }
  });
});
