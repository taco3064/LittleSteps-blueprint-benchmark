import { logEvent } from '~app/platform/services/firebase';

// Pre-defined event helpers
export const logPageView = (pageName: string) => {
  // Determine app category and page details
  const getPageMetadata = (page: string) => {
    if (page === 'home') {
      return { app: 'main', section: 'landing', feature: 'main-entry' };
    }

    if (page.startsWith('littlebloom')) {
      return {
        app: 'littlebloom',
        section: 'wip',
        feature: 'pregnancy-companion',
      };
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

      return { app: 'littlesteps', section: trackingSection(feature), feature };
    }

    return { app: 'main', section: 'home', feature: page };
  };

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

function trackingSection(feature: string) {
  // Categorize by section
  if (
    feature === 'dashboard'
    || feature === 'daily-log'
    || feature === 'growth-charts'
    || feature === 'sleep-analysis'
  ) {
    return 'data-tracking';
  } else if (feature === 'milestones' || feature === 'vaccine-tracking') {
    return 'development';
  } else if (feature === 'complementary-food' || feature === 'sleep-training') {
    return 'nutrition-sleep';
  } else if (feature === 'care-guide') {
    return 'education';
  } else {
    return 'landing';
  }
}
