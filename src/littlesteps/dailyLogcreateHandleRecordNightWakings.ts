import { ChildProfile, DailyLog } from '~app/family/domain/familyRecords';

export function createHandleRecordNightWakings({
  currentChild, firebaseChildren, setJustClosedSleep, reportWriteFailure,
}: {
  currentChild: ChildProfile | null | undefined;
  firebaseChildren: ReturnType<
    typeof import('~app/family/services/child_records').createChildRecords
  >;
  setJustClosedSleep: import('react').Dispatch<
    import('react').SetStateAction<DailyLog | null>
  >;
  reportWriteFailure: (error: unknown, fallback: string) => void;
}) {
  return async (log: DailyLog, nightWakings: number) => {
    if (!currentChild) {
      return;
    }

    try {
      // 只送夜醒次數。連著整個 data 寫回去的話，這一筆會帶著我手上那一版的
      // 結束時間——剛按下「醒了」的那一版可能還沒回來，於是剛結束的睡眠又
      // 變回進行中，另一位照顧者同時改的欄位也一起被蓋掉。
      await firebaseChildren.updateDailyLog(currentChild.id, log.id, {
        data: { nightWakings },
      });

      setJustClosedSleep(null);
    } catch (error) {
      reportWriteFailure(error, '記錄夜醒次數失敗，請稍後再試');
    }
  };
}
