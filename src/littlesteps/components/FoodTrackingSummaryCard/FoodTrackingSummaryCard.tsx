import DashboardCard from '../DashboardCard';

interface FoodStats {
  total: number;
  noAllergy: number;
  withAllergy: number;
  loved: number;
  disliked: number;
}

interface FoodTrackingSummaryCardProps {
  stats: FoodStats;
  onNavigate: () => void;
}

export default function FoodTrackingSummaryCard({
  stats, onNavigate,
}: FoodTrackingSummaryCardProps) {
  const safeRate
    = stats.total > 0 ? Math.round((stats.noAllergy / stats.total) * 100) : 0;

  return (
    <DashboardCard
      title="副食品追蹤"
      subtitle="食物嘗試與過敏紀錄"
      onClick={onNavigate}
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-xl font-bold text-ink">{stats.total}</div>
          <div className="text-xs text-ink-muted mt-1">已試食物</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-mint-dark">{stats.noAllergy}</div>
          <div className="text-xs text-ink-muted mt-1">無過敏</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-butter-dark">
            {stats.withAllergy}
          </div>
          <div className="text-xs text-ink-muted mt-1">有過敏</div>
        </div>
      </div>

      <div className="space-y-2">
        {stats.total > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">安全率</span>
            <span className="font-bold text-mint-dark">
              {safeRate}
              %
            </span>
          </div>
        )}

        {stats.loved > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">喜歡的食物</span>
            <span className="font-bold text-primary-dark">
              {stats.loved}
              {' '}
              種
            </span>
          </div>
        )}

        {stats.withAllergy > 0 && (
          <p
            className={
              'text-sm font-medium text-butter-dark bg-butter-light rounded-xl '
              + 'px-3 py-2'
            }
          >
            {stats.withAllergy}
            {' '}
            種食物有過敏反應
          </p>
        )}

        {stats.total === 0 && (
          <p className="text-center py-2 text-sm text-ink-faint">尚未記錄任何食物</p>
        )}
      </div>
    </DashboardCard>
  );
}
