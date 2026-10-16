import { FOOD_NOTES_LIMIT } from '~app/family/domain/recordLimits';
import { FIELD } from './FIELD';
import { FoodTrialModalPresentationProps } from './FoodTrialModalPresentationProps';
import { LABEL } from './LABEL';

export function FoodTrialModalPresentationSection6({
  notes, setNotes,
}: Pick<FoodTrialModalPresentationProps, 'notes' | 'setNotes'>) {
  return (
    <div>
      <label htmlFor="food-notes" className={LABEL}>
        備註
      </label>
      <textarea
        id="food-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="記錄任何額外資訊..."
        rows={3}
        maxLength={FOOD_NOTES_LIMIT}
        className={`${FIELD} resize-none`}
      />
    </div>
  );
}
