import { hasReportData, generateDateLabels } from './display';
import PeriodSelector from './PeriodSelector';
import LoadingState from './LoadingState';
import ScoreOverview from './ScoreOverview';
import FeedingReport from './FeedingReport';
import PumpingReport from './PumpingReport';
import SleepReport from './SleepReport';
import PoopReport from './PoopReport';
import GrowthReport from './GrowthReport';
import ReportSummary from './ReportSummary';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User } from '~app/domain/authUser';

import { ChildProfile, DailyLog } from '~app/domain/records';
import { useReport } from '~app/hooks/useReport';

import EmptyState from '~app/components/EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { stagger } from '~app/domain/motion';

interface ReportPageProps {
  currentChild?: ChildProfile;
  dailyLogs: DailyLog[];
  user: User | null;
}

export default function ReportPage({
  currentChild,
  dailyLogs,
  user,
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
    return (
      <div className="screen">
        <div className="screen-body-wide">
          <EmptyState
            theme={SERVICE_THEME.littlesteps}
            title="還沒有寶寶的資料"
            description="請點右上角的帳號按鈕新增或選擇寶寶。"
          />
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Check if we have any data at all. 只擠奶、還沒開始瓶餵的那一週也是有記錄的
  // 一週：把它當成空白，等於告訴一位每天擠六次的母親「你什麼都沒記」。
  const hasData = hasReportData(report);

  // Empty state
  if (!hasData) {
    return (
      <div className="screen">
        <div className="screen-body-wide">
          <EmptyState
            theme={SERVICE_THEME.littlesteps}
            title="還沒有足夠的記錄"
            description={
              '開始記錄寶寶的日常，就能看到分析報告囉！\n前往「快速日誌」頁面記錄餵奶、睡眠與換尿布'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <motion.div
        className="screen-body-wide"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Period Toggle */}
        <PeriodSelector
          report={report}
          period={period}
          setPeriod={setPeriod}
        />

        {report && (
          <>
            {/* Section 1: Score Overview */}
            <ScoreOverview report={report} days={days} />

            {/* Section 2: Feeding Report */}
            <FeedingReport
              report={report}
              days={days}
              dateLabels={dateLabels}
            />

            {/*
              擠奶自己一段，而且只有真的擠過奶才出現：對沒在擠奶的家長多一張
              永遠是 0 的卡，只是噪音。它刻意不放進上面的餵奶報告裡——擠出來的
              量不是寶寶喝進去的量。
            */}
            {report.pumping && (
              <PumpingReport pumping={report.pumping} days={days} />
            )}

            {/* Section 3: Sleep Report */}
            <SleepReport
              report={report}
              days={days}
              dateLabels={dateLabels}
            />

            {/* Section 4: Poop Report */}
            <PoopReport report={report} days={days} dateLabels={dateLabels} />

            {/* Section 5: Growth Record (30-day only) */}
            {period === '30days' && report.growth && (
              <GrowthReport growth={report.growth} />
            )}

            {/* Section 6: Summary */}
            <ReportSummary report={report} />
          </>
        )}
      </motion.div>
    </div>
  );
}
