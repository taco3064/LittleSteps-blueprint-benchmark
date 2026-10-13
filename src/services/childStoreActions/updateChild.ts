import type { GestationalAge } from '~app/domain/correctedAge';
import { isPregnancyProfile } from '~app/domain/pregnancy';
import type { Gender } from '~app/domain/records';
import { logChildProfileAction } from '../firebase';
import type { ActionContext } from './types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function updateChildAction({
  user,
  childProfiles,
  firebaseChildren,
  toast,
}: ActionContext) {
  const updateChild = async ({
    id,
    name,
    birthday,
    gender,
    gestationalAge,
  }: {
    id: string;
    name: string;
    birthday: string;
    gender?: Gender;
    gestationalAge?: GestationalAge;
  }) => {
    if (!user) {
      return;
    }

    try {
      await firebaseChildren.updateChild({
        childId: id,
        name: name,
        birthday: birthday,
        gender: gender,
        isPregnancy: isPregnancyProfile(
          childProfiles.find((child) => child.id === id),
        ),
        gestationalAge: gestationalAge,
      });

      logChildProfileAction('update');
    } catch (error) {
      console.error('更新寶寶資料失敗:', error);
      toast.show(errorMessage(error, '寶寶資料更新失敗，請稍後再試'));
    }
  };

  return updateChild;
}
