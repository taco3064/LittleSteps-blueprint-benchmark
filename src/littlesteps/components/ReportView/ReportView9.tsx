import { LoggedDaysNote } from './LoggedDaysNote';
interface ReportView9Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
  days: 7 | 30;
}

export function ReportView9({ report, days }: ReportView9Props) {
  if (!report.pumping) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-primary-soft rounded-xl p-3 text-center">
        <div className="text-lg font-bold text-primary-dark">
          {report.pumping.avgDailySessions}
        </div>
        <div className="text-sm text-ink-muted">平均每日次數</div>
        <LoggedDaysNote loggedDays={report.pumping.loggedDays} periodDays={days} />
      </div>
      <div className="bg-primary-soft rounded-xl p-3 text-center">
        <div className="text-lg font-bold text-primary-dark">
          {report.pumping.avgDailyAmount}
          <span className="text-sm font-normal ml-0.5">ml</span>
        </div>
        <div className="text-sm text-ink-muted">平均每日擠出量</div>
        <LoggedDaysNote loggedDays={report.pumping.loggedDays} periodDays={days} />
      </div>
    </div>
  );
}
