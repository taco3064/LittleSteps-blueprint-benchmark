import { toLocalDateKey } from '~app/platform/domain/calendar';
import { FoodTrialRecord } from '~app/family/domain/familyRecords';
import { foodTrialProgress } from '~app/littlesteps/domain/foodTrialProgress';
import { FourByThreeTrackerPresentation } from './FourByThreeTrackerPresentation';

interface FourByThreeTrackerProps {
  foodTrials: FoodTrialRecord[];
  onAddTrialDate: (foodId: string) => void;
  onViewFood: (food: FoodTrialRecord) => void;
}

export default function FourByThreeTracker({
  foodTrials,
  onAddTrialDate,
  onViewFood,
}: FourByThreeTrackerProps) {
  const progress = foodTrialProgress(foodTrials, toLocalDateKey());

  return (
    <FourByThreeTrackerPresentation
      progress={progress}
      onViewFood={onViewFood}
      onAddTrialDate={onAddTrialDate}
    />
  );
}
