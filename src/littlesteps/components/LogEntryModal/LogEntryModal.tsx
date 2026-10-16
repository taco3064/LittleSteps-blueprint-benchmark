import { useEffect } from 'react';
import { isoToDateTimeLocal } from '~app/platform/domain/calendar';
import { DailyLog } from '~app/family/domain/familyRecords';
import { buildLogPayload } from './buildLogPayload';
import { fillDiaperDraft } from './fillDiaperDraft';
import { fillFeedingDraft } from './fillFeedingDraft';
import { fillNewLogDraft } from './fillNewLogDraft';
import { fillSleepDraft } from './fillSleepDraft';
import { LogEntryModalPresentation } from './LogEntryModalPresentation';
import { useLogEntryFields } from './useLogEntryFields';
interface createLogSubmitHandlerProps {
  sleepRangeError:
    '結束時間要晚於開始時間；睡到隔天的話，結束時間請選隔天的日期。' | null;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  logType: 'feeding' | 'sleep' | 'diaper';
  timestamp: string;
  feedingType:
    | 'breast_left'
    | 'breast_right'
    | 'breast_both'
    | 'breast_milk_bottle'
    | 'formula'
    | 'solid'
    | 'pumping';
  duration: string;
  amount: string;
  side: '' | NonNullable<'left' | 'right' | 'both' | undefined>;
  notes: string;
  startTime: string;
  endTime: string;
  nightWakings: string;
  diaperType: 'both' | 'pee' | 'poop';
  consistency: 'normal' | 'soft' | 'hard' | undefined;
  editingLog:
    | import('~app/family/domain/familyRecords').DailyLog
    | null
    | undefined;
  onSave: (
    logData: Omit<
      import('~app/family/domain/familyRecords').DailyLog,
      'id'
    >,
  ) => Promise<void>;
  onClose: () => void;
}

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logData: Omit<DailyLog, 'id'>) => Promise<void>;
  logType: 'feeding' | 'sleep' | 'diaper';
  editingLog?: DailyLog | null;
  /**
   * 這個孩子上一筆同類型的紀錄，用來預填新增表單。
   *
   * 表單原本每次都從 `breast_left` 和空白奶量開始，所以一位喝配方奶的家長
   * 一天要重打同樣的 120 八次，而且是凌晨三點單手抱著小孩打。這裡帶進來的是
   * 真的填進欄位的值，不是灰色提示：家長要看得見接下來會存進去什麼。
   */
  lastLog?: DailyLog | null;
}

const RANGE_ERROR = '結束時間要晚於開始時間；睡到隔天的話，結束時間請選隔天的日期。';

export default function LogEntryModal({
  isOpen, onClose, onSave, logType, editingLog, lastLog,
}: LogEntryModalProps) {
  const {
    timestamp, setTimestamp, feedingType, setFeedingType, duration, setDuration,
    amount, setAmount, side, setSide, startTime, setStartTime, endTime, setEndTime,
    nightWakings, setNightWakings, diaperType, setDiaperType, consistency,
    setConsistency, notes, setNotes, isSubmitting, setIsSubmitting, error, setError,
  } = useLogEntryFields();

  // Initialize form when editing
  useEffect(() => {
    // Reset error state when modal opens/closes
    setError(null);
    setIsSubmitting(false);

    if (editingLog) {
      // 不是 slice(0, 16)：存的是 UTC，input 讀的是本地時間。見 isoToDateTimeLocal。
      setTimestamp(isoToDateTimeLocal(editingLog.timestamp));

      if (logType === 'feeding') {
        fillFeedingDraft({
          editingLog, setFeedingType, setDuration, setAmount, setSide, setNotes,
        });
      } else if (logType === 'sleep') {
        fillSleepDraft({
          editingLog, setStartTime, setEndTime, setNightWakings, setNotes,
        });
      } else if (logType === 'diaper') {
        fillDiaperDraft({ editingLog, setDiaperType, setConsistency, setNotes });
      }
    } else {
      fillNewLogDraft({
        logType, lastLog, setTimestamp, setStartTime, setEndTime, setNightWakings,
        setNotes, setDuration, setAmount, setFeedingType, setSide, setDiaperType,
        setConsistency,
      });
    }
    /*
      lastLog 刻意不在相依陣列裡：它是「開啟的那一刻讀一次」，不是要追蹤的值。
      追蹤它的話，另一位照顧者存進一筆紀錄就會讓監聽器送回新的物件、effect 重跑、
      把這位家長正在打的奶量或備註洗掉——而且是無聲的。共用孩子的兩個人同時記錄
      在這個 app 裡是常態，不是邊緣情況。
    */
  }, [editingLog, logType, isOpen]);

  /*
    兩個欄位都是 datetime-local，各自帶日期，所以「22:30 睡到隔天 06:00」算出來
    本來就是正的 450 分鐘，不需要特別處理。真正會出事的是把結束時間選在開始
    時間之前：calculateDuration 會存進一個負數，列表印成「0分鐘」，但睡眠平均、
    報告與建議全部被它往下拉，而且沒有任何地方看得出來。
  */
  const startMs = new Date(startTime).getTime();
  const endMs = endTime ? new Date(endTime).getTime() : NaN;

  const hasSleepRange
    = logType === 'sleep' && !Number.isNaN(startMs) && !Number.isNaN(endMs);

  const sleepRangeError = hasSleepRange && endMs <= startMs ? RANGE_ERROR : null;

  /** 擠奶是唯一一個記「產出」而不是「攝取」的類型，表單也要看得出來。 */
  const isPumping = feedingType === 'pumping';

  /** 從留白按下去就是 0：那是家長主動說「沒醒」，跟沒問到不一樣。 */
  const stepNightWakings = (delta: number) => {
    const current = parseInt(nightWakings, 10);

    setNightWakings(
      String(Math.max(0, (Number.isNaN(current) ? 0 : current) + delta)),
    );
  };

  const handleSubmit = createLogSubmitHandler({
    sleepRangeError, setIsSubmitting, setError, logType, timestamp, feedingType,
    duration, amount, side, notes, startTime, endTime, nightWakings, diaperType,
    consistency, editingLog, onSave, onClose,
  });

  const getTitle = () => {
    const prefix = editingLog ? '編輯' : '新增';

    switch (logType) {
      case 'feeding':
        // 擠奶不是餵奶。標題還寫著「餵奶記錄」，等於畫面自己否認了這個 PR
        // 要建立的區別。
        return isPumping ? `${prefix}擠奶記錄` : `${prefix}餵奶記錄`;
      case 'sleep':
        return `${prefix}睡眠記錄`;
      case 'diaper':
        return `${prefix}尿布記錄`;
    }
  };

  return (
    <LogEntryModalPresentation
      isOpen={isOpen}
      onClose={onClose}
      getTitle={getTitle}
      handleSubmit={handleSubmit}
      logType={logType}
      timestamp={timestamp}
      setTimestamp={setTimestamp}
      feedingType={feedingType}
      setFeedingType={setFeedingType}
      isPumping={isPumping}
      side={side}
      setSide={setSide}
      duration={duration}
      setDuration={setDuration}
      amount={amount}
      setAmount={setAmount}
      startTime={startTime}
      setStartTime={setStartTime}
      endTime={endTime}
      setEndTime={setEndTime}
      hasSleepRange={hasSleepRange}
      sleepRangeError={sleepRangeError}
      stepNightWakings={stepNightWakings}
      nightWakings={nightWakings}
      setNightWakings={setNightWakings}
      diaperType={diaperType}
      setDiaperType={setDiaperType}
      consistency={consistency}
      setConsistency={setConsistency}
      notes={notes}
      setNotes={setNotes}
      isSubmitting={isSubmitting}
      error={error}
      editingLog={editingLog}
    />
  );
}

function createLogSubmitHandler({
  sleepRangeError, setIsSubmitting, setError, logType, timestamp, feedingType,
  duration, amount, side, notes, startTime, endTime, nightWakings, diaperType,
  consistency, editingLog, onSave, onClose,
}: createLogSubmitHandlerProps) {
  return async (e: React.FormEvent) => {
    e.preventDefault();

    if (sleepRangeError) {
      return;
    } // 訊息已經即時顯示在結束時間下方

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, finalTimestamp } = buildLogPayload({
        logType, timestamp, feedingType, duration, amount, side, notes, startTime,
        endTime, nightWakings, diaperType, consistency,
      });

      const logData: Omit<DailyLog, 'id'> = {
        childId: '', // Will be set by parent component
        type: logType,
        timestamp: finalTimestamp,
        data,
        createdAt: editingLog?.createdAt || new Date().toISOString(),
        updatedAt: editingLog ? new Date().toISOString() : undefined,
      };

      // 寫入成功才關；失敗時留在原地，家長剛打完的東西還在。
      await onSave(logData);
      onClose();
    } catch (err) {
      console.error('保存失敗:', err);
      setError(err instanceof Error ? err.message : '保存失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };
}
