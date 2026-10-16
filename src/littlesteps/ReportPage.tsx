import { User } from 'firebase/auth';
import { useMemo } from 'react';
import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';
import {
  ReportView,
  ReportView1,
  ReportView2,
  ReportView3,
} from '~app/littlesteps/components/ReportView';
import { useReport } from '~app/littlesteps/hooks/useReport';

interface ReportPageProps {
  currentChild?: ChildProfile;
  dailyLogs: DailyLog[];
  user: User | null;
}

/**
 * Helper: generate date labels for the last N days (oldest first)
 */
function generateDateLabels(days: number): string[] {
  const labels: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    labels.push(`${month}/${day}`);
  }

  return labels;
}

export default function ReportPage({
  currentChild, dailyLogs, user,
}: ReportPageProps) {
  const { report, period, setPeriod, loading } = useReport(
    currentChild,
    dailyLogs,
    user,
  );

  const days = period === '7days' ? 7 : 30;
  const dateLabels = useMemo(() => generateDateLabels(days), [days]);

  // No child selected
  if (!currentChild) {
    return <ReportView />;
  }

  // Loading state
  if (loading) {
    return <ReportView1 />;
  }

  // Check if we have any data at all. 只擠奶、還沒開始瓶餵的那一週也是有記錄的
  // 一週：把它當成空白，等於告訴一位每天擠六次的母親「你什麼都沒記」。
  const hasData
    = report
      && (report.feeding.avgDailyCount > 0
        || report.sleep.avgDailyHours > 0
        || report.poop.avgDailyCount > 0
        || report.pumping !== undefined);

  // Empty state
  if (!hasData) {
    return <ReportView2 />;
  }

  return (
    <ReportView3
      setPeriod={setPeriod}
      period={period}
      report={report}
      days={days}
      dateLabels={dateLabels}
    />
  );
}
