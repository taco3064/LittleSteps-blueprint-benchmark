import { FoodTrialModalPresentation6Props } from './FoodTrialModalPresentation6Props';
import { FoodTrialModalPresentation7 } from './FoodTrialModalPresentation7';

export function FoodTrialModalPresentation6({
  newReactionType, setNewReactionType, newReactionSeverity, setNewReactionSeverity,
  newReactionDate, setNewReactionDate, today, newReactionDescription,
  setNewReactionDescription, reactionError, addAllergyReaction,
}: FoodTrialModalPresentation6Props) {
  return (
    <div className="card bg-butter-soft border border-butter/40">
      <div className="text-sm font-medium mb-3">新增過敏反應</div>

      <FoodTrialModalPresentation7
        newReactionType={newReactionType}
        setNewReactionType={setNewReactionType}
        newReactionSeverity={newReactionSeverity}
        setNewReactionSeverity={setNewReactionSeverity}
        newReactionDate={newReactionDate}
        setNewReactionDate={setNewReactionDate}
        today={today}
        newReactionDescription={newReactionDescription}
        setNewReactionDescription={setNewReactionDescription}
        reactionError={reactionError}
        addAllergyReaction={addAllergyReaction}
      />
    </div>
  );
}
