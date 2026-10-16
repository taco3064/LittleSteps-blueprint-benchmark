import { useCallback } from 'react';
import type { Gender } from '~app/family/domain/familyRecords';

import { isPregnancyProfile } from '~app/family/domain/pregnancy';

import type { GestationalAge } from '~app/family/domain/correctedAge';

import { logChildProfileAction } from '~app/family/services/telemetry';
import type { ChildActionContext } from './actionContext';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useUpdateChild({
  user,
  toast,
  firebaseChildren,
  childProfiles,
}: ChildActionContext) {
  return useCallback(
    async ({
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
    },
    [user, toast, firebaseChildren, childProfiles],
  );
}
