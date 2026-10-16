import { FoodTrialModalPresentation3Props } from './FoodTrialModalPresentation3Props';
import { FoodTrialModalPresentation4 } from './FoodTrialModalPresentation4';

export function FoodTrialModalPresentation3({
  index, reaction, removeAllergyReaction,
}: FoodTrialModalPresentation3Props) {
  return (
    <div key={index} className="card bg-red-50 border border-red-200">
      <FoodTrialModalPresentation4
        reaction={reaction}
        removeAllergyReaction={removeAllergyReaction}
        index={index}
      />
    </div>
  );
}
