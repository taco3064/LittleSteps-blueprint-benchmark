import { User } from 'firebase/auth';
import { goTo } from '~app/portal/services/navigate';
import { calculateAgeDisplay } from '~app/family/domain/summaryCalculator';
import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';
import {
  DashboardView,
  DashboardView2,
} from '~app/littlesteps/components/DashboardView';
import { getActiveAlerts } from '~app/littlesteps/domain/alertEngine';
import { useChildSummary } from '~app/littlesteps/hooks/useChildSummary';
import { useFoodTracking } from '~app/littlesteps/hooks/useFoodTracking';
import { useSleepAnalytics } from '~app/littlesteps/hooks/useSleepAnalytics';

interface DashboardPageProps {
  currentChild?: ChildProfile;
  dailyLogs: DailyLog[];
  user: User | null;
  onNavigate: (
    page:
      | 'littlesteps/milestones'
      | 'littlesteps/vaccine-tracking'
      | 'littlesteps/daily-log'
      | 'littlesteps/care-guide'
      | 'littlesteps/complementary-food'
      | 'littlesteps/sleep-analysis'
      | 'littlesteps/clinic-summary',
  ) => void;
}

export default function DashboardPage({
  currentChild, dailyLogs, user, onNavigate,
}: DashboardPageProps) {
  const { milestoneSummary, vaccineSummary, todaySummary } = useChildSummary(
    currentChild,
    dailyLogs,
  );

  const { analytics: sleepAnalytics } = useSleepAnalytics(dailyLogs);
  const { stats: foodStats } = useFoodTracking(currentChild?.id || null, user);

  // Calculate baby's age in months
  const ageMonths = currentChild?.birthday
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(currentChild.birthday).getTime())
          / (1000 * 60 * 60 * 24 * 30.44),
        ),
      )
    : 0;

  // Get active alerts
  const activeAlerts = currentChild ? getActiveAlerts(dailyLogs, ageMonths) : [];

  if (!currentChild) {
    return <DashboardView />;
  }

  const ageDisplay = calculateAgeDisplay(currentChild.birthday);

  return (
    <DashboardView2
      onPregnancy={() => goTo('littlebloom')}
      onToddler={() => goTo('littleexplorer')}
      currentChild={currentChild}
      ageDisplay={ageDisplay}
      activeAlerts={activeAlerts}
      onNavigate={onNavigate}
      ageMonths={ageMonths}
      milestoneSummary={milestoneSummary}
      vaccineSummary={vaccineSummary}
      todaySummary={todaySummary}
      dailyLogs={dailyLogs}
      sleepAnalytics={sleepAnalytics}
      foodStats={foodStats}
    />
  );
}
