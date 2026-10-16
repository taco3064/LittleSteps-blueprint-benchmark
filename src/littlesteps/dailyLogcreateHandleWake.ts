import { calculateDuration } from '~app/platform/domain/calendar';
import { ChildProfile, DailyLog, SleepData } from '~app/family/domain/familyRecords';

export function createHandleWake({
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
  return async (log: DailyLog) => {
    if (!currentChild) {
      return;
    }

    const endTime = new Date().toISOString();
    const duration = calculateDuration((log.data as SleepData).startTime, endTime);

    const closed: DailyLog = {
      ...log,
      data: { ...(log.data as SleepData), endTime, duration },
    };

    try {
      // 只送結束時間與時長。整個 data 寫回去的話，另一位照顧者同時補的備註
      // 或夜醒次數會被我手上的舊值蓋掉。
      //
      // 代價要說清楚：duration 是拿我手上這一版的 startTime 算的。如果對方剛
      // 好在這幾秒內改了開始時間，資料庫就會留下新的 startTime 配上舊的
      // duration——兩個對不起來的欄位，而 sleepAnalysis 會照單全收。這仍然比
      // 原本的行為好：原本是直接把對方改的 startTime 整個蓋掉。欄位級合併換
      // 掉的是「整片被洗掉」，換來的是「衍生欄位可能對不上」。
      await firebaseChildren.updateDailyLog(currentChild.id, log.id, {
        data: { endTime, duration },
      });

      setJustClosedSleep(closed);
    } catch (error) {
      reportWriteFailure(error, '結束睡眠記錄失敗，請稍後再試');
    }
  };
}
