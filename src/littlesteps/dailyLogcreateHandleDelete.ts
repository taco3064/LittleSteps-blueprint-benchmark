import { confirmDelete } from '~app/platform/services/confirmation';
import type { ToastApi } from '~app/platform/domain/toast';
import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';

export function createHandleDelete({
  currentChild, firebaseChildren, justClosedSleep, setJustClosedSleep, toast,
}: {
  currentChild: ChildProfile | null | undefined;
  firebaseChildren: ReturnType<
    typeof import('~app/family/services/child_records').createChildRecords
  >;
  justClosedSleep: DailyLog | null;
  setJustClosedSleep: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  toast: ToastApi;
}) {
  return async (logId: string, title: string) => {
    if (!currentChild || !confirmDelete(title)) {
      return;
    }

    try {
      await firebaseChildren.deleteDailyLog(currentChild.id, logId);

      // 剛關掉的那一段被刪了，就不該再問它的夜醒次數。
      if (justClosedSleep?.id === logId) {
        setJustClosedSleep(null);
      }
    } catch (error) {
      console.error('刪除日誌失敗:', error);
      toast.show(error instanceof Error ? error.message : '刪除失敗，請稍後再試');
    }
  };
}
