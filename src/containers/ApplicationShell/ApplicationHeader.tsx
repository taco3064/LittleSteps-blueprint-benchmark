import { Home, Menu } from 'lucide-react';
import { pageTitle } from '~app/domain/pageTitle';
import { isStandaloneSubApp } from '~app/domain/routePolicy';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import type { ApplicationState } from '~app/hooks/useApplicationState';
import AccountButton from '../AccountButton';
import AppBar from '../AppBar';
import AppHomeButton from '../AppHomeButton';

export function ApplicationHeader({ state }: { state: ApplicationState }) {
  const { currentChild, currentPage, navigateToPage, setSidebarOpen } = state;

  const showHeader = !(
    currentPage === 'home' || isStandaloneSubApp(currentPage)
  );

  return (
    <>
      {' '}
      {/* Header */}
      {showHeader && (
        <AppBar
          theme={SERVICE_THEME.littlesteps}
          title={pageTitle(currentPage, currentChild?.name)}
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
      )}
    </>
  );
}
