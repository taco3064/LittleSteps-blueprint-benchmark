import type { Gender } from '~app/domain/records';
import { logChildProfileAction } from '../firebase';
import type { ActionContext } from './types';

export function recordBirthAction({
  user,
  pregnancyChild,
  firebaseChildren,
}: ActionContext) {
  const recordBirth = async (birthday: string, gender?: Gender) => {
    if (!user || !pregnancyChild) {
      return;
    }

    try {
      await firebaseChildren.recordBirth(pregnancyChild.id, birthday, gender);
      logChildProfileAction('update');
    } catch (error) {
      console.error('登記出生失敗:', error);

      throw error;
    }
  };

  return recordBirth;
}
