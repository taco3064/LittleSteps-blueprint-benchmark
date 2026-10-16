import { useCallback } from 'react';
import { logVaccineToggle } from '~app/family/services/telemetry';
import type { ChildActionContext } from './actionContext';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useSetVaccineDose({
  user,
  toast,
  firebaseChildren,
  currentChild,
}: ChildActionContext) {
  return useCallback(
    async ({
      vaccineId,
      doseNumber,
      administered,
      date,
    }: {
      vaccineId: string;
      doseNumber: number;
      administered: boolean;
      date?: string;
    }) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        await firebaseChildren.updateVaccineProgress({
          childId: currentChild.id,
          vaccineId: vaccineId,
          doseNumber: doseNumber,
          administered: administered,
          customDate: date,
        });

        logVaccineToggle(administered);
      } catch (error) {
        console.error('更新疫苗記錄失敗:', error);
        toast.show(errorMessage(error, '疫苗記錄更新失敗，請稍後再試'));
      }
    },
    [user, toast, firebaseChildren, currentChild],
  );
}
