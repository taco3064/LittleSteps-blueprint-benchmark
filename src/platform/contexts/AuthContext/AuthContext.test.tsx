import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, AuthProvider } from '../../index';
import { useAuth } from '../../hooks/useAuth/index';

/**
 * The Auth half of account deletion.
 *
 * `deleteUser` only accepts a user who signed in recently, so
 * `auth/requires-recent-login` is the ordinary case rather than an edge one —
 * and by the time it fires the parent's data has already been deleted. Failing
 * silently there leaves an account that holds nothing and cannot be removed,
 * which is exactly the state this flow exists to prevent. So the re-auth
 * attempt, and the honest way out of it inside an in-app browser, are pinned
 * down here.
 */

const mocks = vi.hoisted(() => ({
  deleteUser: vi.fn().mockResolvedValue(undefined),
  reauthenticateWithPopup: vi.fn().mockResolvedValue({}),
  signOut: vi.fn().mockResolvedValue(undefined),
  user: { uid: 'u1', email: 'parent@example.com' },
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(mocks.user);

    return vi.fn();
  }),
  getRedirectResult: vi.fn().mockResolvedValue(null),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: mocks.signOut,
  deleteUser: mocks.deleteUser,
  reauthenticateWithPopup: mocks.reauthenticateWithPopup,
  GoogleAuthProvider: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: mocks.user })),
}));

// The global mock in src/test/setup.ts starts every test signed out, and
// `deleteAccount` reads `auth.currentUser`. This one is signed in.
vi.mock('../../services/firebase/index', () => ({
  auth: { currentUser: mocks.user },
  googleProvider: {},
  logEvent: vi.fn(),
}));

/** The Firebase SDK throws `FirebaseError`: an `Error` carrying a `code`. */
const authError = (code: string) => Object.assign(new Error(code), { code });

function DeleteAccountButton() {
  const { deleteAccount } = useAuth();

  return (
    <button type="button" onClick={() => deleteAccount()}>
      delete
    </button>
  );
}

const setUserAgent = (value: string) =>
  Object.defineProperty(navigator, 'userAgent', { value, configurable: true });

const ORIGINAL_USER_AGENT = navigator.userAgent;

const clickDelete = async () => {
  const user = userEvent.setup();

  render(
    <ToastProvider>
      <AuthProvider onLeave={() => window.history.pushState({}, '', '/')}>
        <DeleteAccountButton />
      </AuthProvider>
    </ToastProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'delete' }));
};

beforeEach(() => {
  vi.clearAllMocks();
  setUserAgent(ORIGINAL_USER_AGENT);
  window.history.replaceState(null, '', '/littlesteps/dashboard');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('deleteAccount', () => {
  it('signs out and returns to the entry point once the user is gone', async () => {
    await clickDelete();

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalled());
    expect(mocks.deleteUser).toHaveBeenCalledTimes(1);
    // Staying on a private route would swap the screen for a service intro
    // page, which reads as "deleting my account dropped me into LittleSteps".
    expect(window.location.pathname).toBe('/');
  });

  it('re-authenticates and deletes again when the sign-in is too old', async () => {
    mocks.deleteUser.mockRejectedValueOnce(authError('auth/requires-recent-login'));

    await clickDelete();

    await waitFor(() => expect(mocks.reauthenticateWithPopup).toHaveBeenCalled());
    expect(mocks.deleteUser).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalled());
    expect(window.location.pathname).toBe('/');
  });

  it('requests fresh WebView sign-in when redirect cannot resume', async () => {
    // LINE, Facebook and Instagram open links in a WebView with no popup, and
    // a redirect replaces the page: this flow would not exist when it came
    // back. Signing out and asking for a fresh sign-in is the way to get the
    // recent login the deletion needs.
    setUserAgent('Mozilla/5.0 (iPhone) Line/13.5.0');
    mocks.deleteUser.mockRejectedValueOnce(authError('auth/requires-recent-login'));

    await clickDelete();

    expect(await screen.findByText(/重新登入/)).toBeInTheDocument();
    expect(mocks.reauthenticateWithPopup).not.toHaveBeenCalled();
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalled());
  });

  it('keeps the parent signed in when re-authentication is refused', async () => {
    // Cancelling the popup must not sign them out: they need the same button
    // again, and the account still exists.
    mocks.deleteUser.mockRejectedValueOnce(authError('auth/requires-recent-login'));

    mocks.reauthenticateWithPopup.mockRejectedValueOnce(
      authError('auth/popup-closed-by-user'),
    );

    await clickDelete();

    expect(await screen.findByText(/帳號還沒刪掉/)).toBeInTheDocument();
    expect(mocks.deleteUser).toHaveBeenCalledTimes(1);
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it('says so when the deletion fails for any other reason', async () => {
    mocks.deleteUser.mockRejectedValueOnce(authError('auth/network-request-failed'));

    await clickDelete();

    expect(await screen.findByText(/帳號還沒刪掉/)).toBeInTheDocument();
    expect(mocks.reauthenticateWithPopup).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
