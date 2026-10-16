import { lazy } from 'react';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import { PregnancyGate } from '~app/littlesteps';
import type { AppRouteProps } from './App';

const DashboardPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.DashboardPage })),
);

const MilestonesPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.MilestonesPage })),
);

const CareGuidePage = lazy(() =>
  import('~app/littlesteps/components/CareGuidePage'),
);

const VaccineTrackingPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.VaccineTrackingPage })),
);

const ComplementaryFoodPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({
    default: m.ComplementaryFoodPage,
  })),
);

const GrowthChartsPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.GrowthChartsPage })),
);

const SleepTrainingPage = lazy(() =>
  import('~app/littlesteps/components/SleepTrainingPage'),
);

const DailyLogPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.DailyLogPage })),
);

const SleepAnalysisPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.SleepAnalysisPage })),
);

const LittleBloomPage = lazy(() =>
  import('~app/littlebloom').then((m) => ({ default: m.LittleBloomPage })),
);

const LittleBloomWikiPage = lazy(() =>
  import('~app/littlebloom').then((m) => ({ default: m.LittleBloomWikiPage })),
);

const OutingPage = lazy(() =>
  import('~app/littleouting').then((m) => ({ default: m.OutingPage })),
);

const PrenatalPage = lazy(() =>
  import('~app/littlebloom').then((m) => ({ default: m.PrenatalPage })),
);

const BabyOasisPage = lazy(() =>
  import('~app/babyoasis').then((m) => ({ default: m.BabyOasisPage })),
);

const RadarPage = lazy(() =>
  import('~app/littleguard').then((m) => ({ default: m.RadarPage })),
);

const BabyWikiPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.BabyWikiPage })),
);

const ClinicSummaryPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.ClinicSummaryPage })),
);

const ReportPage = lazy(() =>
  import('~app/littlesteps').then((m) => ({ default: m.ReportPage })),
);

const DevelopmentPage = lazy(() =>
  import('~app/littleexplorer').then((m) => ({ default: m.DevelopmentPage })),
);

const RemindersPage = lazy(() =>
  import('~app/littleexplorer').then((m) => ({ default: m.RemindersPage })),
);

const DiaryPage = lazy(() =>
  import('~app/littleexplorer').then((m) => ({ default: m.DiaryPage })),
);

const ToddlerWikiPage = lazy(() =>
  import('~app/littleexplorer').then((m) => ({ default: m.ToddlerWikiPage })),
);

const AboutPage = lazy(() =>
  import('~app/portal').then((m) => ({ default: m.AboutPage })),
);

function RouteGroup0({
  currentPage,
  landingKind,
  currentChild,
  dailyLogs,
  user,
  navigateToPage,
  currentChildMilestoneProgress,
  toggleMilestone,
}: AppRouteProps) {
  return (
    <>
      {currentPage === 'littlesteps' && !landingKind && (
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
    </>
  );
}

function RouteGroup1({
  currentPage,
  currentChild,
  user,
  currentChildVaccineProgress,
  setVaccineDose,
}: AppRouteProps) {
  return (
    <>
      {currentPage === 'littlesteps/care-guide' && <CareGuidePage />}
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
    </>
  );
}

function RouteGroup2({ currentPage, currentChild, user }: AppRouteProps) {
  return (
    <>
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
      {currentPage === 'littlesteps/sleep-training' && <SleepTrainingPage />}
    </>
  );
}

function RouteGroup3({
  currentPage,
  currentChild,
  dailyLogs,
  user,
}: AppRouteProps) {
  return (
    <>
      {currentPage === 'littlesteps/sleep-analysis' && (
        <SleepAnalysisPage currentChild={currentChild} user={user} />
      )}
      {currentPage === 'littlesteps/baby-wiki' && <BabyWikiPage />}
      {currentPage === 'littlesteps/clinic-summary' && (
        <ClinicSummaryPage
          currentChild={currentChild}
          dailyLogs={dailyLogs}
          user={user}
        />
      )}
    </>
  );
}

function RouteGroup4({
  currentPage,
  currentChild,
  dailyLogs,
  user,
}: AppRouteProps) {
  return (
    <>
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

function RouteGroup5({
  currentPage,
  pregnancyChild,
  pregnancyPrenatalProgress,
  recordBirth,
  addChild,
  upsertPrenatalRecord,
  clearPrenatalRecord,
}: AppRouteProps) {
  return (
    <>
      {/* LittleBloom Route */}
      {currentPage === 'littlebloom' && (
        <LittleBloomPage
          currentChild={pregnancyChild}
          progress={pregnancyPrenatalProgress}
          onRecordBirth={recordBirth}
          // 孕期檔案就是「還沒出生的孩子」，所以走同一個 addChild；帶了
          // 預產期，資料層就會標成孕期檔案。共用資料層，不共用畫面。
          onAddPregnancy={(name, dueDate) =>
            addChild({ name, birthday: dueDate, dueDate })}
        />
      )}
      {currentPage === 'littlebloom/prenatal' && (
        <PrenatalPage
          currentChild={pregnancyChild}
          progress={pregnancyPrenatalProgress}
          onComplete={upsertPrenatalRecord}
          onUndo={clearPrenatalRecord}
        />
      )}
      {currentPage === 'littlebloom/wiki' && <LittleBloomWikiPage />}
    </>
  );
}

function RouteGroup6({
  currentPage,
  currentChild,
  addChild,
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
}: AppRouteProps) {
  return (
    <>
      {/* LittleExplorer Routes */}
      {currentPage === 'littleexplorer' && (
        <DevelopmentPage
          currentChild={currentChild}
          progress={currentChildDevelopmentProgress}
          toothProgress={currentChildToothProgress}
          reminderBadge={reminderBadge}
          onToggleCheck={toggleDevelopmentCheck}
          onToggleTooth={toggleTooth}
          onQuickDiary={async (content, linkedCheckItemId) => {
            await addDiaryEntry({
              date: toLocalDateKey(),
              content,
              linkedCheckItemId,
            });
          }}
          onAddChild={addChild}
          onJoinChild={joinChild}
        />
      )}
      {currentPage === 'littleexplorer/reminders' && (
        <RemindersPage
          currentChild={currentChild}
          tasks={careTasks}
          reminderBadge={reminderBadge}
          onCompleteTask={upsertCareTaskRecord}
          onUndoTask={clearCareTaskRecord}
          onAddChild={addChild}
          onJoinChild={joinChild}
        />
      )}
      {currentPage === 'littleexplorer/diary' && (
        <DiaryPage
          currentChild={currentChild}
          entries={diaryEntries}
          reminderBadge={reminderBadge}
          onAdd={addDiaryEntry}
          onUpdate={updateDiaryEntry}
          onDelete={deleteDiaryEntry}
          onAddChild={addChild}
          onJoinChild={joinChild}
        />
      )}
      {currentPage === 'littleexplorer/wiki' && (
        <ToddlerWikiPage
          currentChild={currentChild}
          reminderBadge={reminderBadge}
        />
      )}
    </>
  );
}

function RouteGroup7({ currentPage }: AppRouteProps) {
  return (
    <>
      {/* Standalone sub-app routes */}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'littleouting' && <OutingPage />}
      {currentPage === 'babyoasis' && <BabyOasisPage />}
      {currentPage === 'littleguard' && <RadarPage />}
    </>
  );
}

export default function AppRoutes(props: AppRouteProps) {
  return (
    <>
      <RouteGroup0 {...props} />
      <RouteGroup1 {...props} />
      <RouteGroup2 {...props} />
      <RouteGroup3 {...props} />
      <RouteGroup4 {...props} />
      <RouteGroup5 {...props} />
      <RouteGroup6 {...props} />
      <RouteGroup7 {...props} />
    </>
  );
}
