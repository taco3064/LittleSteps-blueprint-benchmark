import { motion } from 'framer-motion';

import { Plus } from 'lucide-react';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { listItem, stagger } from '~app/platform/components/Motion';

import { pressable } from '~app/platform/components/Pressable';

import { FoodTrialRecord } from '~app/family/domain/familyRecords';

import { formatDate } from '~app/platform/domain/calendar';

import type {
  foodTrialProgress,
  FoodTrialProgressRow,
} from '~app/littlesteps/domain/foodTrialProgress';
interface TrackerActions {
  onViewFood: (food: FoodTrialRecord) => void;
  onAddTrialDate: (foodId: string) => void;
}
interface FourByThreeTrackerPresentation2Props extends TrackerActions {
  row: FoodTrialProgressRow;
  totalDays: number;
}
interface FourByThreeTrackerPresentation1Props extends TrackerActions {
  rows: FoodTrialProgressRow[];
  totalDays: number;
}
interface FourByThreeTrackerPresentationProps extends TrackerActions {
  progress: ReturnType<typeof foodTrialProgress>;
}

export function FourByThreeTrackerPresentation2({
  row,
  totalDays,
  onViewFood,
  onAddTrialDate,
}: FourByThreeTrackerPresentation2Props) {
  const { food, canRecord: canTry, trialDates, stage, progressPercent } = row;

  return (
    <motion.div
      key={food.id}
      variants={listItem}
      className={`card-tap border ${canTry ? 'bg-mint-light/50 border-mint' : 'border-ink/10'}`}
      {...pressable(() => onViewFood(food))}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h4>{food.foodName}</h4>
          {food.category && (
            <p className="text-xs text-ink-faint">{food.category}</p>
          )}
        </div>

        {canTry
          ? (
              <span className="tag shrink-0 bg-mint-dark text-white">可記錄</span>
            )
          : (
              <span className="tag shrink-0 bg-ink/10 text-ink-muted">今天已記錄</span>
            )}
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
          <span>{`進度：${trialDates.length} / ${totalDays} 天`}</span>
          <span>{stage.title}</span>
        </div>
        <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${canTry ? 'bg-mint' : 'bg-secondary'}`}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {trialDates.map((date, idx) => (
          <span key={date} className="tag bg-secondary-light text-secondary-dark">
            第
            {' '}
            {idx + 1}
            {' '}
            天：
            {formatDate(date)}
          </span>
        ))}
      </div>

      {canTry && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTrialDate(food.id);
          }}
          className="btn-primary w-full mt-2"
        >
          <Plus className="w-4 h-4" />
          記錄今天嘗試
        </button>
      )}
    </motion.div>
  );
}

export function FourByThreeTrackerPresentation1({
  rows,
  totalDays,
  onViewFood,
  onAddTrialDate,
}: FourByThreeTrackerPresentation1Props) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {rows.map((row) => (
        <FourByThreeTrackerPresentation2
          key={row.food.id}
          row={row}
          totalDays={totalDays}
          onViewFood={onViewFood}
          onAddTrialDate={onAddTrialDate}
        />
      ))}
    </motion.div>
  );
}

export function FourByThreeTrackerPresentation({
  progress,
  onViewFood,
  onAddTrialDate,
}: FourByThreeTrackerPresentationProps) {
  const { active, completed, totalDays, methodName, stageTitles } = progress;

  return (
    <div className="space-y-4">
      {/* What the 4×3 rule is */}
      <div className="card bg-secondary-soft">
        <h4 className="mb-1">{methodName}</h4>
        <p className="text-sm text-ink-muted leading-relaxed">
          同一種新食物連續記錄
          {' '}
          <strong>
            {totalDays}
            {' '}
            天
          </strong>
          ：
          {stageTitles.join('、')}
          。這段期間不要再加入其他新食材。
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3>追蹤中的食物</h3>
        <span className="text-sm text-ink-muted">
          {active.length}
          {' '}
          項
        </span>
      </div>

      {active.length === 0 && (
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="目前沒有正在追蹤的食物"
          description="新增食物記錄後會在這裡顯示追蹤進度"
        />
      )}

      <FourByThreeTrackerPresentation1
        rows={active}
        totalDays={totalDays}
        onViewFood={onViewFood}
        onAddTrialDate={onAddTrialDate}
      />

      {completed.length > 0 && (
        <p className="card bg-warm-white text-sm text-ink-muted">
          {`${completed.length} 種食物已完成 ${totalDays} 天的試敏追蹤`}
        </p>
      )}
    </div>
  );
}
