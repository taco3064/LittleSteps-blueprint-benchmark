import { toLocalDateKey } from '~app/platform/domain/calendar';
import { AllergyReaction, FoodPreference } from '~app/family/domain/familyRecords';

export function fillNewFoodDraft({
  setFoodName, setCategory, setFirstTriedDate, setHasAllergy, setAllergyReactions,
  setPreference, setNotes, setTrialDates,
}: {
  setFoodName: import('react').Dispatch<import('react').SetStateAction<string>>;
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
  // Reset form for new entry
  setFoodName('');
  setCategory('');
  setFirstTriedDate(toLocalDateKey());
  setHasAllergy(false);
  setAllergyReactions([]);
  setPreference(undefined);
  setNotes('');
  setTrialDates([]);
}
