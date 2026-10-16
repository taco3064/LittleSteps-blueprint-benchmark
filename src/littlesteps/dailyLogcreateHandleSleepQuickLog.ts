import type { ToastApi } from '~app/platform/domain/toast';
import { User } from 'firebase/auth';
import { ChildProfile, DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { isStaleOpenSleep } from '~app/littlesteps/domain/logHelpers';

export function createHandleSleepQuickLog({
  currentChild, isToday, openLogForm, openSleep, toast, firebaseChildren, user,
  setJustClosedSleep, setSelectedDate, reportWriteFailure,
}: {
  currentChild: ChildProfile | null | undefined;
  isToday: boolean;
  openLogForm: (type: 'feeding' | 'sleep' | 'diaper') => void;
  openSleep: DailyLog | null;
  toast: ToastApi;
  firebaseChildren: ReturnType<
    typeof import('~app/family/services/child_records').createChildRecords
  >;
  user: User | null;
  setJustClosedSleep: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  setSelectedDate: import('react').Dispatch<import('react').SetStateAction<Date>>;
  reportWriteFailure: (error: unknown, fallback: string) => void;
}) {
  return async () => {
    if (!currentChild) {
      return;
    }

    if (!isToday) {
      openLogForm('sleep'); // 補記過去的睡眠沒有「現在開始」可言

      return;
    }

    if (openSleep) {
      toast.show(
        isStaleOpenSleep(openSleep)
          ? '上一段睡眠還沒有結束時間，先補上才能開始新的一段。'
          : '寶寶還在睡。先按「醒了」結束這一段，才能開始新的一段。',
      );

      return;
    }

    const startedAt = new Date().toISOString();
    const sleepData: SleepData = { startTime: startedAt };

    try {
      await firebaseChildren.addDailyLog(currentChild.id, {
        childId: currentChild.id,
        type: 'sleep',
        timestamp: startedAt,
        data: sleepData,
        createdAt: startedAt,
        createdBy: user?.uid,
        createdByName: user?.displayName ?? undefined,
      });

      setJustClosedSleep(null);
      setSelectedDate(new Date(startedAt));
    } catch (error) {
      reportWriteFailure(error, '開始睡眠記錄失敗，請稍後再試');
    }
  };
}
