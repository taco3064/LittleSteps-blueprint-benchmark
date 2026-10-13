import { logVaccineToggle } from '../firebase';
import type { ActionContext } from './types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function setVaccineDoseAction({
  user,
  currentChild,
  firebaseChildren,
  toast,
}: ActionContext) {
  /**
   * administered 由呼叫端明講，不從現況推。原本這裡算的是「反過來」，於是家長在
   * 已接種的那一劑上確認「修改接種日期」時，反而把 administered 翻成 false，
   * 資料層接著把 administeredDate 一併刪掉——想改日期，紀錄卻整筆消失。
   */
  const setVaccineDose = async ({
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
  };

  return setVaccineDose;
}
