import { useState } from 'react';
import {
  AllergySeverity,
  FoodPreference,
  FoodTrialRecord,
} from '~app/family/domain/familyRecords';
import type { FoodStats } from '~app/littlesteps/hooks/useFoodTracking';
import { FoodTrackingTabPresentation } from './FoodTrackingTabPresentation';

interface FoodTrackingTabProps {
  foodTrials: FoodTrialRecord[];
  stats: FoodStats;
  onAddFood: () => void;
  onEditFood: (food: FoodTrialRecord) => void;
  onDeleteFood: (foodId: string) => void;
  user: import('firebase/auth').User | null; // User from firebase/auth
}

export default function FoodTrackingTab({
  foodTrials, stats, onAddFood, onEditFood, onDeleteFood, user,
}: FoodTrackingTabProps) {
  const [filter, setFilter] = useState<'all' | 'safe' | 'allergy'>('all');

  // 取得喜好度標籤和顏色
  const getPreferenceDisplay = (preference?: FoodPreference) => {
    switch (preference) {
      case 'love':
        return { label: '超愛', color: 'text-primary-dark' };
      case 'like':
        return { label: '喜歡', color: 'text-mint-dark' };
      case 'neutral':
        return { label: '普通', color: 'text-ink-muted' };
      case 'dislike':
        return { label: '不喜歡', color: 'text-butter-dark' };
      case 'refuse':
        return { label: '拒絕', color: 'text-red-600' };
      default:
        return null;
    }
  };

  // 取得過敏嚴重度顏色
  const getAllergySeverityColor = (severity: AllergySeverity) => {
    switch (severity) {
      case 'mild':
        return 'bg-butter-light text-butter-dark border-butter/40';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  // 過濾食物列表
  const filteredFoods = foodTrials.filter((food) => {
    if (filter === 'safe') {
      return !food.hasAllergy;
    }

    if (filter === 'allergy') {
      return food.hasAllergy;
    }

    return true;
  });

  return (
    <FoodTrackingTabPresentation
      stats={stats}
      setFilter={setFilter}
      filter={filter}
      onAddFood={onAddFood}
      user={user}
      foodTrials={foodTrials}
      filteredFoods={filteredFoods}
      getPreferenceDisplay={getPreferenceDisplay}
      onEditFood={onEditFood}
      getAllergySeverityColor={getAllergySeverityColor}
      onDeleteFood={onDeleteFood}
    />
  );
}
