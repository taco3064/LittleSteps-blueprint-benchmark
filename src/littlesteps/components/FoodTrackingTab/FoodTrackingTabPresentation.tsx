import { motion } from 'framer-motion';

import { Plus, Trash2 } from 'lucide-react';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { listItem, stagger } from '~app/platform/components/Motion';

import { pressable } from '~app/platform/components/Pressable';

import {
  AllergySeverity,
  FoodPreference,
  FoodTrialRecord,
} from '~app/family/domain/familyRecords';

import type { FoodStats } from '~app/littlesteps/hooks/useFoodTracking';

import { formatDate } from '~app/platform/domain/calendar';

import { trialDatesOf } from '~app/littlesteps/domain/foodTrialDates';
interface FoodTrackingTabPresentation1Props {
  stats: FoodStats;
}

interface FoodTrackingTabPresentation2Props {
  setFilter: import('react').Dispatch<
    import('react').SetStateAction<'all' | 'safe' | 'allergy'>
  >;
  filter: 'all' | 'safe' | 'allergy';
  stats: FoodStats;
}

interface FoodTrackingTabPresentation6Props {
  food: FoodTrialRecord;
  getAllergySeverityColor: (
    severity: AllergySeverity,
  ) =>
    | 'bg-butter-light text-butter-dark border-butter/40'
    | 'bg-orange-100 text-orange-800 border-orange-200'
    | 'bg-red-100 text-red-800 border-red-200';
}

interface FoodTrackingTabPresentation5Props {
  food: FoodTrialRecord;
  preferenceDisplay: { label: string; color: string } | null;
  trialCount: number;
  getAllergySeverityColor: (
    severity: AllergySeverity,
  ) =>
    | 'bg-butter-light text-butter-dark border-butter/40'
    | 'bg-orange-100 text-orange-800 border-orange-200'
    | 'bg-red-100 text-red-800 border-red-200';
}

interface FoodTrackingTabPresentation4Props {
  food: FoodTrialRecord;
  preferenceDisplay: { label: string; color: string } | null;
  trialCount: number;
  getAllergySeverityColor: (
    severity: AllergySeverity,
  ) =>
    | 'bg-butter-light text-butter-dark border-butter/40'
    | 'bg-orange-100 text-orange-800 border-orange-200'
    | 'bg-red-100 text-red-800 border-red-200';
  onDeleteFood: (foodId: string) => void;
}

interface FoodTrackingTabPresentation3Props {
  food: FoodTrialRecord;
  onEditFood: (food: FoodTrialRecord) => void;
  preferenceDisplay: { label: string; color: string } | null;
  trialCount: number;
  getAllergySeverityColor: (
    severity: AllergySeverity,
  ) =>
    | 'bg-butter-light text-butter-dark border-butter/40'
    | 'bg-orange-100 text-orange-800 border-orange-200'
    | 'bg-red-100 text-red-800 border-red-200';
  onDeleteFood: (foodId: string) => void;
}

interface FoodTrackingTabPresentationProps {
  stats: FoodStats;
  setFilter: import('react').Dispatch<
    import('react').SetStateAction<'all' | 'safe' | 'allergy'>
  >;
  filter: 'all' | 'safe' | 'allergy';
  onAddFood: () => void;
  user: import('firebase/auth').User | null;
  foodTrials: FoodTrialRecord[];
  filteredFoods: FoodTrialRecord[];
  getPreferenceDisplay: (
    preference?: FoodPreference,
  ) => { label: string; color: string } | null;
  onEditFood: (food: FoodTrialRecord) => void;
  getAllergySeverityColor: (
    severity: AllergySeverity,
  ) =>
    | 'bg-butter-light text-butter-dark border-butter/40'
    | 'bg-orange-100 text-orange-800 border-orange-200'
    | 'bg-red-100 text-red-800 border-red-200';
  onDeleteFood: (foodId: string) => void;
}

export function FoodTrackingTabPresentation1({
  stats,
}: FoodTrackingTabPresentation1Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="card bg-secondary-soft border border-secondary/40">
        <div className="text-sm font-medium text-ink-muted mb-1">已嘗試食物</div>
        <div className="text-2xl font-bold text-secondary-dark">{stats.total}</div>
      </div>

      <div className="card bg-mint-soft border border-mint/40">
        <div className="text-sm font-medium text-ink-muted mb-1">無過敏</div>
        <div className="text-2xl font-bold text-mint-dark">{stats.noAllergy}</div>
      </div>

      <div className="card bg-primary-soft border border-primary/40">
        <div className="text-sm font-medium text-ink-muted mb-1">喜歡</div>
        <div className="text-2xl font-bold text-primary-dark">{stats.loved}</div>
      </div>

      <div className="card bg-red-50 border border-red-200">
        <div className="text-sm font-medium text-ink-muted mb-1">有過敏</div>
        <div className="text-2xl font-bold text-red-700">{stats.withAllergy}</div>
      </div>
    </div>
  );
}

export function FoodTrackingTabPresentation2({
  setFilter, filter, stats,
}: FoodTrackingTabPresentation2Props) {
  return (
    <div className="row-bleed flex gap-2 pb-2">
      <button
        onClick={() => setFilter('all')}
        className={`chip shrink-0 ${filter === 'all' ? 'chip-on' : ''}`}
      >
        全部 (
        {stats.total}
        )
      </button>
      <button
        onClick={() => setFilter('safe')}
        className={`chip shrink-0 ${filter === 'safe' ? 'chip-on' : ''}`}
      >
        無過敏 (
        {stats.noAllergy}
        )
      </button>
      <button
        onClick={() => setFilter('allergy')}
        className={`chip shrink-0 ${filter === 'allergy' ? 'chip-on' : ''}`}
      >
        有過敏 (
        {stats.withAllergy}
        )
      </button>
    </div>
  );
}

export function FoodTrackingTabPresentation6({
  food, getAllergySeverityColor,
}: FoodTrackingTabPresentation6Props) {
  if (!food.allergyReactions) {
    return null;
  }

  return (
    <div className="space-y-1">
      {food.allergyReactions.slice(0, 2).map((reaction, idx) => (
        <div
          key={idx}
          className={`text-xs px-2 py-1 rounded-lg border ${getAllergySeverityColor(reaction.severity)}`}
        >
          <span className="font-medium">
            {reaction.type === 'rash'
              ? '紅疹'
              : reaction.type === 'diarrhea'
                ? '腹瀉'
                : reaction.type === 'vomiting'
                  ? '嘔吐'
                  : reaction.type === 'constipation'
                    ? '便秘'
                    : reaction.type === 'runny_nose'
                      ? '流鼻涕'
                      : reaction.type === 'cough'
                        ? '咳嗽'
                        : reaction.type === 'eczema'
                          ? '濕疹'
                          : '其他'}
          </span>
          {reaction.severity === 'mild'
            ? ' (輕微)'
            : reaction.severity === 'moderate'
              ? ' (中度)'
              : ' (嚴重)'}
        </div>
      ))}
      {food.allergyReactions.length > 2 && (
        <div className="text-xs text-ink-faint">
          還有
          {' '}
          {food.allergyReactions.length - 2}
          {' '}
          個反應記錄...
        </div>
      )}
    </div>
  );
}

export function FoodTrackingTabPresentation5({
  food, preferenceDisplay, trialCount, getAllergySeverityColor,
}: FoodTrackingTabPresentation5Props) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <h4>{food.foodName}</h4>
          {food.category && (
            <p className="text-xs text-ink-faint">{food.category}</p>
          )}
        </div>

        {food.hasAllergy && (
          <span className="tag shrink-0 bg-red-100 text-red-800">過敏</span>
        )}
      </div>

      {preferenceDisplay && (
        <p className={`text-sm font-medium mb-2 ${preferenceDisplay.color}`}>
          {preferenceDisplay.label}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-ink-muted mb-2">
        <span>
          首次：
          {formatDate(food.firstTriedDate)}
        </span>
        <span>
          嘗試
          {trialCount}
          {' '}
          次
        </span>
      </div>

      {food.hasAllergy
        && food.allergyReactions
        && food.allergyReactions.length > 0 && (
        <FoodTrackingTabPresentation6
          food={food}
          getAllergySeverityColor={getAllergySeverityColor}
        />
      )}

      {food.notes && (
        <p className="text-sm text-ink-muted mt-2 line-clamp-2">{food.notes}</p>
      )}
    </div>
  );
}

export function FoodTrackingTabPresentation4({
  food, preferenceDisplay, trialCount, getAllergySeverityColor, onDeleteFood,
}: FoodTrackingTabPresentation4Props) {
  return (
    <div className="flex items-start gap-3">
      <FoodTrackingTabPresentation5
        food={food}
        preferenceDisplay={preferenceDisplay}
        trialCount={trialCount}
        getAllergySeverityColor={getAllergySeverityColor}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();

          onDeleteFood(food.id);
        }}
        className="btn-icon -my-2.5 text-red-600 hover:bg-red-50"
        aria-label="刪除記錄"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function FoodTrackingTabPresentation3({
  food, onEditFood, preferenceDisplay, trialCount, getAllergySeverityColor,
  onDeleteFood,
}: FoodTrackingTabPresentation3Props) {
  return (
    <motion.div
      key={food.id}
      variants={listItem}
      className="card-tap"
      {...pressable(() => onEditFood(food))}
    >
      <FoodTrackingTabPresentation4
        food={food}
        preferenceDisplay={preferenceDisplay}
        trialCount={trialCount}
        getAllergySeverityColor={getAllergySeverityColor}
        onDeleteFood={onDeleteFood}
      />
    </motion.div>
  );
}

export function FoodTrackingTabPresentation({
  stats, setFilter, filter, onAddFood, user, foodTrials, filteredFoods,
  getPreferenceDisplay, onEditFood, getAllergySeverityColor, onDeleteFood,
}: FoodTrackingTabPresentationProps) {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <FoodTrackingTabPresentation1 stats={stats} />

      {/* Filter */}
      <FoodTrackingTabPresentation2
        setFilter={setFilter}
        filter={filter}
        stats={stats}
      />

      <button onClick={onAddFood} className="btn-primary w-full">
        <Plus className="w-5 h-5" />
        記錄新食物嘗試
      </button>

      {!user && foodTrials.length > 0 && (
        <div className="card bg-secondary-soft border border-secondary/40 text-sm">
          <p className="font-medium mb-1">提示：使用 Google 登入保存資料</p>
          <p className="text-ink-muted">
            目前使用本地儲存，登入後可跨裝置同步您的食物追蹤記錄。
          </p>
        </div>
      )}

      {filteredFoods.length === 0 && (
        <EmptyState
          theme={SERVICE_THEME.littlesteps}
          title={filter === 'all' ? '尚未記錄任何食物嘗試' : '無符合條件的食物記錄'}
          action={
            filter === 'all'
              ? undefined
              : { label: '查看全部記錄', onClick: () => setFilter('all') }
          }
        />
      )}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {filteredFoods.map((food) => {
          const preferenceDisplay = getPreferenceDisplay(food.preference);
          const trialCount = trialDatesOf(food).length || 1;

          return (
            <FoodTrackingTabPresentation3
              key={food.id}
              food={food}
              onEditFood={onEditFood}
              preferenceDisplay={preferenceDisplay}
              trialCount={trialCount}
              getAllergySeverityColor={getAllergySeverityColor}
              onDeleteFood={onDeleteFood}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
