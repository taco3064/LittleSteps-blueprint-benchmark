import { app } from './app';

/**
 * Analytics 動態載入，而不是靜態 import。
 *
 * firebase/analytics 只為了記事件，對畫面沒有任何貢獻，靜態 import 卻會把它
 * 綁進進入點的 chunk——等於每個家長都得先下載一份追蹤程式碼、等它向 Google
 * 發出第一個請求，才看得到 app。第一次真的要記事件時再載就夠了。
 *
 * isSupported() 是必要的：在無痕模式與部分 in-app 瀏覽器裡 getAnalytics()
 * 會直接丟例外，而記不到事件不該讓呼叫點壞掉。
 */
type SendEvent = (eventName: string, eventParams?: Record<string, unknown>) => void;

let analyticsReady: Promise<SendEvent | null> | null = null;

const loadAnalytics = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  analyticsReady ??= import('firebase/analytics')
    .then(async ({ getAnalytics, isSupported, logEvent: send }) => {
      if (!(await isSupported())) {
        return null;
      }

      const instance = getAnalytics(app);

      return (eventName: string, eventParams?: Record<string, unknown>) =>
        send(instance, eventName, eventParams);
    })
    .catch(() => null);

  return analyticsReady;
};

// 記事件一律是「送出去就算了」：失敗不影響任何畫面，也不該讓呼叫點等它。
export const logEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>,
) => {
  void loadAnalytics().then((send) => send?.(eventName, eventParams));
};

// Pre-defined event helpers
export const logPageView = (pageName: string) => {
  // Determine app category and page details

  const metadata = getPageMetadata(pageName);

  logEvent('page_view', {
    page_name: pageName,
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
    // Custom dimensions for better segmentation
    app_name: metadata.app, // main | littlesteps | littlebloom | littleexplorer
    app_section: metadata.section, // landing | data-tracking | development | etc.
    app_feature: metadata.feature, // specific feature name
  });
};

/**
 * 里程碑與疫苗的事件只記「動作」，不記是哪一項。
 *
 * 這兩個事件原本帶著 milestone_id、vaccine_id 與 dose_number。那些是目錄上的
 * 編號，不是孩子的名字或生日，但綁在同一個 Analytics client id 上，就是一台
 * 裝置上「哪些里程碑達到了、哪些疫苗打過了」的逐筆軌跡——離「關於資料」頁
 * 那句「不會出現任何一筆紀錄的內容」太近了。哪一劑被勾得多，看目錄的總量就
 * 答得出來，不需要每台裝置各留一份。
 *
 * 每個事件允許帶哪些欄位，由 src/lib/analytics.test.ts 釘死：多一個欄位就紅，
 * 所以這條界線不靠這段註解。
 */
export const logMilestoneToggle = (achieved: boolean) => {
  logEvent('milestone_toggle', { achieved });
};

export const logVaccineToggle = (administered: boolean) => {
  logEvent('vaccine_toggle', { administered });
};

export const logChildProfileAction = (
  action: 'create' | 'update' | 'delete' | 'switch',
) => {
  logEvent('child_profile_action', { action });
};

export const logAuthEvent = (action: 'login' | 'logout' | 'login_failed') => {
  logEvent('auth_action', { action });
};

function getPageMetadata(page: string) {
  if (page === 'home') {
    return { app: 'main', section: 'landing', feature: 'main-entry' };
  }

  if (page.startsWith('littlebloom')) {
    return { app: 'littlebloom', section: 'wip', feature: 'pregnancy-companion' };
  }

  if (page.startsWith('littleexplorer')) {
    return {
      app: 'littleexplorer',
      section: 'toddler',
      feature: page.split('/')[1] || 'development',
    };
  }

  if (page.startsWith('littlesteps')) {
    const feature = page.split('/')[1] || 'home';

    return { app: 'littlesteps', section: stepSection(feature), feature };
  }

  return { app: 'main', section: 'home', feature: page };
}

function stepSection(feature: string) {
  if (
    ['dashboard', 'daily-log', 'growth-charts', 'sleep-analysis'].includes(feature)
  ) {
    return 'data-tracking';
  }

  if (['milestones', 'vaccine-tracking'].includes(feature)) {
    return 'development';
  }

  if (['complementary-food', 'sleep-training'].includes(feature)) {
    return 'nutrition-sleep';
  }

  if (feature === 'care-guide') {
    return 'education';
  }

  return 'landing';
}
