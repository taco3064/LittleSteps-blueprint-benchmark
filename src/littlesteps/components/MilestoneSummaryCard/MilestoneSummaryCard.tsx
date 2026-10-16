import { calculateMilestoneSummary } from '~app/family/domain/summaryCalculator';
import { MilestoneProgress } from '~app/family/domain/familyRecords';
import DashboardCard from '../DashboardCard';

interface MilestoneSummaryCardProps {
  milestoneProgress: MilestoneProgress;
  onNavigate: () => void;
}

export default function MilestoneSummaryCard({
  milestoneProgress, onNavigate,
}: MilestoneSummaryCardProps) {
  const summary = calculateMilestoneSummary(milestoneProgress);

  return (
    <DashboardCard
      title="里程碑追蹤"
      onClick={onNavigate}
      bgColor="bg-primary-light/30"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary-dark">
          {summary.achievedCount}
        </span>
        <span className="text-ink-muted">
          /
          {summary.totalMilestones}
          {' '}
          已達成
        </span>
      </div>

      <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${summary.achievementRate}%` }}
        />
      </div>

      {summary.recentAchievements.length > 0
        ? (
            <div className="pt-2 border-t border-ink/10">
              <p className="text-xs font-medium text-ink-faint mb-2">最近達成</p>
              <div className="space-y-1">
                {summary.recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="text-sm text-ink flex items-start gap-2"
                  >
                    <span className="text-primary-dark">•</span>
                    <span className="flex-1">{achievement.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        : (
            <p className="text-sm text-ink-faint">尚無達成記錄</p>
          )}
    </DashboardCard>
  );
}
