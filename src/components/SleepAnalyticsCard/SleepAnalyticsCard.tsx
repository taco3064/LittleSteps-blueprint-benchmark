import { motion } from 'framer-motion';
import {
  Moon,
  Star,
  Clock,
  AlertTriangle,
  TrendingUp,
  PartyPopper,
  Heart,
  AlertCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import DashboardCard from '../DashboardCard';
import { fadeInUp } from '~app/domain/motion';
import type { SleepAnalytics } from '~app/domain/records';
import { formatDuration } from '~app/domain/logHelpers';
import { getRecommendedSleepHours } from '~app/domain/trendCalculator';

interface SleepAnalyticsCardProps {
  analytics: SleepAnalytics;
  ageMonths?: number;
  onNavigate: () => void;
}

/*
  Recommendation icons arrive as lucide names from `sleepAnalytics.ts`; the glyph
  plus its colour is what encodes positive / suggestion / warning, so it stays.
*/
const iconMap: Record<string, React.ElementType> = {
  PartyPopper,
  Moon,
  Star,
  Clock,
  AlertTriangle,
  TrendingUp,
  Heart,
  AlertCircle,
  Calendar,
};

export default function SleepAnalyticsCard({
  analytics,
  ageMonths,
  onNavigate,
}: SleepAnalyticsCardProps) {
  const hasData = analytics.sleepCount > 0;

  return (
    <DashboardCard
      title="睡眠分析"
      onClick={onNavigate}
      bgColor="bg-secondary-light/30"
    >
      {hasData
        ? (
            <>
              <SleepMetrics analytics={analytics} />
              {/* Sleeping Through Night Badge */}
              {analytics.isSleepingThroughNight && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="bg-mint-dark text-white rounded-2xl p-3"
                >
                  <div className="font-bold text-sm">睡過夜了！</div>
                  <div className="text-xs opacity-90">
                    {'最長連續睡眠 '}
                    {Math.floor(analytics.longestContinuousSleep / 60)}
                    {' 小時'}
                  </div>
                </motion.div>
              )}

              <SleepRecommendation analytics={analytics} />
              {/* Bedtime & Wake Time */}
              {(analytics.averageBedtime || analytics.averageWakeTime) && (
                <div className="grid grid-cols-2 gap-2">
                  {analytics.averageBedtime && (
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xs text-ink-muted mb-1">平均入睡</div>
                      <div className="text-sm font-bold text-secondary-dark">
                        {analytics.averageBedtime}
                      </div>
                    </div>
                  )}
                  {analytics.averageWakeTime && (
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xs text-ink-muted mb-1">平均起床</div>
                      <div className="text-sm font-bold text-secondary-dark">
                        {analytics.averageWakeTime}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Sleep Hours */}
              {ageMonths !== undefined
                && (() => {
                  const recommended = getRecommendedSleepHours(ageMonths);
                  const currentSleepHours = analytics.totalSleepDuration / 60;
                  const meetsMinimum = currentSleepHours >= recommended.min;

                  return (
                    <div
                      className={`flex items-center gap-2 rounded-xl p-3 ${meetsMinimum ? 'bg-mint-light' : 'bg-butter-light'}`}
                    >
                      {meetsMinimum
                        ? (
                            <CheckCircle2
                              className="w-4 h-4 text-mint-dark flex-shrink-0"
                            />
                          )
                        : (
                            <AlertTriangle
                              className="w-4 h-4 text-butter-dark flex-shrink-0"
                            />
                          )}
                      <span
                        className={`text-xs ${meetsMinimum ? 'text-mint-dark' : 'text-butter-dark'}`}
                      >
                        建議睡眠時數：
                        {recommended.min}
                        -
                        {recommended.max}
                        {' 小時'}
                      </span>
                    </div>
                  );
                })()}
            </>
          )
        : (
            <p className="text-center py-4 text-ink-faint">尚無睡眠記錄</p>
          )}
    </DashboardCard>
  );
}

function SleepMetrics({ analytics }: { analytics: SleepAnalytics }) {
  return (
    <>
      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3">
          <div className="text-xs text-ink-muted mb-1">總睡眠</div>
          <div className="text-xl font-bold text-ink">
            {formatDuration(analytics.totalSleepDuration)}
          </div>
          <div className="text-xs text-ink-faint mt-1">
            {analytics.sleepCount}
            {' 次'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3">
          <div className="text-xs text-ink-muted mb-1">睡眠品質</div>
          <div
            className={`text-xl font-bold ${getQualityColor(analytics.sleepQualityScore)}`}
          >
            {analytics.sleepQualityScore}
          </div>
          <div className="text-xs text-ink-faint mt-1">
            {getQualityLabel(analytics.sleepQualityScore)}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-white rounded-lg">
          <div className="text-lg font-bold text-secondary-dark">
            {Math.floor(analytics.longestSleepDuration / 60)}
            h
          </div>
          <div className="text-xs text-ink-muted">最長</div>
        </div>

        <div className="text-center p-2 bg-white rounded-lg">
          <div className="text-lg font-bold text-secondary-dark">
            {analytics.routineScore}
            %
          </div>
          <div className="text-xs text-ink-muted">規律性</div>
        </div>

        <div className="text-center p-2 bg-white rounded-lg">
          <div className="text-lg font-bold text-secondary-dark">
            {analytics.nightWakingsTotal}
          </div>
          <div className="text-xs text-ink-muted">夜醒</div>
        </div>
      </div>
    </>
  );
}

function SleepRecommendation({ analytics }: { analytics: SleepAnalytics }) {
  return (
    <>
      {/* Top Recommendation */}
      {analytics.recommendations.length > 0 && (
        <div className="bg-white rounded-xl p-3">
          {(() => {
            const topRec = analytics.recommendations[0];
            const IconComponent = iconMap[topRec.icon] || TrendingUp;

            const typeColor
              = topRec.type === 'positive'
                ? 'text-mint-dark'
                : topRec.type === 'warning'
                  ? 'text-butter-dark'
                  : 'text-secondary-dark';

            return (
              <div className="flex items-start gap-3">
                <IconComponent className={`w-4 h-4 mt-0.5 shrink-0 ${typeColor}`} />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-ink mb-1">
                    {topRec.title}
                  </div>
                  <div className="text-xs text-ink-muted leading-relaxed">
                    {topRec.message}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}

// Get quality score color
const getQualityColor = (score: number): string => {
  if (score >= 80) {
    return 'text-mint-dark';
  }

  if (score >= 60) {
    return 'text-secondary-dark';
  }

  if (score >= 40) {
    return 'text-butter-dark';
  }

  return 'text-red-600';
};

// Get quality label
const getQualityLabel = (score: number): string => {
  if (score >= 80) {
    return '優良';
  }

  if (score >= 60) {
    return '良好';
  }

  if (score >= 40) {
    return '普通';
  }

  return '需改善';
};
