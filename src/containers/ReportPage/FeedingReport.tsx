import { motion } from 'framer-motion';

import ReportChart from '~app/components/ReportChart';

import { listItem } from '~app/domain/motion';
import { formatDateShort, LoggedDaysNote } from './display';

import type { WeeklyReport } from '~app/domain/reportGenerator';

export default function FeedingReport({
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
      <h2 className="mb-4">餵奶報告</h2>
      <ReportChart
        data={report.feeding.dailyAmounts}
        labels={dateLabels}
        type="line"
        unit="ml"
      />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-primary-soft rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-primary-dark">
            {report.feeding.avgDailyCount}
          </div>
          <div className="text-sm text-ink-muted">平均每日次數</div>
          <LoggedDaysNote
            loggedDays={report.feeding.loggedDays}
            periodDays={days}
          />
        </div>
        <div className="bg-primary-soft rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-primary-dark">
            {report.feeding.avgDailyAmount}
            <span className="text-sm font-normal ml-0.5">ml</span>
          </div>
          <div className="text-sm text-ink-muted">平均每日總量</div>
          <LoggedDaysNote
            loggedDays={report.feeding.loggedDays}
            periodDays={days}
          />
        </div>
        {report.feeding.maxDay && (
          <div className="bg-warm-white rounded-xl p-3 text-center">
            <div className="text-sm font-bold text-ink">
              {report.feeding.maxDay.amount}
              <span className="text-xs font-normal ml-0.5">ml</span>
            </div>
            <div className="text-sm text-ink-muted">
              最高日 (
              {formatDateShort(report.feeding.maxDay.date)}
              )
            </div>
          </div>
        )}
        {report.feeding.minDay && (
          <div className="bg-warm-white rounded-xl p-3 text-center">
            <div className="text-sm font-bold text-ink">
              {report.feeding.minDay.amount}
              <span className="text-xs font-normal ml-0.5">ml</span>
            </div>
            <div className="text-sm text-ink-muted">
              最低日 (
              {formatDateShort(report.feeding.minDay.date)}
              )
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
