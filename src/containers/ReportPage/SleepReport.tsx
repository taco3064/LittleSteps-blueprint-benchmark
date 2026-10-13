import { motion } from 'framer-motion';

import ReportChart from '~app/components/ReportChart';

import { listItem } from '~app/domain/motion';
import { LoggedDaysNote, TrendIcon, trendLabel } from './display';

import type { WeeklyReport } from '~app/domain/reportGenerator';

export default function SleepReport({
  report,
  days,
  dateLabels,
}: {
  report: WeeklyReport;
  days: number;
  dateLabels: string[];
}) {
  return (
    <motion.div variants={listItem} className="panel mb-4">
      <h2 className="mb-4">睡眠報告</h2>
      <ReportChart
        data={report.sleep.dailyDurations}
        labels={dateLabels}
        type="line"
        unit="小時"
        recommendedValue={report.sleep.recommendedHours}
      />
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-secondary-soft rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-secondary-dark">
            {report.sleep.avgDailyHours}
            <span className="text-xs font-normal ml-0.5">h</span>
          </div>
          <div className="text-sm text-ink-muted">平均每日時數</div>
          <LoggedDaysNote
            loggedDays={report.sleep.loggedDays}
            periodDays={days}
          />
        </div>
        <div className="bg-secondary-soft rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-secondary-dark">
            {report.sleep.longestContinuous > 0
              ? `${(report.sleep.longestContinuous / 60).toFixed(1)}`
              : '0'}
            <span className="text-xs font-normal ml-0.5">h</span>
          </div>
          <div className="text-sm text-ink-muted">最長連續睡眠</div>
        </div>
        <div className="bg-secondary-soft rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendIcon direction={report.sleep.nightWakingsTrend} />
            <span className="text-sm font-bold text-secondary-dark">
              {trendLabel(report.sleep.nightWakingsTrend)}
            </span>
          </div>
          <div className="text-sm text-ink-muted">夜醒趨勢</div>
        </div>
      </div>
    </motion.div>
  );
}
