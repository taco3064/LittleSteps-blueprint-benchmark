import { LoggedDaysNote } from './LoggedDaysNote';
import { TrendIcon } from './TrendIcon';
import { trendLabel } from './trendLabel';
interface ReportView11Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  days: 7 | 30;
}

export function ReportView11({ report, days }: ReportView11Props) {
  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      <div className="bg-secondary-soft rounded-xl p-3 text-center">
        <div className="text-lg font-bold text-secondary-dark">
          {report.sleep.avgDailyHours}
          <span className="text-xs font-normal ml-0.5">h</span>
        </div>
        <div className="text-sm text-ink-muted">平均每日時數</div>
        <LoggedDaysNote loggedDays={report.sleep.loggedDays} periodDays={days} />
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
  );
}
