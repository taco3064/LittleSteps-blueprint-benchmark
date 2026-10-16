import { formatDate } from '~app/platform/domain/calendar';
import { ClinicSummaryView5 } from './ClinicSummaryView5';
interface ClinicSummaryView4Props {
  data: import('~app/littlesteps/domain/clinicSummary').ClinicSummaryData;
}

export function ClinicSummaryView4({ data }: ClinicSummaryView4Props) {
  if (!data.latestGrowth) {
    return null;
  }

  return (
    <div className="mt-5 pt-4 border-t border-ink/10">
      <p className="text-sm text-ink-muted mb-3">
        最新測量（
        {formatDate(data.latestGrowth.date)}
        ）
        {data.correctedAgeDisplay && '，百分位以矯正年齡計算'}
      </p>
      <ClinicSummaryView5 data={data} />
    </div>
  );
}
