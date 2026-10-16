import { AllergyReaction } from '~app/family/domain/familyRecords';

export interface FoodTrialModalPresentation3Props {
  index: number;
  reaction: AllergyReaction;
  removeAllergyReaction: (index: number) => void;
}
