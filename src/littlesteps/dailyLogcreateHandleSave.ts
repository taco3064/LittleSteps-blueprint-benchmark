import { User } from 'firebase/auth';
import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';
import { dailyLogChanges } from '~app/littlesteps/domain/logHelpers';

export function createHandleSave({
  currentChild, editingLog, user, firebaseChildren, setSelectedDate,
}: {
  currentChild: ChildProfile | null | undefined;
  editingLog: DailyLog | null;
  user: User | null;
  firebaseChildren: ReturnType<
    typeof import('~app/family/services/child_records').createChildRecords
  >;
  setSelectedDate: import('react').Dispatch<import('react').SetStateAction<Date>>;
}) {
  return async (logData: Omit<DailyLog, 'id'>) => {
    if (!currentChild) {
      throw new Error('請先選擇寶寶');
    }

    const completeLogData = {
      ...logData,
      childId: currentChild.id,
      // 編輯時保留原本的記錄者：改一筆別人記的紀錄不該把它變成自己記的。
      ...(editingLog
        ? {}
        : {
            createdBy: user?.uid,
            createdByName: user?.displayName ?? undefined,
          }),
    };

    if (editingLog) {
      // 只送這次編輯真的改到的欄位。表單狀態是打開它的那一刻讀到的，整筆寫
      // 回去等於把當時那一版重放一次——另一位照顧者在這段時間內改的欄位會
      // 被那些我根本沒有碰過的舊值蓋掉。
      await firebaseChildren.updateDailyLog(
        currentChild.id,
        editingLog.id,
        dailyLogChanges(editingLog, completeLogData),
      );
    } else {
      await firebaseChildren.addDailyLog(currentChild.id, completeLogData);
    }

    // 補記昨天的餵奶時，紀錄不會落在目前這一天。跳到它真正落在的日子，
    // 不然使用者剛存的東西會憑空消失。
    setSelectedDate(new Date(completeLogData.timestamp));
  };
}
