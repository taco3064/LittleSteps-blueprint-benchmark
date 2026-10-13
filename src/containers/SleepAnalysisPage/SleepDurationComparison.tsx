import { motion } from 'framer-motion';
import { useMemo } from 'react';
import EmptyState from '~app/components/EmptyState';
import SimpleBarChart from '~app/components/SimpleBarChart';
import { listItem } from '~app/domain/motion';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { getSleepRequirementForAge } from '~app/domain/sleep';
import { calculateSleepStats, parseHourRange } from '~app/domain/sleepAnalysis';

export default function SleepDurationComparison({
  stats,
  period,
  ageInMonths,
}: {
  stats: ReturnType<typeof calculateSleepStats>;
  period: 'today' | 'week' | 'month';
  ageInMonths: number;
}) {
  const recommendation = useMemo(() => {
    return getSleepRequirementForAge(ageInMonths);
  }, [ageInMonths]);

  // Parse recommendation hours
  const { max: maxHours } = parseHourRange(recommendation.totalHours);
  const actualHours = stats.dailyAverage / 60; // 使用每日平均

  // 分母是「有記錄的天數」，不是視窗長度。除以固定的 7 或 30 會把一晚 10 小時
  // 算成每日 0.3 小時，然後對照建議時數說睡眠不足——那不是結論，是沒記錄。
  const hasRecords = stats.daysWithRecords > 0;

  const dailyNightSleep = hasRecords
    ? stats.nightSleep / stats.daysWithRecords / 60
    : 0;

  const dailyDaytimeNaps = hasRecords
    ? stats.daytimeNaps / stats.daysWithRecords / 60
    : 0;

  // Chart data for actual vs recommended. Bars carry no text, so the DEFAULT
  // token fills are the right shades here.
  const comparisonData = [
    {
      label: period === 'today' ? '今日睡眠' : '每日平均',
      value: actualHours,
      max: maxHours,
      color: 'bg-primary',
    },
    {
      label: '建議睡眠',
      value: maxHours,
      max: maxHours,
      color: 'bg-ink/20',
    },
  ];

  // Chart data for night vs day
  const nightDayData = [
    {
      label: '夜間睡眠',
      value: dailyNightSleep,
      max: actualHours > 0 ? actualHours : 1,
      color: 'bg-secondary',
    },
    {
      label: '白天小睡',
      value: dailyDaytimeNaps,
      max: actualHours > 0 ? actualHours : 1,
      color: 'bg-butter',
    },
  ];

  return (
    <>
      {/* 這一段沒有記錄就什麼都不畫。一根 0 高度的長條擺在滿高的「建議睡眠」
            旁邊，讀起來是「這孩子沒睡」，而事實只是還沒記。 */}
      {hasRecords
        ? (
            <>
              <motion.div variants={listItem} className="panel mb-4">
                <h2 className="mb-2">睡眠時長對比</h2>
                <p className="text-sm text-ink-muted mb-4">
                  {ageInMonths}
                  {' 個月大寶寶建議：'}
                  {recommendation.totalHours}
                </p>
                <SimpleBarChart data={comparisonData} />
                {stats.daysWithRecords < stats.daysInPeriod && (
                  <p className="text-xs text-ink-faint mt-2">
                    {stats.daysWithRecords}
                    {' 天有記錄'}
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
          )
        : (
            <motion.div variants={listItem} className="mb-4">
              <EmptyState
                theme={SERVICE_THEME.littlesteps}
                title="這段時間還沒有睡眠記錄"
                description="在快速日誌記下一次睡眠，這裡就會出現時長對比與夜間白天的比例。"
              />
            </motion.div>
          )}
    </>
  );
}
