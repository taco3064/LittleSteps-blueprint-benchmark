import { FoodTrialModalPresentation3 } from './FoodTrialModalPresentation3';
import { FoodTrialModalPresentation6 } from './FoodTrialModalPresentation6';
import { FoodTrialModalPresentationProps } from './FoodTrialModalPresentationProps';
import { LABEL } from './LABEL';

export function FoodTrialModalPresentationSection5({
  allergyReactions, removeAllergyReaction, newReactionType, setNewReactionType,
  newReactionSeverity, setNewReactionSeverity, newReactionDate, setNewReactionDate,
  today, newReactionDescription, setNewReactionDescription, reactionError,
  addAllergyReaction,
}: Pick<
  FoodTrialModalPresentationProps,
  | 'allergyReactions'
  | 'removeAllergyReaction'
  | 'newReactionType'
  | 'setNewReactionType'
  | 'newReactionSeverity'
  | 'setNewReactionSeverity'
  | 'newReactionDate'
  | 'setNewReactionDate'
  | 'today'
  | 'newReactionDescription'
  | 'setNewReactionDescription'
  | 'reactionError'
  | 'addAllergyReaction'
>) {
  return (
    <div className="space-y-3">
      <div className={LABEL}>過敏反應記錄</div>

      {allergyReactions.map((reaction, index) => (
        <FoodTrialModalPresentation3
          key={index}
          index={index}
          reaction={reaction}
          removeAllergyReaction={removeAllergyReaction}
        />
      ))}

      {/* Add New Reaction */}
      <FoodTrialModalPresentation6
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
