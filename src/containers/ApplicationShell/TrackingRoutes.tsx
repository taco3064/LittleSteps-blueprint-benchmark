import { lazy } from 'react';
import type { ApplicationState } from '~app/hooks/useApplicationState';
import PregnancyGate from '../PregnancyGate';
const MilestonesPage = lazy(() => import('../MilestonesPage'));
const VaccineTrackingPage = lazy(() => import('../VaccineTrackingPage'));
const ComplementaryFoodPage = lazy(() => import('../ComplementaryFoodPage'));
const GrowthChartsPage = lazy(() => import('../GrowthChartsPage'));
const DailyLogPage = lazy(() => import('../DailyLogPage'));

export function TrackingRoutes({ state }: { state: ApplicationState }) {
  const {
    user,
    currentChild,
    currentChildMilestoneProgress,
    currentChildVaccineProgress,
    toggleMilestone,
    setVaccineDose,
    currentPage,
  } = state;

  return (
    <>
      {currentPage === 'littlesteps/milestones' && (
        <PregnancyGate currentChild={currentChild}>
          <MilestonesPage
            // 篩選器要從孩子現在的月齡起跑，所以這兩頁需要孩子本身，
            // 不只是進度資料。
            currentChild={currentChild}
            progress={currentChildMilestoneProgress}
            onToggleMilestone={toggleMilestone}
          />
        </PregnancyGate>
      )}
      {currentPage === 'littlesteps/vaccine-tracking' && (
        <PregnancyGate currentChild={currentChild}>
          <VaccineTrackingPage
            currentChild={currentChild}
            vaccineProgress={currentChildVaccineProgress}
            onSetVaccineDose={setVaccineDose}
          />
        </PregnancyGate>
      )}
      {currentPage === 'littlesteps/complementary-food' && (
        <PregnancyGate currentChild={currentChild}>
          <ComplementaryFoodPage currentChild={currentChild} user={user} />
        </PregnancyGate>
      )}
      {currentPage === 'littlesteps/daily-log' && (
        <PregnancyGate currentChild={currentChild}>
          <DailyLogPage currentChild={currentChild} user={user} />
        </PregnancyGate>
      )}
      {currentPage === 'littlesteps/growth-charts' && (
        <PregnancyGate currentChild={currentChild}>
          <GrowthChartsPage currentChild={currentChild} user={user} />
        </PregnancyGate>
      )}
    </>
  );
}
