import { PercentileBadge } from './PercentileBadge';
interface MeasurementCardProps {
  label: string;
  value: string;
  percentile?: number;
}

export function MeasurementCard({ label, value, percentile }: MeasurementCardProps) {
  return (
    <div className="bg-secondary-light rounded-xl p-3 text-center">
      <p className="text-sm text-ink-muted mb-1">{label}</p>
      <p className="text-lg font-bold text-ink">{value}</p>
      {percentile !== undefined && (
        <div className="mt-1">
          <PercentileBadge value={percentile} />
        </div>
      )}
    </div>
  );
}
