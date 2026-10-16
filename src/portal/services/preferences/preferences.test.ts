import { afterEach, describe, expect, it } from 'vitest';
import {
  readPreferences,
  savePreferences,
  type ViewPreferences,
} from './preferences';

/**
 * The store's whole job is to be harmless. It is read at mount by three public
 * pages, so anything it can return has to be something those pages can live
 * with, and anything it can write has to be something a stranger reading the
 * device's storage learns nothing about a family from.
 *
 * The key is duplicated here on purpose: these tests are about what actually
 * lands in `localStorage`, so importing the constant would let the two drift
 * together and prove nothing.
 */
const KEY = 'littlesteps:view-prefs:v1';

const DEFAULTS: ViewPreferences = {
  guardCounty: null,
  guardAgeBand: null,
  outingTab: null,
  outingCity: null,
  oasisCity: null,
  oasisDistrict: null,
  oasisCategory: null,
  oasisExcludeInternal: false,
};

afterEach(() => {
  localStorage.clear();
});

describe('reading and writing a choice', () => {
  it('returns the defaults when nothing has ever been stored', () => {
    expect(readPreferences()).toEqual(DEFAULTS);
  });

  it('reads back what was saved', () => {
    savePreferences({ guardCounty: '高雄市', guardAgeBand: '3~6' });
    expect(readPreferences().guardCounty).toBe('高雄市');
    expect(readPreferences().guardAgeBand).toBe('3~6');
  });

  it(
    'merges, so one service saving a filter does not forget another '
    + 'service',
    () => {
      // All three surfaces share one key. A write that replaced the blob would
      // mean opening BabyOasis wipes the county LittleGuard was told about.
      savePreferences({ guardCounty: '高雄市' });

      savePreferences({
        oasisCategory: 'shopping',
        oasisExcludeInternal: true,
      });

      savePreferences({ outingTab: 'restaurant' });

      expect(readPreferences()).toEqual({
        ...DEFAULTS,
        guardCounty: '高雄市',
        oasisCategory: 'shopping',
        oasisExcludeInternal: true,
        outingTab: 'restaurant',
      });
    },
  );

  it('forgets a choice that is cleared back to nothing', () => {
    savePreferences({ oasisCity: '臺北市', oasisDistrict: '士林區' });
    savePreferences({ oasisCity: null, oasisDistrict: null });
    expect(readPreferences().oasisCity).toBeNull();
    expect(readPreferences().oasisDistrict).toBeNull();
  });
});

describe('a blob that cannot be trusted', () => {
  it('treats an unparseable blob as no blob at all', () => {
    localStorage.setItem(KEY, '{"guardCounty":');
    expect(readPreferences()).toEqual(DEFAULTS);
  });

  it('treats a blob that is not an object as no blob at all', () => {
    for (const raw of ['null', '42', '"高雄市"', '["高雄市"]']) {
      localStorage.setItem(KEY, raw);
      expect(readPreferences()).toEqual(DEFAULTS);
    }
  });

  it(
    'drops a stale shape field by field instead of handing it to a ' + 'page',
    () => {
      // An older version of a field, or a hand-edited blob. Each surface has to
      // get either a usable value or the default it had before this module
      // existed — never a shape it will then index into.
      localStorage.setItem(
        KEY,
        JSON.stringify({
          guardCounty: { name: '高雄市' },
          guardAgeBand: 3,
          outingCity: '',
          oasisExcludeInternal: 'true',
          oasisCategory: 'shopping',
        }),
      );

      expect(readPreferences()).toEqual({
        ...DEFAULTS,
        oasisCategory: 'shopping',
      });
    },
  );

  it('discards a blob carrying a key it does not own, whole', () => {
    // A key outside the owned set means the blob was not written by this
    // module. Picking over it would be the first step towards reading child
    // data out of `localStorage`, so the whole thing goes, exactly like an
    // unparseable blob — including the fields that would have been fine.
    localStorage.setItem(
      KEY,
      JSON.stringify({
        guardCounty: '高雄市',
        childId: 'c-1',
        birthday: '2022-03-14',
      }),
    );

    expect(readPreferences()).toEqual(DEFAULTS);
  });

  it('discards a blob that tries to reach the object prototype', () => {
    // `JSON.parse` puts `__proto__` on the result as an own enumerable
    // property, so the closed key set catches it for free — but only as long
    // as the check stays a whitelist. A blacklist would not have.
    localStorage.setItem(
      KEY,
      '{"__proto__":{"polluted":true},"guardCounty":"\u9ad8\u96c4\u5e02"}',
    );

    expect(readPreferences()).toEqual(DEFAULTS);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('recovers from a bad blob as soon as something is saved', () => {
    localStorage.setItem(KEY, 'not json at all');
    savePreferences({ guardCounty: '高雄市' });
    expect(readPreferences().guardCounty).toBe('高雄市');
  });
});

describe('the child-data boundary', () => {
  /**
   * The rule this asserts is the one the app cannot afford to blur: child
   * records live behind auth, and `localStorage` is neither authenticated nor
   * cleared on sign-out. Issue #17 asked for this assertion by name.
   */
  it('writes exactly the view fields, under exactly one versioned key', () => {
    savePreferences({ guardCounty: '高雄市' });

    expect(Object.keys(localStorage)).toEqual([KEY]);

    expect(
      Object.keys(JSON.parse(localStorage.getItem(KEY) ?? '{}')).sort(),
    ).toEqual(Object.keys(DEFAULTS).sort());
  });

  it('drops anything a caller adds beyond the view fields', () => {
    // A caller that widened its own object cannot smuggle a field through:
    // read and write both copy the owned fields by name.
    const widened = {
      guardCounty: '高雄市',
      childId: '9c1f7a44-0000-4000-8000-000000000000',
      childName: '小明',
      birthday: '2022-03-14',
    } as Partial<ViewPreferences>;

    savePreferences(widened);

    const raw = localStorage.getItem(KEY) ?? '';

    expect(raw).toContain('高雄市');

    for (const smuggled of [
      'childId',
      'childName',
      'birthday',
      '小明',
      '2022-03-14',
    ]) {
      expect(raw).not.toContain(smuggled);
    }
  });

  it('persists no key that could name something about a child', () => {
    // The one that bites the future change: adding a child-shaped field to the
    // stored shape turns this red, where a "storage is empty of child data"
    // assertion would quietly keep passing.
    savePreferences({ guardCounty: '高雄市', oasisExcludeInternal: true });

    const persisted = Object.keys(
      JSON.parse(localStorage.getItem(KEY) ?? '{}'),
    );

    expect(persisted.length).toBeGreaterThan(0);

    for (const key of persisted) {
      expect(key).not.toMatch(
        /child|name|birth|due|gender|member|uid|progress|record|diary/i,
      );
    }
  });
});

describe('a device with no usable storage', () => {
  /**
   * Safari in private mode and any browser with site data blocked throw on
   * `window.localStorage` itself, before a read or a write. A public page must
   * not fail because of it — it just stops remembering.
   */
  const withBlockedStorage = (run: () => void) => {
    const real = Object.getOwnPropertyDescriptor(window, 'localStorage');

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      },
    });

    try {
      run();
    } finally {
      if (real) {
        Object.defineProperty(window, 'localStorage', real);
      } else {
        Reflect.deleteProperty(window, 'localStorage');
      }
    }
  };

  it('reads the defaults and saves without throwing', () => {
    withBlockedStorage(() => {
      expect(readPreferences()).toEqual(DEFAULTS);
      expect(() => savePreferences({ guardCounty: '高雄市' })).not.toThrow();
    });
  });
});
