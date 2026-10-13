import { motion } from 'framer-motion';

import { formatDuration } from '~app/domain/logHelpers';

import { listItem } from '~app/domain/motion';
import { formatDateTime, StatCard } from './display';
import type { ClinicSummaryData } from '~app/domain/clinicSummary';

export default function DailySummary({ data }: { data: ClinicSummaryData }) {
  return (
    <motion.section variants={listItem} className="panel mb-4">
      <h2>近 7 天日常摘要</h2>
      {/* 每個平均各有自己的分母，寫在各自的格子裡。共用一個「有記錄的天數」
              會讓記得比較少的那一項被稀釋，而這份文件是要拿給醫師看的。 */}
      <p className="text-sm text-ink-muted mt-1">
        {data.weekSummary.loggedDays > 0
          ? `以 ${data.weekSummary.loggedDays} 天的記錄計算`
          : '近 7 天沒有任何記錄'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        <StatCard
          label="每日平均餵奶次數"
          value={
            data.weekSummary.feedingDays > 0
              ? `${data.weekSummary.avgFeedingCount} 次`
              : '無記錄'
          }
          loggedDays={data.weekSummary.feedingDays}
        />
        <StatCard
          label="每日平均奶量"
          value={
            data.weekSummary.feedingDays > 0
              ? `${data.weekSummary.avgFeedingAmount} ml`
              : '無記錄'
          }
          loggedDays={data.weekSummary.feedingDays}
        />
        <StatCard
          label="每日平均睡眠"
          value={
            data.weekSummary.sleepDays > 0
              ? `${data.weekSummary.avgSleepHours} 小時`
              : '無記錄'
          }
          loggedDays={data.weekSummary.sleepDays}
        />
        <StatCard
          label="最長連續睡眠"
          value={
            data.weekSummary.longestSleep > 0
              ? formatDuration(data.weekSummary.longestSleep)
              : '無記錄'
          }
        />
        <StatCard
          label="每日平均便便次數"
          value={
            data.weekSummary.diaperDays > 0
              ? `${data.weekSummary.avgPoopCount} 次`
              : '無記錄'
          }
          loggedDays={data.weekSummary.diaperDays}
        />
        <StatCard
          label="最後一次便便"
          value={
            data.weekSummary.lastPoopTime
              ? formatDateTime(data.weekSummary.lastPoopTime)
              : '無紀錄'
          }
          small
        />
      </div>
    </motion.section>
  );
}
