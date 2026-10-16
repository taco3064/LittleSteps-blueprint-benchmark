import { X } from 'lucide-react';
import { FoodTrialModalPresentation4Props } from './FoodTrialModalPresentation4Props';
import { FoodTrialModalPresentation5 } from './FoodTrialModalPresentation5';

export function FoodTrialModalPresentation4({
  reaction, removeAllergyReaction, index,
}: FoodTrialModalPresentation4Props) {
  return (
    <div className="flex items-start justify-between gap-2">
      <FoodTrialModalPresentation5 reaction={reaction} />
      <button
        type="button"
        onClick={() => removeAllergyReaction(index)}
        className="btn-icon -my-2.5 text-red-600 hover:bg-red-100"
        aria-label="移除這筆過敏反應"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
