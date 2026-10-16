import { useEffect, useState } from 'react';
import { countCareReminders } from '~app/littleexplorer/domain/careSchedule';
import { useChildStoreContext } from '~app/family/hooks/useChildStoreContext';
import { useCareTasks } from '~app/littleexplorer/hooks/useCareTasks';
import { useDiary } from '~app/littleexplorer/hooks/useDiary';
import { useDailyLogs } from '~app/littlesteps/hooks/useDailyLogs';
import { useAuth } from '~app/platform/hooks/useAuth';
import { pageTitle } from '~app/portal/domain/pageTitle';
import { isStandaloneSubApp } from '~app/portal/domain/routePolicy';
import { pageFromPath, type Page } from '~app/portal/domain/routes';
import { useDocumentMeta } from '~app/portal/hooks/useDocumentMeta';
import { goTo, subscribeToNavigation } from '~app/portal/services/navigate';
import { logPageView } from '~app/portal/services/telemetry';

export function useAppModel() {
  const { user, loading, signInWithGoogle } = useAuth();

  const {
    childProfiles,
    currentChild,
    currentChildMilestoneProgress,
    currentChildVaccineProgress,
    childrenLoading,
    toggleMilestone,
    setVaccineDose,
    addChild,
    joinChild,
    currentChildDevelopmentProgress,
    currentChildToothProgress,
    toggleDevelopmentCheck,
    toggleTooth,
    pregnancyChild,
    pregnancyPrenatalProgress,
    upsertPrenatalRecord,
    clearPrenatalRecord,
    recordBirth,
    upsertCareTaskRecord,
    clearCareTaskRecord,
    addDiaryEntry,
    updateDiaryEntry,
    deleteDiaryEntry,
  } = useChildStoreContext();

  const [currentPage, setCurrentPage] = useState<Page>(() =>
    pageFromPath(window.location.pathname),
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get daily logs for current child
  // currentChild 不一定是 currentChildId 指的那一個：共享的孩子被建立者刪掉
  // 之後 currentChildId 會被清成 null，而畫面已經退到名單裡的第一個孩子。
  // 這裡若用 id，日誌與日記就會去讀一個 null，家長看到的是「這孩子沒有紀錄」。
  const { logs: dailyLogs } = useDailyLogs(currentChild?.id ?? null, user);
  const { tasks: careTasks } = useCareTasks(currentChild);
  const { entries: diaryEntries } = useDiary(currentChild?.id ?? null, user);

  // 建檔之前就到期的項目不算逾期——app 只是沒有那段紀錄，不是家長漏掉了。
  // 把它們算進紅點，會讓新增一個既有的兩歲孩子立刻背上十幾筆「未完成」。
  const reminderBadge = countCareReminders(careTasks, currentChild?.createdAt);

  // 「什麼都還沒有」的畫面與登入後的去向都由 common/landing/LandingPage 決定，
  // 包含未登入被擋下時該顯示哪一張服務介紹頁。這裡不再各自判斷。

  // 瀏覽器上一頁／下一頁與 app 內部換頁都不會重新掛載，所以要自己跟著換頁。
  useEffect(
    () =>
      subscribeToNavigation(() => {
        setCurrentPage(pageFromPath(window.location.pathname));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }),
    [],
  );

  useDocumentMeta(currentPage);

  const navigateToPage = (page: Page) => {
    goTo(page);
    setCurrentPage(page);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Log page view
    logPageView(page);
  };

  // Whether this page renders its own chrome — the about page and the five
  // standalone sub-apps. The predicate and the landmark contract that comes
  // with it live in `routePolicy.ts`, where a test can derive the list from it
  // without importing this file's React tree.
  const { isStandalone, showHeader, ContentLandmark }
    = routeChrome(currentPage);

  // RTDB 沒有磁碟快取。已安裝的 PWA 在離線時仍然開得起來（shell 有 precache），
  // 但 onValue 永遠不會回呼，於是載入條會一直轉下去，沒有任何說明。
  const dataPending = loading || (user !== null && childrenLoading);
  const loadStalled = useLoadStalled(dataPending);

  return {
    user,
    loading,
    signInWithGoogle,
    childProfiles,
    currentChild,
    sidebarOpen,
    setSidebarOpen,
    dataPending,
    loadStalled,
    currentPage,
    isStandalone,
    showHeader,
    ContentLandmark,
    getPageTitle: () => pageTitle(currentPage, currentChild),
    dailyLogs,
    navigateToPage,
    currentChildMilestoneProgress,
    toggleMilestone,
    currentChildVaccineProgress,
    setVaccineDose,
    pregnancyChild,
    pregnancyPrenatalProgress,
    recordBirth,
    addChild,
    upsertPrenatalRecord,
    clearPrenatalRecord,
    currentChildDevelopmentProgress,
    currentChildToothProgress,
    reminderBadge,
    toggleDevelopmentCheck,
    toggleTooth,
    addDiaryEntry,
    joinChild,
    careTasks,
    upsertCareTaskRecord,
    clearCareTaskRecord,
    diaryEntries,
    updateDiaryEntry,
    deleteDiaryEntry,
  };
}

function useLoadStalled(dataPending: boolean) {
  const [loadStalled, setLoadStalled] = useState(false);

  useEffect(() => {
    if (!dataPending) {
      setLoadStalled(false);

      return;
    }

    // 已知離線就不必等：直接說實話。
    if (navigator.onLine === false) {
      setLoadStalled(true);

      return;
    }

    const timer = window.setTimeout(() => setLoadStalled(true), 10000);

    return () => window.clearTimeout(timer);
  }, [dataPending]);

  return loadStalled;
}

function routeChrome(page: Page) {
  const isStandalone = isStandaloneSubApp(page);
  const showHeader = !(page === 'home' || isStandalone);
  const ContentLandmark: 'div' | 'main' = isStandalone ? 'div' : 'main';

  return { isStandalone, showHeader, ContentLandmark };
}
