import { User } from 'firebase/auth';
import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';

export function createHandleRepeat({
  currentChild, firebaseChildren, user, setSelectedDate, reportWriteFailure,
}: {
  currentChild: ChildProfile | null | undefined;
  firebaseChildren: ReturnType<
    typeof import('~app/family/services/child_records').createChildRecords
  >;
  user: User | null;
  setSelectedDate: import('react').Dispatch<import('react').SetStateAction<Date>>;
  reportWriteFailure: (error: unknown, fallback: string) => void;
}) {
  return async (log: DailyLog) => {
    if (!currentChild) {
      return;
    }

    const now = new Date().toISOString();

    try {
      await firebaseChildren.addDailyLog(currentChild.id, {
        childId: currentChild.id,
        type: log.type,
        timestamp: now,
        // 備註屬於上一次那件事，不跟著複製。
        data: { ...log.data, notes: undefined },
        createdAt: now,
        createdBy: user?.uid,
        createdByName: user?.displayName ?? undefined,
      });

      setSelectedDate(new Date(now));
    } catch (error) {
      reportWriteFailure(error, '記錄失敗，請稍後再試');
    }
  };
}
