import { app } from './app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

declare global {
  interface Window {
    /** App Check SDK 讀的全域旗標；它自己的型別定義沒有宣告，所以在這裡補。 */
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
    /**
     * reCAPTCHA 的腳本掛上來的全域。App Check 的 initializeV3 只看它在不在
     * （見下方那段說明），所以這裡只需要「有沒有」，不需要它的形狀。
     */
    grecaptcha?: unknown;
  }
}

/**
 * App Check：讓每個請求都帶著「這是從這個網站、在允許的網域上發出」的證明。
 *
 * bundle 裡的 Firebase 設定本來就是公開的。Auth 加上 database.rules.json 管
 * 的是「誰」能讀寫，卻管不到「從哪裡」——任何人拿著這份設定，都能在自己的
 * 腳本裡直接對資料庫發請求。reCAPTCHA v3 的 App Check token 補上「從哪裡」
 * 這一半；規則仍然是唯一的授權邊界，App Check 只是擋掉不是這個 app 的來源。
 *
 * 用 site key 當開關：沒有 key 就整段跳過，什麼都不印。在擁有者到主控台註冊
 * key 之前，「沒有 key」是預期狀態而不是錯誤；key 一放進環境變數，App Check
 * 就以監控模式上線，不需要再改任何程式碼。
 *
 * 這個檔案在每一條路由（公開頁也包括）都會跑，所以這裡什麼都不准丟出去。
 * initializeAppCheck() 同步做的事包括往 document.body 掛一個 div、打開
 * IndexedDB，而對同一個 app 呼叫第二次會直接丟例外。任何一種失敗都只記一
 * 行，然後當作沒有 App Check 繼續——少一個 token 只是讓請求變成「未驗證」，
 * 讓整個 app 白屏才是真的壞掉。
 *
 * 為什麼 reCAPTCHA 的腳本由我們自己載，而不是交給 SDK：
 *
 * @firebase/app-check 0.11.2 的 loadReCAPTCHAV3Script() 只掛 script.onload，
 * 沒有 onerror、沒有逾時、沒有重試（dist/esm/index.esm.js:1180-1185）。
 * https://www.google.com/recaptcha/api.js 載不進來時，provider 的 initialized
 * promise 永遠不會 settle，getToken() 就一直等下去——而擋廣告的擴充套件、
 * LINE／Facebook／Instagram 的內建瀏覽器（isInAppBrowser() 就是為這群人存在
 * 的）正是載不到它的那一群。token 交換失敗 SDK 有處理（退避、請求照樣以未驗
 * 證送出），腳本載不進來則沒有。
 *
 * 所以順序反過來：先自己載那支腳本，掛上 onerror 與逾時，確定 self.grecaptcha
 * 真的在了才 initializeAppCheck()。initializeV3() 開頭就先看 self.grecaptcha
 * 在不在，在就完全不碰它自己那支載入函式（同檔 :1079-1092），所以我們載成功
 * 之後那條沒有防護的路徑根本走不到；載不成功就這次不啟用 App Check，請求以
 * 未驗證送出——跟現在沒有 key 的行為一樣，而不是卡住。
 *
 * 延後 initializeAppCheck() 是安全的，兩邊的 SDK 都明講：
 * - @firebase/database 1.1.2 的 AppCheckTokenProvider.getToken() 在 App Check
 *   還沒初始化時排一個 setTimeout(0)，屆時仍然沒有就 resolve(null)，連線照樣
 *   開得起來（dist/index.esm.js:732-746，註解寫的就是「Support delayed
 *   initialization of FirebaseAppCheck」）。
 * - 之後才拿到 token 也接得上：addTokenChangeListener 是 appCheckProvider.get()
 *   的 then（同檔 :750-753），Repo 把它接到 refreshAppCheckToken（:10904），
 *   而那會在已經開著的連線上補送 appcheck（:3467-3469）。
 *
 * 代價是第一個請求可能比 token 早出門一步。強制執行打開之後，那條連線會被
 * 後端關掉、SDK 重連時就帶著 token 了；而實務上 RTDB 的第一個 listener 要等
 * 登入狀態回來（未登入的 hook 一律 early-return），通常比腳本慢。
 */
const RECAPTCHA_SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';

/**
 * 等腳本的上限。超過就當它不會來——這個數字只影響「多久之後放棄啟用
 * App Check」，不影響任何畫面：等待期間資料照讀。
 */
const RECAPTCHA_LOAD_TIMEOUT_MS = 8000;

/** self.grecaptcha 在不在。App Check 的 initializeV3 看的就是這個全域。 */
const hasRecaptcha = (): boolean =>
  typeof self !== 'undefined' && self.grecaptcha != null;

/**
 * 載入 reCAPTCHA v3 的腳本，回報成功或失敗，永遠不會 reject、也不會不 settle。
 *
 * 網址必須與 SDK 的 RECAPTCHA_URL 逐字相同（同檔 :1072），不然瀏覽器會抓兩份，
 * 而 SDK 那一份又是沒有防護的那一支。
 */
function loadRecaptchaScript(): Promise<boolean> {
  if (hasRecaptcha()) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    let settled = false;

    const finish = (loaded: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timer);
      resolve(loaded);
    };

    // 逾時也算失敗：擋下來的方式不一定會觸發 error，有些擴充套件是讓請求一直懸著。
    const timer = window.setTimeout(() => finish(false), RECAPTCHA_LOAD_TIMEOUT_MS);

    script.src = RECAPTCHA_SCRIPT_URL;
    script.async = true;
    script.onload = () => finish(hasRecaptcha());
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  });
}

const appCheckSiteKey: unknown = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;

if (typeof appCheckSiteKey === 'string' && appCheckSiteKey !== '') {
  const siteKey = appCheckSiteKey;

  // 本機開發拿不到真的 reCAPTCHA token（localhost 不在允許的網域裡），要改用
  // 向主控台註冊過的 debug token：這個旗標讓 SDK 產生一個並印到 console。
  // 只在 DEV 底下：Vite 建置時把 import.meta.env.DEV 換成 false，整個分支
  // 會被當成死碼拿掉，所以它到不了正式的 bundle。
  //
  // 旗標要在 initializeAppCheck() 之前設好，而那現在排在腳本之後，所以這裡
  // 就設——它只是一個全域布林，設了不代表 App Check 會啟用。
  if (
    import.meta.env.DEV
      && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG === 'true'
  ) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  void loadRecaptchaScript().then((loaded) => {
    if (!loaded) {
      // 一行就好，而且是 warn 不是 error：這不是壞掉，是這次沒有 App Check。
      console.warn('reCAPTCHA 腳本載不進來，這次不啟用 App Check，請求以未驗證送出');

      return;
    }

    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      console.error('App Check 初始化失敗，這次先不帶 token 繼續：', error);
    }
  });
}

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database
export const database = getDatabase(app, import.meta.env.VITE_FIREBASE_DATABASE_URL);

export {
  logEvent,
  logPageView,
  logMilestoneToggle,
  logVaccineToggle,
  logChildProfileAction,
  logAuthEvent,
} from './analytics';
