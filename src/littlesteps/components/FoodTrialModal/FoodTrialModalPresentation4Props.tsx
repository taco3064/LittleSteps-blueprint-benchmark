import { AllergyReaction } from '~app/family/domain/familyRecords';

export interface FoodTrialModalPresentation4Props {
  reaction: AllergyReaction;
  removeAllergyReaction: (index: number) => void;
  index: number;
}
