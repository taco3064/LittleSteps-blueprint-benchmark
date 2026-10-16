import { FoodPreference } from '~app/family/domain/familyRecords';

export const PREFERENCES: { value: FoodPreference; label: string }[] = [
  { value: 'love', label: '超愛' },
  { value: 'like', label: '喜歡' },
  { value: 'neutral', label: '普通' },
  { value: 'dislike', label: '不喜歡' },
  { value: 'refuse', label: '拒絕' },
];
