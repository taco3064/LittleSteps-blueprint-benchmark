import { Suspense } from 'react';
import FeedbackButton from '../FeedbackButton';
import Sidebar from '~app/components/Sidebar';
import { isStandaloneSubApp } from '~app/domain/routePolicy';
import { type LittleStepsPage } from '~app/domain/routes';
import { useApplicationState } from '~app/hooks/useApplicationState';
import ErrorBoundary from '../ErrorBoundary';
import { isStandaloneLanding, landingKindFor } from '../LandingPage';
import { ApplicationHeader } from './ApplicationHeader';
import { ApplicationLanding } from './ApplicationLanding';
import { ApplicationLoading } from './ApplicationLoading';
import { BloomRoutes } from './BloomRoutes';
import { CareRoutes } from './CareRoutes';
import { DashboardRoutes } from './DashboardRoutes';
import { DiaryRoutes } from './DiaryRoutes';
import { ExplorerRoutes } from './ExplorerRoutes';
import { PublicRoutes } from './PublicRoutes';
import { TrackingRoutes } from './TrackingRoutes';

export default function ApplicationShell() {
  const state = useApplicationState();

  const { user, currentPage, navigateToPage, sidebarOpen, setSidebarOpen }
    = state;

  const isStandalone = isStandaloneSubApp(currentPage);
  const showHeader = !(currentPage === 'home' || isStandalone);
  const ContentLandmark = isStandalone ? 'div' : 'main';

  const landingKind = landingKindFor(
    currentPage,
    user,
    state.childProfiles.length > 0,
  );

  if (state.dataPending) {
    return <ApplicationLoading state={state} />;
  }

  if (landingKind && isStandaloneLanding(landingKind)) {
    return <ApplicationLanding state={state} />;
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

      <ApplicationHeader state={state} />
      {/* Main Content */}
      {/* Standalone services own their banner and main landmarks. */}
      <ContentLandmark className={showHeader ? 'pb-6' : ''}>
        {/* key 綁 currentPage：一頁壞掉之後換頁就會重掛，不會把家長困在
            錯誤畫面裡直到重新整理。 */}
        <ErrorBoundary
          key={currentPage}
          scope={currentPage}
          ownsMain={isStandalone}
        >
          <Suspense
            fallback={(
              <div className="min-h-[50vh] flex items-center justify-center">
                <div
                  className="w-40 h-1 rounded-full bg-primary-light overflow-hidden"
                  role="status"
                >
                  <div className={
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
            <ApplicationLanding state={state} />

            <DashboardRoutes state={state} />
            <TrackingRoutes state={state} />
            <CareRoutes state={state} />
            <BloomRoutes state={state} />
            <ExplorerRoutes state={state} />
            <DiaryRoutes state={state} />
            <PublicRoutes state={state} />
          </Suspense>
        </ErrorBoundary>
      </ContentLandmark>

      {/* Feedback Button */}
      <FeedbackButton user={user} />
    </div>
  );
}
