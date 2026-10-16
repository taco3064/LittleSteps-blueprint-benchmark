import { LoggedDaysNote } from './LoggedDaysNote';
import { consistencyLabel } from './consistencyLabel';
interface ReportView13Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  days: 7 | 30;
}

export function ReportView13({ report, days }: ReportView13Props) {
  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      <div className="bg-butter-soft rounded-xl p-3 text-center">
        <div className="text-lg font-bold text-butter-dark">
          {report.poop.avgDailyCount}
        </div>
        <div className="text-sm text-ink-muted">平均每日次數</div>
        <LoggedDaysNote loggedDays={report.poop.loggedDays} periodDays={days} />
      </div>
      <div className="bg-butter-soft rounded-xl p-3 text-center">
        <div className="text-lg font-bold text-butter-dark">
          {report.poop.longestGap > 0 ? `${report.poop.longestGap}` : '-'}
          <span className="text-xs font-normal ml-0.5">
            {report.poop.longestGap > 0 ? 'h' : ''}
          </span>
        </div>
        <div className="text-sm text-ink-muted">最長間隔</div>
      </div>
      <div className="bg-butter-soft rounded-xl p-3 text-center">
        <div className="text-sm text-ink space-y-0.5">
          {Object.keys(report.poop.consistencyDistribution).length > 0
            ? (
                Object.entries(report.poop.consistencyDistribution).map(
                  ([key, count]) => (
                    <div key={key}>
                      {consistencyLabel(key)}
                      :
                      {count}
                    </div>
                  ),
                )
              )
            : (
                <span className="text-ink-faint">-</span>
              )}
        </div>
        <div className="text-sm text-ink-muted mt-1">型態分布</div>
      </div>
    </div>
  );
}
