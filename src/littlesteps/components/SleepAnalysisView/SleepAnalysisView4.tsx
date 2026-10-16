import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
interface SleepAnalysisView4Props {
  hasRecords: boolean;
  stats: import('~app/littlesteps/domain/sleepAnalysis').SleepStats;
  period: 'today' | 'week' | 'month';
}

export function SleepAnalysisView4({
  hasRecords, stats, period,
}: SleepAnalysisView4Props) {
  return (
    <motion.div variants={listItem} className="grid grid-cols-3 gap-3 mb-4">
      <div className="card text-center">
        <div className="text-2xl font-bold text-primary-dark">
          {hasRecords ? `${(stats.dailyAverage / 60).toFixed(1)}h` : '—'}
        </div>
        <div className="text-sm text-ink-muted mt-1">
          {period === 'today' ? '今日總時長' : '每日平均'}
        </div>
      </div>
      <div className="card text-center">
        <div className="text-2xl font-bold text-primary-dark">
          {!hasRecords
            ? '—'
            : period === 'today'
              ? `${stats.sleepCount}次`
              : `${(stats.sleepCount / stats.daysWithRecords).toFixed(1)}次`}
        </div>
        <div className="text-sm text-ink-muted mt-1">
          {period === 'today' ? '睡眠次數' : '每日次數'}
        </div>
      </div>
      <div className="card text-center">
        <div className="text-2xl font-bold text-primary-dark">
          {hasRecords ? `${(stats.averageDuration / 60).toFixed(1)}h` : '—'}
        </div>
        <div className="text-sm text-ink-muted mt-1">每次平均</div>
      </div>
    </motion.div>
  );
}
