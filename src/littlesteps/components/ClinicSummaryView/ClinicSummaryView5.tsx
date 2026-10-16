import { MeasurementCard } from './MeasurementCard';
interface ClinicSummaryView5Props {
  data: import('~app/littlesteps/domain/clinicSummary').ClinicSummaryData;
}

export function ClinicSummaryView5({ data }: ClinicSummaryView5Props) {
  if (!data.latestGrowth) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {data.latestGrowth.weight !== undefined && (
        <MeasurementCard
          label="體重"
          value={`${data.latestGrowth.weight} kg`}
          percentile={data.latestGrowth.percentile?.weight}
        />
      )}
      {data.latestGrowth.height !== undefined && (
        <MeasurementCard
          label="身高"
          value={`${data.latestGrowth.height} cm`}
          percentile={data.latestGrowth.percentile?.height}
        />
      )}
      {data.latestGrowth.headCircumference !== undefined && (
        <MeasurementCard
          label="頭圍"
          value={`${data.latestGrowth.headCircumference} cm`}
          percentile={data.latestGrowth.percentile?.headCircumference}
        />
      )}
    </div>
  );
}
