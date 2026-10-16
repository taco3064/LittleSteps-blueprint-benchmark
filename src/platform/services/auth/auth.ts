import {
  signInWithPopup,
  signInWithRedirect,
  reauthenticateWithPopup,
  deleteUser,
  signOut as firebaseSignOut,
  getRedirectResult,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, logEvent } from '../firebase';
import type { ToastApi } from '~app/platform/domain/toast';
const logAuthEvent = (action: string) => logEvent('auth_action', { action });

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || navigator.vendor;

  // 檢測常見的 WebView User-Agent
  const webViewPatterns = [
    /Line\//i, // LINE
    /FBAN|FBAV/i, // Facebook
    /Instagram/i, // Instagram
    /Twitter/i, // Twitter
    /Messenger/i, // Facebook Messenger
    /MicroMessenger/i, // WeChat
    /WebView/i, // Generic WebView
    /wv\)/i, // Android WebView indicator
  ];

  return webViewPatterns.some((pattern) => pattern.test(ua));
}

export async function handleRedirectResult(toast: ToastApi) {
  try {
    const result = await getRedirectResult(auth);

    if (result?.user) {
      logAuthEvent('login');
      // 遷移會在 onAuthStateChanged 中處理
    }
  } catch (error: unknown) {
    console.error('Redirect 登入失敗:', error);

    if (getErrorCode(error) !== 'auth/popup-closed-by-user') {
      logAuthEvent('login_failed');
      toast.show('登入失敗，請稍後再試');
    }
  }
}

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function createAuthActions(toast: ToastApi, onLeave: () => void) {
  const signInWithGoogle = async () => {
    try {
      // 檢測是否在 WebView 中
      if (isInAppBrowser()) {
        // 在 WebView 中使用 redirect 方式
        // redirect 的結果會在 getRedirectResult 中處理
        await signInWithRedirect(auth, googleProvider);
      } else {
        // 一般瀏覽器使用 popup 方式（更好的用戶體驗）
        await signInWithPopup(auth, googleProvider);
        logAuthEvent('login');
      }
    } catch (error: unknown) {
      console.error('登入失敗:', error);

      // 忽略用戶取消登入的錯誤
      if (getErrorCode(error) !== 'auth/popup-closed-by-user') {
        logAuthEvent('login_failed');
        toast.show('登入失敗，請稍後再試');
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      logAuthEvent('logout');
    } catch (error) {
      console.error('登出失敗:', error);
      toast.show('登出失敗，請稍後再試');
    }
  };

  /**
   * 帳號刪除的 Auth 那一半。
   *
   * deleteUser 只接受「最近登入過」的使用者，隔一段時間就回
   * auth/requires-recent-login。那不是可以吞掉的錯誤：資料端已經刪完了，靜靜
   * 失敗會留下一個登得進來、卻什麼都沒有的帳號。一般瀏覽器用 popup 重新驗證，
   * 成功後立刻再刪一次。WebView（LINE、FB）沒有 popup 只有 redirect，而
   * redirect 會把整個頁面換掉、回來時這個流程已經不存在——所以那裡改成登出並
   * 請家長重新登入後再按一次，那正是取得「最近登入」的方式。
   */
  const deleteAccount = async (): Promise<boolean> => {
    const current = auth.currentUser;

    if (!current) {
      return false;
    }

    // 刪完、或決定改請家長重新登入，兩條路都要回到未登入的入口頁：留在需要
    // 登入的頁面上，畫面會換成某個服務的介紹頁，看起來像被丟進了那個服務。
    const leave = async () => {
      // 登出失敗不改變結果：使用者已經刪掉的話這只是收尾，走重新登入那條路時
      // 它是第一步。兩種情況都不該擋住換頁，否則家長會留在一個需要登入的頁面上。
      await firebaseSignOut(auth).catch((error) => {
        console.error('刪除帳號後登出失敗:', error);
      });

      onLeave();
    };

    try {
      await deleteUser(current);
    } catch (error) {
      if (!(await retryAccountDeletion(error, current, { toast, leave }))) {
        return false;
      }
    }

    await leave();

    return true;
  };

  return { signInWithGoogle, signOut, deleteAccount };
}

function getErrorCode(error: unknown): unknown {
  return typeof error === 'object' && error !== null && 'code' in error
    ? error.code
    : undefined;
}

async function retryAccountDeletion(
  error: unknown,
  current: User,
  options: { toast: ToastApi; leave: () => Promise<void> },
) {
  const { toast, leave } = options;

  // Firebase 的錯誤是 Error 的子類，多帶一個 code 字串。
  const needsRecentLogin
    = error instanceof Error
      && 'code' in error
      && error.code === 'auth/requires-recent-login';

  if (!needsRecentLogin) {
    console.error('刪除帳號失敗:', error);
    toast.show('帳號還沒刪掉，請稍後再試');

    return false;
  }

  if (isInAppBrowser()) {
    toast.show('為了安全，請重新登入一次，再按一次刪除帳號');
    await leave();

    return false;
  }

  return reauthenticateAndDelete(current, toast);
}

async function reauthenticateAndDelete(current: User, toast: ToastApi) {
  try {
    await reauthenticateWithPopup(current, googleProvider);
    await deleteUser(current);
  } catch (reauthError) {
    console.error('重新驗證後刪除帳號失敗:', reauthError);
    toast.show('帳號還沒刪掉，請重新登入後再試一次');

    return false;
  }

  return true;
}
