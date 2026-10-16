import { isStandaloneLanding, landingKindFor } from '~app/portal/domain/landingPolicy';
import { Home, Menu } from 'lucide-react';
import { Suspense } from 'react';
import { AccountButton } from '~app/account';
import { ChildStoreProvider } from '~app/family';
import { FeedbackButton } from '~app/feedback';
import Sidebar from '~app/littlesteps/components/Sidebar';
import { AuthProvider, ToastProvider } from '~app/platform';
import AppBar from '~app/platform/components/AppBar';
import EmptyState from '~app/platform/components/EmptyState';
import ErrorBoundary from '~app/platform/components/ErrorBoundary';
import {
  AppHomeButton,
  LandingPage,
} from '~app/portal';
import { type LittleStepsPage } from '~app/portal/domain/routes';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import {
  entryPageForChild,
  serviceForStage,
  stageOfChild,
} from '~app/portal/domain/stageEntry';
import { goTo } from '~app/portal/services/navigate';
import AppRoutes from './AppRoutes';
import { reportRenderError } from './reportRenderError';
import { useAppModel } from './useAppModel';

export type AppRouteProps = ReturnType<typeof useAppModel> & {
  landingKind: ReturnType<typeof landingKindFor>;
};

function AppContent() {
  const model = useAppModel();

  const {
    user,
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
    navigateToPage,
  } = model;

  // Show loading state while auth or children data is loading.
  // A pulsing 64px baby icon was the old treatment; a thin progress bar says
  // the same thing without an illustration and without a layout jump.
  if (dataPending) {
    return <AppLoading loadStalled={loadStalled} />;
  }

  // 未登入不再是整站一道牆。只有會讀孩子資料的頁面需要登入，其餘（服務集合
  // 首頁、各服務的介紹頁、百科與哺乳室地圖）一律可看——擋住靜態內容只會讓還
  // 沒有帳號的家長連認識這些服務的機會都沒有。
  //
  // 被擋下時渲染該服務自己的介紹頁，而不是改網址跳走：hash 保持原樣，登入後
  // 同一個路由就會渲染出使用者原本想去的頁面。
  const landingKind = landingKindFor(
    currentPage,
    user,
    childProfiles.length > 0,
  );

  const landing = landingKind && (
    <LandingPage
      kind={landingKind}
      page={currentPage}
      user={user}
      hasChildren={childProfiles.length > 0}
      entryPage={entryPageForChild(currentChild)}
      currentService={serviceForStage(stageOfChild(currentChild))}
      onSignIn={signInWithGoogle}
      onNavigate={navigateToPage}
    />
  );

  const routeProps = { ...model, landingKind };

  // 服務介紹頁自帶版面；服務集合首頁與「先新增寶寶」留在既有版面裡。
  if (landingKind && isStandaloneLanding(landingKind)) {
    return landing;
  }

  return (
    <div className="min-h-dscreen bg-warm-white">
      {/* Sidebar - Only show for LittleSteps routes */}
      {!isStandalone && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage as LittleStepsPage}
          onNavigate={navigateToPage}
          user={user}
        />
      )}

      {/* Header */}
      {showHeader && <AppHeader model={model} />}

      {/* Main Content */}
      {/*
        Standalone 子服務底下這一層不能是 <main>。

        HTML 只在 <header> 不位於 main / section / article / aside / nav 之內時
        才把它算成 banner 地標，而那五個服務的 AppBar 是它們自己的頁面畫出來的，
        由這裡 lazy-load 進來——包在 <main> 裡，那顆 header 就不再是地標，用地標
        跳轉的螢幕閱讀器使用者在 BabyOasis、LittleGuard、LittleOuting、
        LittleBloom 與 LittleExplorer 上會找不到頁首，而 LittleSteps 的每一頁都
        找得到。同一個捷徑在半個 app 上有效、另外半個安靜失效，比兩邊都沒有更糟。

        另一半是 <main> 自己：BloomShell、ExplorerShell 與 OutingPage 各有一個
        <main>，包在這一層裡就變成巢狀的兩個 main，而 <main> 依規格不得有 main
        祖先。這兩件事是同一個錯誤的兩面——外框替自帶版面的頁面多包了一層。

        LittleSteps 的外框與入口頁沒有自己的地標，那一層仍然由這裡提供。

        兩個 fallback 分開處理。下面 Suspense 的載入畫面刻意不給地標：那個狀態是
        暫時的，role="status" 已經報過一次，而只活過一次 chunk 載入就被換掉的地標
        對用地標跳轉的人沒有可以落腳的地方；ErrorBoundary 的錯誤畫面相反，它是終
        局，就是那一刻整頁的內容，所以 standalone 路由上由它自己當 <main>。
      */}
      <ContentLandmark className={showHeader ? 'pb-6' : ''}>
        {/* key 綁 currentPage：一頁壞掉之後換頁就會重掛，不會把家長困在
            錯誤畫面裡直到重新整理。 */}
        <ErrorBoundary
          key={currentPage}
          scope={currentPage}
          ownsMain={isStandalone}
          onHome={() => goTo('home')}
          onReport={reportRenderError}
        >
          <Suspense
            fallback={(
              <div className="min-h-[50vh] flex items-center justify-center">
                <div
                  className="w-40 h-1 rounded-full bg-primary-light overflow-hidden"
                  role="status"
                >
                  <div
                    className={
                      'h-full w-1/3 rounded-full bg-primary-dark '
                      + 'animate-[loading_1.2s_ease-in-out_infinite]'
                    }
                  />
                  <span className="sr-only">載入中</span>
                </div>
              </div>
            )}
          >
            {/* 服務集合首頁與「先新增寶寶」都由 LandingPage 決定，這裡只負責放進版面 */}
            {landing}

            <AppRoutes {...routeProps} />
          </Suspense>
        </ErrorBoundary>
      </ContentLandmark>

      {/* Feedback Button */}
      <FeedbackButton user={user} />
    </div>
  );
}

function App() {
  return (
    // 外層這道攔的是頁首、側邊欄、context provider 之類的外框錯誤——那些
    // 在 <main> 之外，裡面那道 boundary 看不到。上面沒有任何一層會給地標，
    // 所以這道的錯誤畫面自己就是整頁的 <main>。
    <ErrorBoundary
      scope="app"
      ownsMain
      onHome={() => goTo('home')}
      onReport={reportRenderError}
    >
      {/* Toast 在最外層：AuthProvider 自己也會回報登入失敗。 */}
      <ToastProvider>
        <AuthProvider onLeave={() => goTo('home')}>
          {/* 孩子資料與帳號一樣是全站脈絡：五個服務的 AppBar 都要拿得到，
            不然登出與切換寶寶就只會存在於能拿到 prop 的那一個服務裡。 */}
          <ChildStoreProvider>
            <AppContent />
          </ChildStoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

function AppLoading({ loadStalled }: { loadStalled: boolean }) {
  if (loadStalled) {
    return (
      <div className="min-h-dscreen bg-warm-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <EmptyState
            theme={SERVICE_THEME.littlesteps}
            title="連不上伺服器"
            description="目前似乎沒有網路連線。寶寶的資料存在雲端，連上網路後就會出現。"
            action={{
              label: '重新載入',
              onClick: () => window.location.reload(),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dscreen flex items-center justify-center bg-warm-white">
      <div
        className="w-40 h-1 rounded-full bg-primary-light overflow-hidden"
        role="status"
      >
        <div
          className={
            'h-full w-1/3 rounded-full bg-primary-dark '
            + 'animate-[loading_1.2s_ease-in-out_infinite]'
          }
        />
        <span className="sr-only">載入中</span>
      </div>
    </div>
  );
}

function AppHeader({ model }: { model: ReturnType<typeof useAppModel> }) {
  const { getPageTitle, navigateToPage, setSidebarOpen } = model;

  return (
    <AppBar
      theme={SERVICE_THEME.littlesteps}
      title={getPageTitle()}
      leading={(
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="開啟選單"
          className="btn-icon -ml-1.5 bg-ink/5 hover:bg-ink/10"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      actions={(
        <>
          <button
            onClick={() => navigateToPage('littlesteps')}
            className="btn-icon bg-ink/5 hover:bg-ink/10"
            title="LittleSteps 首頁"
            aria-label="LittleSteps 首頁"
          >
            <Home className="w-5 h-5" />
          </button>
          <AccountButton service="littlesteps" />
          <AppHomeButton />
        </>
      )}
    />
  );
}
