import DashboardCard from '../DashboardCard';
import SparklineChart from '../SparklineChart';
import { DailySummary, DailyLog } from '~app/domain/records';
import { formatDuration } from '~app/domain/logHelpers';
import { getFeedingTrend } from '~app/domain/trendCalculator';

interface DailyLogSummaryCardProps {
  summary: DailySummary;
  dailyLogs: DailyLog[];
  onNavigate: () => void;
}

export default function DailyLogSummaryCard({
  summary,
  dailyLogs,
  onNavigate,
}: DailyLogSummaryCardProps) {
  const hasAnyLogs
    = summary.feedingCount > 0 || summary.sleepCount > 0 || summary.diaperCount > 0;

  const feedingTrend = getFeedingTrend(dailyLogs, 7);

  return (
    <DashboardCard
      title="今日記錄"
      onClick={onNavigate}
      bgColor="bg-secondary-light/30"
    >
      {hasAnyLogs
        ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-secondary-dark">
                    {summary.feedingCount}
                  </div>
                  <div className="text-xs text-ink-muted">餵奶</div>
                  {summary.totalFeedingAmount > 0 && (
                    <div className="text-xs text-ink-faint mt-1">
                      {summary.totalFeedingAmount}
                      ml
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold text-secondary-dark">
                    {summary.sleepCount}
                  </div>
                  <div className="text-xs text-ink-muted">睡眠</div>
                  {summary.totalSleepDuration > 0 && (
                    <div className="text-xs text-ink-faint mt-1">
                      {formatDuration(summary.totalSleepDuration)}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold text-secondary-dark">
                    {summary.diaperCount}
                  </div>
                  <div className="text-xs text-ink-muted">尿布</div>
                  {summary.diaperCount > 0 && (
                    <div className="text-xs text-ink-faint mt-1">
                      {summary.poopCount > 0 && `${summary.poopCount}大`}
                      {summary.poopCount > 0 && summary.peeCount > 0 && ' '}
                      {summary.peeCount > 0 && `${summary.peeCount}小`}
                    </div>
                  )}
                </div>
              </div>

              {feedingTrend.sparklinePoints.some((v) => v > 0) && (
                <div className="bg-white rounded-xl p-3">
                  <div className="text-xs text-ink-muted mb-2">近 7 天餵奶量趨勢</div>
                  <SparklineChart data={feedingTrend.sparklinePoints} height={36} />
                  <div className="text-xs text-ink-faint mt-1">
                    {'平均 '}
                    {Math.round(feedingTrend.averageValue)}
                    ml
                  </div>
                </div>
              )}
            </>
          )
        : (
            <p className="text-center py-4 text-ink-faint">今日尚無記錄</p>
          )}
    </DashboardCard>
  );
}
