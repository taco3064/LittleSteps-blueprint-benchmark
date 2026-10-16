import {
  AllergyReactionType,
  AllergySeverity,
} from '~app/family/domain/familyRecords';

export interface FoodTrialModalPresentation7Props {
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
  today: string;
  newReactionDescription: string;
  setNewReactionDescription: import('react').Dispatch<
    import('react').SetStateAction<string>
  >;
  reactionError: string | null;
  addAllergyReaction: () => void;
}
