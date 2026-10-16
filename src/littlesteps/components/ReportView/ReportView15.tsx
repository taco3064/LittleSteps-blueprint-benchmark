interface ReportView15Props {
  report: import('~app/littlesteps/domain/reportGenerator').WeeklyReport;
}

export function ReportView15({ report }: ReportView15Props) {
  if (!report.growth) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-mint-soft rounded-xl p-4 text-center">
        <div className="text-lg font-bold text-mint-dark">
          {report.growth.weightChange > 0 ? '+' : ''}
          {report.growth.weightChange}
          <span className="text-xs font-normal ml-0.5">kg</span>
        </div>
        <div className="text-sm text-ink-muted">體重變化</div>
        {report.growth.latestPercentiles.weight !== undefined && (
          <div className="text-sm text-ink-muted mt-1">
            百分位:
            {' '}
            {report.growth.latestPercentiles.weight}
            %
          </div>
        )}
      </div>
      <div className="bg-mint-soft rounded-xl p-4 text-center">
        <div className="text-lg font-bold text-mint-dark">
          {report.growth.heightChange > 0 ? '+' : ''}
          {report.growth.heightChange}
          <span className="text-xs font-normal ml-0.5">cm</span>
        </div>
        <div className="text-sm text-ink-muted">身高變化</div>
        {report.growth.latestPercentiles.height !== undefined && (
          <div className="text-sm text-ink-muted mt-1">
            百分位:
            {' '}
            {report.growth.latestPercentiles.height}
            %
          </div>
        )}
      </div>
    </div>
  );
}
