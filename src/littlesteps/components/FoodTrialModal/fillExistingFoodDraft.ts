import {
  AllergyReaction,
  FoodPreference,
  FoodTrialRecord,
} from '~app/family/domain/familyRecords';
import { trialDatesOf } from '~app/littlesteps/domain/foodTrialDates';

export function fillExistingFoodDraft({
  setFoodName, editingFood, setCategory, setFirstTriedDate, setHasAllergy,
  setAllergyReactions, setPreference, setNotes, setTrialDates,
}: {
  setFoodName: import('react').Dispatch<import('react').SetStateAction<string>>;
  editingFood: FoodTrialRecord;
  setCategory: import('react').Dispatch<import('react').SetStateAction<string>>;
  setFirstTriedDate: import('react').Dispatch<
    import('react').SetStateAction<string>
  >;
  setHasAllergy: import('react').Dispatch<import('react').SetStateAction<boolean>>;
  setAllergyReactions: import('react').Dispatch<
    import('react').SetStateAction<AllergyReaction[]>
  >;
  setPreference: import('react').Dispatch<
    import('react').SetStateAction<FoodPreference | undefined>
  >;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
  setTrialDates: import('react').Dispatch<import('react').SetStateAction<string[]>>;
}) {
  setFoodName(editingFood.foodName);
  setCategory(editingFood.category || '');
  setFirstTriedDate(editingFood.firstTriedDate);
  setHasAllergy(editingFood.hasAllergy);
  setAllergyReactions(editingFood.allergyReactions || []);
  setPreference(editingFood.preference);
  setNotes(editingFood.notes || '');
  setTrialDates(trialDatesOf(editingFood));
}
