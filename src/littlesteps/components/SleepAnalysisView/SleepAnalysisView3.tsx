import { motion } from 'framer-motion';
import EmptyState from '~app/platform/components/EmptyState';
import { listItem, stagger } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import SleepTimelineChart from '../SleepTimelineChart';
import { SleepAnalysisView10 } from './SleepAnalysisView10';
import { SleepAnalysisView4 } from './SleepAnalysisView4';
import { SleepAnalysisView5 } from './SleepAnalysisView5';
import { SleepAnalysisView6 } from './SleepAnalysisView6';
interface SleepAnalysisView3Props {
  showInsufficientDataWarning: boolean;
  sleepLogs: import('~app/family/domain/familyRecords').DailyLog[];
  setPeriod: import('react').Dispatch<
    import('react').SetStateAction<'today' | 'week' | 'month'>
  >;
  period: 'today' | 'week' | 'month';
  hasRecords: boolean;
  stats: import('~app/littlesteps/domain/sleepAnalysis').SleepStats;
  ageInMonths: number;
  recommendation: import('~app/littlesteps/domain/sleep').SleepRequirement;
  comparisonData: { label: string; value: number; max: number; color: string }[];
  nightDayData: { label: string; value: number; max: number; color: string }[];
  regularity: import('~app/littlesteps/domain/sleepAnalysis').SleepRegularity;
  bedtimeStars: number;
  wakeTimeStars: number;
  advice: import('~app/littlesteps/domain/sleepAnalysis').SleepAdvice[];
}

export function SleepAnalysisView3({
  showInsufficientDataWarning, sleepLogs, setPeriod, period, hasRecords, stats,
  ageInMonths, recommendation, comparisonData, nightDayData, regularity,
  bedtimeStars, wakeTimeStars, advice,
}: SleepAnalysisView3Props) {
  return (
    <div className="screen">
      <motion.div
        className="screen-body"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {showInsufficientDataWarning && (
          <motion.div variants={listItem} className="card bg-butter-light mb-4">
            <p className="text-sm text-butter-dark">
              睡眠記錄較少（共
              {' '}
              {sleepLogs.length}
              {' '}
              筆），分析結果可能不夠準確。建議累積更多記錄後再查看。
            </p>
          </motion.div>
        )}

        {/* Period Selection */}
        <motion.div variants={listItem} className="flex justify-center gap-2 mb-6">
          {(['today', 'week', 'month'] as const).map((p) => {
            const labels = { today: '今日', week: '本週', month: '本月' };

            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                className={`chip ${period === p ? 'chip-on' : ''}`}
              >
                {labels[p]}
              </button>
            );
          })}
        </motion.div>

        {/* Statistics Cards */}
        <SleepAnalysisView4 hasRecords={hasRecords} stats={stats} period={period} />

        {/* 這一段沒有記錄就什麼都不畫。一根 0 高度的長條擺在滿高的「建議睡眠」
            旁邊，讀起來是「這孩子沒睡」，而事實只是還沒記。 */}
        {hasRecords
          ? (
              <SleepAnalysisView5
                ageInMonths={ageInMonths}
                recommendation={recommendation}
                comparisonData={comparisonData}
                stats={stats}
                nightDayData={nightDayData}
              />
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

        {/* Week Timeline */}
        {sleepLogs.length >= 2 && (
          <motion.div variants={listItem} className="mb-4">
            <h2 className="mb-3">本週睡眠時間軸</h2>
            <SleepTimelineChart weekLogs={sleepLogs} />
          </motion.div>
        )}

        {/* 規律性只算夜間睡眠。只記過小睡的話沒有就寢時間可談，0 顆星會被讀成
            「很不規律」，而事實是「還沒有這項資料」。 */}
        {sleepLogs.length >= 3
          && (regularity.averageBedtime || regularity.averageWakeTime) && (
          <SleepAnalysisView6
            regularity={regularity}
            bedtimeStars={bedtimeStars}
            wakeTimeStars={wakeTimeStars}
          />
        )}

        {/* Sleep Advice */}
        <SleepAnalysisView10 advice={advice} />
      </motion.div>
    </div>
  );
}
