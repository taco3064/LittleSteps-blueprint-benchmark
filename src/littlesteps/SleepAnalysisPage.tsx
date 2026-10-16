import { User } from 'firebase/auth';
import { useState } from 'react';
import { ChildProfile } from '~app/family/domain/familyRecords';
import {
  SleepAnalysisView,
  SleepAnalysisView1,
  SleepAnalysisView2,
  SleepAnalysisView3,
  getSleepChartModel,
} from '~app/littlesteps/components/SleepAnalysisView';
import { useDailyLogs } from '~app/littlesteps/hooks/useDailyLogs';
import { useSleepAnalysisData } from '~app/littlesteps/hooks/useSleepAnalysisData';

interface SleepAnalysisPageProps {
  currentChild?: ChildProfile | null;
  user: User | null;
}

export default function SleepAnalysisPage({
  currentChild, user,
}: SleepAnalysisPageProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  // Load daily logs
  const { logs, loading } = useDailyLogs(currentChild?.id || null, user);

  const { sleepLogs, stats, regularity, ageInMonths, recommendation, advice }
    = useSleepAnalysisData({ logs, currentChild, period });

  const { hasRecords, comparisonData, nightDayData, bedtimeStars, wakeTimeStars }
    = getSleepChartModel({ recommendation, stats, period, regularity });

  // No child selected
  if (!currentChild) {
    return <SleepAnalysisView />;
  }

  // Loading state
  if (loading) {
    return <SleepAnalysisView1 />;
  }

  // Empty state - no sleep records
  if (sleepLogs.length === 0) {
    return <SleepAnalysisView2 />;
  }

  // Insufficient data warning
  const showInsufficientDataWarning = sleepLogs.length < 3;

  return (
    <SleepAnalysisView3
      showInsufficientDataWarning={showInsufficientDataWarning}
      sleepLogs={sleepLogs}
      setPeriod={setPeriod}
      period={period}
      hasRecords={hasRecords}
      stats={stats}
      ageInMonths={ageInMonths}
      recommendation={recommendation}
      comparisonData={comparisonData}
      nightDayData={nightDayData}
      regularity={regularity}
      bedtimeStars={bedtimeStars}
      wakeTimeStars={wakeTimeStars}
      advice={advice}
    />
  );
}
