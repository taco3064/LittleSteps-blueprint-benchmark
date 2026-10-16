import {
  AllergyReaction,
  AllergyReactionType,
  AllergySeverity,
  FoodPreference,
  FoodTrialRecord,
} from '~app/family/domain/familyRecords';

export interface FoodTrialModalPresentationProps {
  isOpen: boolean;
  onClose: () => void;
  editingFood: FoodTrialRecord | null | undefined;
  foodName: string;
  setFoodName: import('react').Dispatch<import('react').SetStateAction<string>>;
  category: string;
  setCategory: import('react').Dispatch<import('react').SetStateAction<string>>;
  firstTriedDate: string;
  setFirstTriedDate: import('react').Dispatch<
    import('react').SetStateAction<string>
  >;
  today: string;
  preference: FoodPreference | undefined;
  setPreference: import('react').Dispatch<
    import('react').SetStateAction<FoodPreference | undefined>
  >;
  hasAllergy: boolean;
  setHasAllergy: import('react').Dispatch<import('react').SetStateAction<boolean>>;
  allergyReactions: AllergyReaction[];
  removeAllergyReaction: (index: number) => void;
  newReactionType: AllergyReactionType;
  setNewReactionType: import('react').Dispatch<
    import('react').SetStateAction<AllergyReactionType>
  >;
  newReactionSeverity: AllergySeverity;
  setNewReactionSeverity: import('react').Dispatch<
    import('react').SetStateAction<AllergySeverity>
  >;
  newReactionDate: string;
  setNewReactionDate: import('react').Dispatch<
    import('react').SetStateAction<string>
  >;
  newReactionDescription: string;
  setNewReactionDescription: import('react').Dispatch<
    import('react').SetStateAction<string>
  >;
  reactionError: string | null;
  addAllergyReaction: () => void;
  trialDates: string[];
  removeTrialDate: (date: string) => void;
  addTrialDate: () => void;
  notes: string;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
  error: string | null;
  handleSave: () => Promise<void>;
  saving: boolean;
}
