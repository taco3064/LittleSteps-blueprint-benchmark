import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import SimpleBarChart from '../SimpleBarChart';
interface SleepAnalysisView5Props {
  ageInMonths: number;
  recommendation: import('~app/littlesteps/domain/sleep').SleepRequirement;
  comparisonData: { label: string; value: number; max: number; color: string }[];
  stats: import('~app/littlesteps/domain/sleepAnalysis').SleepStats;
  nightDayData: { label: string; value: number; max: number; color: string }[];
}

export function SleepAnalysisView5({
  ageInMonths, recommendation, comparisonData, stats, nightDayData,
}: SleepAnalysisView5Props) {
  return (
    <>
      <motion.div variants={listItem} className="panel mb-4">
        <h2 className="mb-2">睡眠時長對比</h2>
        <p className="text-sm text-ink-muted mb-4">
          {ageInMonths}
          {' '}
          個月大寶寶建議：
          {recommendation.totalHours}
        </p>
        <SimpleBarChart data={comparisonData} />
        {stats.daysWithRecords < stats.daysInPeriod && (
          <p className="text-xs text-ink-faint mt-2">
            {stats.daysWithRecords}
            {' '}
            天有記錄
          </p>
        )}
      </motion.div>

      <motion.div variants={listItem} className="panel mb-4">
        <h2 className="mb-4">夜間 vs 白天</h2>
        <SimpleBarChart data={nightDayData} height={32} />
        <div className="mt-3 text-sm text-ink-muted">
          夜間佔比：
          {stats.totalDuration > 0
            ? `${((stats.nightSleep / stats.totalDuration) * 100).toFixed(0)}%`
            : '0%'}
        </div>
      </motion.div>
    </>
  );
}
