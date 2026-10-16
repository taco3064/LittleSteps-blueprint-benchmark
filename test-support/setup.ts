import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
// Registers jest-dom matchers AND augments Vitest's Assertion types.
import '@testing-library/jest-dom/vitest';

// Cleanup after each test. `localStorage` is part of that: view preferences
// (src/common/preferences.ts) persist across a page load by design, so without
// this a chip tapped in one test decides what the next test opens on.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock Firebase functions
const mockRef = vi.fn((_db, path?: string) => ({ path }));
const mockChild = vi.fn((parent, path: string) => ({ path: `${parent?.path ?? ''}/${path}` }));
const mockSet = vi.fn().mockResolvedValue(undefined);
const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockOnValue = vi.fn((_ref, callback) => {
  // Call callback with empty data
  callback({ val: () => null });
  // Return unsubscribe function
  return vi.fn();
});
const mockRemove = vi.fn().mockResolvedValue(undefined);
const mockGet = vi.fn().mockResolvedValue({ exists: () => false, val: () => null });
// SDK 送出去的是這個 sentinel，伺服器收到才換成時間；mock 照原樣給出來，
// 測試才驗得到「戳記交給伺服器、不是客戶端自己填」。
const mockServerTimestamp = vi.fn(() => ({ '.sv': 'timestamp' }));
// push() 的重點是「每次都不一樣」：Date.now() 當 key 會讓同一毫秒內的兩筆
// 紀錄互相覆蓋，而共用同一個孩子的兩位家長就是兩個寫入者。
let pushCount = 0;
const mockPush = vi.fn((parent) => {
  pushCount += 1;
  const key = `mock_push_${pushCount}`;
  return { key, path: `${parent?.path ?? ''}/${key}` };
});

/**
 * 這份 mock 必須蓋滿 lib/firebase 的真實匯出面。少一個匯出，
 * 載入它的元件會在測試裡爆掉，而不是安靜地少做一件事。
 */
vi.mock("~app/platform/services/firebase", () => ({
  database: { _checkNotDeleted: vi.fn() },
  auth: { currentUser: null },
  googleProvider: {},
  logEvent: vi.fn(),
  logPageView: vi.fn(),
  logMilestoneToggle: vi.fn(),
  logVaccineToggle: vi.fn(),
  logChildProfileAction: vi.fn(),
  logAuthEvent: vi.fn(),
}));


vi.mock("~app/portal/services/telemetry", () => ({
  logPageView: vi.fn(), logMilestoneToggle: vi.fn(), logVaccineToggle: vi.fn(),
  logChildProfileAction: vi.fn(), logAuthEvent: vi.fn(),
}));

// 測試一律以「未登入」起跑：onAuthStateChanged 立刻回報 null，
// 元件才不會卡在 loading 分支。
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  getRedirectResult: vi.fn().mockResolvedValue(null),
  signInWithPopup: vi.fn().mockResolvedValue({ user: null }),
  signInWithRedirect: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  GoogleAuthProvider: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: null })),
}));

// App Check：lib/firebase 在 vitest 底下也會被載入（見 lib/firebase.test.ts），
// 而真的 initializeAppCheck() 會往 document.body 塞 div、去 Google 載
// reCAPTCHA 腳本。這裡只留測試需要驗的兩個介面。
vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(() => ({})),
  ReCaptchaV3Provider: class {
    constructor(public siteKey: string) {}
  },
}));

// Mock Firebase database functions
vi.mock('firebase/database', () => ({
  ref: mockRef,
  child: mockChild,
  set: mockSet,
  update: mockUpdate,
  push: mockPush,
  get: mockGet,
  onValue: mockOnValue,
  remove: mockRemove,
  serverTimestamp: mockServerTimestamp,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
