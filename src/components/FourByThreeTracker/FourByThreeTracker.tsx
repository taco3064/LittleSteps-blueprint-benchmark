import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import EmptyState from '../EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { listItem, stagger } from '~app/domain/motion';
import { pressable } from '~app/domain/pressable';
import { FoodTrialRecord } from '~app/domain/records';
import { formatDate, toLocalDateKey } from '~app/domain/dateHelpers';
import { allergyTestingMethod } from '~app/domain/complementaryFood';
import { trialDatesOf } from '~app/domain/foodTrialDates';

interface FourByThreeTrackerProps {
  foodTrials: FoodTrialRecord[];
  onAddTrialDate: (foodId: string) => void;
  onViewFood: (food: FoodTrialRecord) => void;
}

/*
  指南（complementaryFood.ts 的 allergyTestingMethod）是三個各 3 天的階段——
  小量試 3 天、增量試 3 天、再觀察 3 天——同一種食物要一天接一天地給。這裡原本
  卻反過來要求兩次之間隔 3 天，還把「記錄今天嘗試」藏起來三天：照著同一頁印出來
  的步驟做的家長，明天就按不下去。階段與天數都直接讀資料檔，才不會再各說各話。
*/
const STAGE_DAYS = 3;
const STAGES = allergyTestingMethod.steps;
const TOTAL_DAYS = STAGES.length * STAGE_DAYS;

export default function FourByThreeTracker({
  foodTrials,
  onAddTrialDate,
  onViewFood,
}: FourByThreeTrackerProps) {
  const today = toLocalDateKey();

  // 嘗試日期在資料庫裡有兩種形狀（見 StoredTrialDates），一律先整理成日期清單。
  const datesOf = new Map(foodTrials.map((food) => [food.id, trialDatesOf(food)]));
  const dates = (food: FoodTrialRecord) => datesOf.get(food.id) ?? [];

  // 追蹤中的食物：這一輪還沒走完的那些。
  const activeFoods = foodTrials.filter((food) => dates(food).length < TOTAL_DAYS);

  // 今天還沒記的排前面（一天只記一次），其餘維持原本的順序。
  const sortedFoods = [...activeFoods].sort(
    (a, b) => Number(dates(a).includes(today)) - Number(dates(b).includes(today)),
  );

  return (
    <div className="space-y-4">
      {/* What the 4×3 rule is */}
      <div className="card bg-secondary-soft">
        <h4 className="mb-1">{allergyTestingMethod.name}</h4>
        <p className="text-sm text-ink-muted leading-relaxed">
          同一種新食物連續記錄
          {' '}
          <strong>
            {TOTAL_DAYS}
            {' 天'}
          </strong>
          ：
          {STAGES.map((stage) => stage.title).join('、')}
          。這段期間不要再加入其他新食材。
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3>追蹤中的食物</h3>
        <span className="text-sm text-ink-muted">
          {activeFoods.length}
          {' 項'}
        </span>
      </div>

      {activeFoods.length === 0 && (
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title="目前沒有正在追蹤的食物"
          description="新增食物記錄後會在這裡顯示追蹤進度"
        />
      )}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {sortedFoods.map((food) => (
          <TrackedFood
            key={food.id}
            food={food}
            today={today}
            onAddTrialDate={onAddTrialDate}
            onViewFood={onViewFood}
          />
        ))}
      </motion.div>

      {foodTrials.length > activeFoods.length && (
        <p className="card bg-warm-white text-sm text-ink-muted">
          {foodTrials.length - activeFoods.length}
          {' 種食物已完成 '}
          {TOTAL_DAYS}
          {' 天的試敏追蹤'}
        </p>
      )}
    </div>
  );
}

function TrackedFood({
  food,
  today,
  onAddTrialDate,
  onViewFood,
}: {
  food: FoodTrialRecord;
  today: string;
  onAddTrialDate: FourByThreeTrackerProps['onAddTrialDate'];
  onViewFood: FourByThreeTrackerProps['onViewFood'];
}) {
  const trialDates = trialDatesOf(food);
  const canTry = !trialDates.includes(today);
  const progressPercent = (trialDates.length / TOTAL_DAYS) * 100;

  // 前 3 次小量、再 3 次增量、之後都是觀察期。
  const stage
    = STAGES[Math.min(Math.floor(trialDates.length / STAGE_DAYS), STAGES.length - 1)];

  return (
    <motion.div
      variants={listItem}
      className={`card-tap border ${canTry ? 'bg-mint-light/50 border-mint' : 'border-ink/10'}`}
      {...pressable(() => onViewFood(food))}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h4>{food.foodName}</h4>
          {food.category && <p className="text-xs text-ink-faint">{food.category}</p>}
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
          <span>
            進度：
            {trialDates.length}
            {' / '}
            {TOTAL_DAYS}
            {' 天'}
          </span>
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
            {'第 '}
            {idx + 1}
            {' 天：'}
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
