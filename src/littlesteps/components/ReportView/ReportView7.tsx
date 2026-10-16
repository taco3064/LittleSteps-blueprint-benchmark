import { LoggedDaysNote } from './LoggedDaysNote';
import { formatDateShort } from './formatDateShort';
interface ReportView7Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  days: 7 | 30;
}

export function ReportView7({ report, days }: ReportView7Props) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <div className="bg-primary-soft rounded-xl p-3 text-center">
        <div className="text-lg font-bold text-primary-dark">
          {report.feeding.avgDailyCount}
        </div>
        <div className="text-sm text-ink-muted">平均每日次數</div>
        <LoggedDaysNote loggedDays={report.feeding.loggedDays} periodDays={days} />
      </div>
      <div className="bg-primary-soft rounded-xl p-3 text-center">
        <div className="text-lg font-bold text-primary-dark">
          {report.feeding.avgDailyAmount}
          <span className="text-sm font-normal ml-0.5">ml</span>
        </div>
        <div className="text-sm text-ink-muted">平均每日總量</div>
        <LoggedDaysNote loggedDays={report.feeding.loggedDays} periodDays={days} />
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
  );
}
