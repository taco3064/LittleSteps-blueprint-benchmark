import { lazy } from 'react';
import type { ApplicationState } from '~app/hooks/useApplicationState';
const CareGuidePage = lazy(() => import('../CareGuidePage'));
const SleepTrainingPage = lazy(() => import('../SleepTrainingPage'));
const SleepAnalysisPage = lazy(() => import('../SleepAnalysisPage'));
const BabyWikiPage = lazy(() => import('../BabyWikiPage'));

export function CareRoutes({ state }: { state: ApplicationState }) {
  const { user, currentChild, currentPage } = state;

  return (
    <>
      {currentPage === 'littlesteps/care-guide' && <CareGuidePage />}
      {currentPage === 'littlesteps/sleep-training' && <SleepTrainingPage />}
      {currentPage === 'littlesteps/sleep-analysis' && (
        <SleepAnalysisPage currentChild={currentChild} user={user} />
      )}
      {currentPage === 'littlesteps/baby-wiki' && <BabyWikiPage />}
    </>
  );
}
