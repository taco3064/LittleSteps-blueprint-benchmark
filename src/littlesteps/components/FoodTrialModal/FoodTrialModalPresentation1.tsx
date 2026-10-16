import { FoodTrialModalPresentation1Props } from './FoodTrialModalPresentation1Props';
import { FoodTrialModalPresentation2 } from './FoodTrialModalPresentation2';

export function FoodTrialModalPresentation1({
  hasAllergy, setHasAllergy,
}: FoodTrialModalPresentation1Props) {
  return (
    <div className="card bg-warm-white flex items-center justify-between">
      <span className="font-medium">有過敏反應</span>
      <FoodTrialModalPresentation2
        hasAllergy={hasAllergy}
        setHasAllergy={setHasAllergy}
      />
    </div>
  );
}
