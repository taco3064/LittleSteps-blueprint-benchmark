import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import EmptyState from '~app/components/EmptyState';
import SleepTimelineChart from '~app/components/SleepTimelineChart';
import { User } from '~app/domain/authUser';
import { calculateAge } from '~app/domain/dateHelpers';
import { listItem, stagger } from '~app/domain/motion';
import { ChildProfile } from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import {
  calculateSleepRegularity,
  calculateSleepStats,
} from '~app/domain/sleepAnalysis';
import { useDailyLogs } from '~app/hooks/useDailyLogs';
import SleepAdvice from './SleepAdvice';
import SleepDurationComparison from './SleepDurationComparison';
import SleepRegularity from './SleepRegularity';

interface SleepAnalysisPageProps {
  currentChild?: ChildProfile | null;
  user: User | null;
}

export default function SleepAnalysisPage({
  currentChild,
  user,
}: SleepAnalysisPageProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  // Load daily logs
  const { logs, loading } = useDailyLogs(currentChild?.id || null, user);

  // Filter sleep logs
  const sleepLogs = useMemo(() => {
    return logs.filter((log) => log.type === 'sleep');
  }, [logs]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateSleepStats(sleepLogs, period);
  }, [sleepLogs, period]);

  const regularity = useMemo(() => {
    return calculateSleepRegularity(sleepLogs);
  }, [sleepLogs]);

  const ageInMonths = useMemo(() => {
    return currentChild ? calculateAge(currentChild.birthday) : 0;
  }, [currentChild]);

  const hasRecords = stats.daysWithRecords > 0;

  // No child selected
  if (!currentChild) {
    return <SleepProfileNotice />;
  }

  // Loading state
  if (loading) {
    return <SleepLoading />;
  }

  // Empty state - no sleep records
  if (sleepLogs.length === 0) {
    return <SleepRecordsNotice />;
  }

  // Insufficient data warning
  const showInsufficientDataWarning = sleepLogs.length < 3;

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
              {'睡眠記錄較少（共 '}
              {sleepLogs.length}
              {' 筆），分析結果可能不夠準確。建議累積更多記錄後再查看。'}
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
        <SleepStatistics hasRecords={hasRecords} stats={stats} period={period} />

        <SleepDurationComparison
          stats={stats}
          period={period}
          ageInMonths={ageInMonths}
        />
        {/* Week Timeline */}
        {sleepLogs.length >= 2 && (
          <motion.div variants={listItem} className="mb-4">
            <h2 className="mb-3">本週睡眠時間軸</h2>
            <SleepTimelineChart weekLogs={sleepLogs} />
          </motion.div>
        )}

        <SleepRegularity regularity={regularity} count={sleepLogs.length} />
        <SleepAdvice stats={stats} ageInMonths={ageInMonths} />
      </motion.div>
    </div>
  );
}

function SleepStatistics({
  hasRecords,
  stats,
  period,
}: {
  hasRecords: boolean;
  stats: import('~app/domain/sleepAnalysis').SleepStats;
  period: 'today' | 'week' | 'month';
}) {
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

function SleepProfileNotice() {
  return (
    <div className="screen">
      <div className="screen-body">
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="還沒有寶寶的資料"
          description="請點右上角的帳號按鈕新增或選擇寶寶。"
        />
      </div>
    </div>
  );
}

function SleepLoading() {
  return (
    <div className="screen">
      <div className="screen-body flex justify-center py-16">
        <div
          className="w-40 h-1 rounded-full bg-primary-light overflow-hidden"
          role="status"
        >
          <div
            className={
              'h-full w-1/3 rounded-full bg-primary-dark'
              + ' animate-[loading_1.2s_ease-in-out_infinite]'
            }
          />
          <span className="sr-only">載入中</span>
        </div>
      </div>
    </div>
  );
}

function SleepRecordsNotice() {
  return (
    <div className="screen">
      <div className="screen-body">
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="還沒有睡眠記錄"
          description={
            '開始記錄寶寶的睡眠，就能看到分析與建議囉！\n前往「快速日誌」頁面記錄睡眠'
          }
        />
      </div>
    </div>
  );
}
