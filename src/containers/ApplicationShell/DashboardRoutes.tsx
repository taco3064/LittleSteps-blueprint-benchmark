import { lazy } from 'react';
import type { ApplicationState } from '~app/hooks/useApplicationState';
import { landingKindFor } from '../LandingPage';
const DashboardPage = lazy(() => import('../DashboardPage'));
const ClinicSummaryPage = lazy(() => import('../ClinicSummaryPage'));
const ReportPage = lazy(() => import('../ReportPage'));

export function DashboardRoutes({ state }: { state: ApplicationState }) {
  const {
    user,
    childProfiles,
    currentChild,
    currentPage,
    navigateToPage,
    dailyLogs,
  } = state;

  return (
    <>
      {currentPage === 'littlesteps'
        && !landingKindFor(currentPage, user, childProfiles.length > 0) && (
        <DashboardPage
          currentChild={currentChild}
          dailyLogs={dailyLogs}
          user={user}
          onNavigate={navigateToPage}
        />
      )}
      {currentPage === 'littlesteps/dashboard' && (
        <DashboardPage
          currentChild={currentChild}
          dailyLogs={dailyLogs}
          user={user}
          onNavigate={navigateToPage}
        />
      )}
      {currentPage === 'littlesteps/clinic-summary' && (
        <ClinicSummaryPage
          currentChild={currentChild}
          dailyLogs={dailyLogs}
          user={user}
        />
      )}
      {currentPage === 'littlesteps/report' && (
        <ReportPage
          currentChild={currentChild}
          dailyLogs={dailyLogs}
          user={user}
        />
      )}
    </>
  );
}
