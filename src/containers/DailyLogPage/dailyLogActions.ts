import type { User } from '~app/domain/authUser';
import type { ChildProfile, DailyLog, SleepData } from '~app/domain/records';
import { calculateDuration } from '~app/domain/dateHelpers';
import { dailyLogChanges, isStaleOpenSleep } from '~app/domain/logHelpers';
import { createChildRepository } from '~app/services/childRepository';
import type { useDailyLogState } from './useDailyLogState';
import type { dailyLogView } from './dailyLogView';
import type { useToast } from '~app/hooks/useToast';
interface DailyLogContext {
  currentChild?: ChildProfile | null;
  user: User | null;
  state: ReturnType<typeof useDailyLogState>;
  view: ReturnType<typeof dailyLogView>;
  repository: ReturnType<typeof createChildRepository>;
  toast: ReturnType<typeof useToast>;
}

export function createDailyLogActions(context: DailyLogContext) {
  return {
    openLogForm: (type: DailyLog['type']) => openLogForm(context, type),
    handleRepeat: (log: DailyLog) => handleRepeat(context, log),
    handleQuickLog: (type: DailyLog['type']) => handleQuickLog(context, type),
    handleWake: (log: DailyLog) => handleWake(context, log),
    handleRecordNightWakings: (log: DailyLog, nightWakings: number) =>
      handleRecordNightWakings(context, log, nightWakings),
    handleSave: (logData: Omit<DailyLog, 'id'>) =>
      handleSave(context, logData),
    handleEdit: (log: DailyLog) => handleEdit(context, log),
    handleDelete: (logId: string) => handleDelete(context, logId),
  };
}

function openLogForm(
  context: DailyLogContext,
  type: 'feeding' | 'sleep' | 'diaper',
) {
  const { setShowModal, setModalType, setEditingLog } = context.state;

  setModalType(type);
  setEditingLog(null);
  setShowModal(true);
}

function reportWriteFailure(
  context: DailyLogContext,
  error: unknown,
  fallback: string,
) {
  const { toast } = context;

  console.error(fallback, error);
  toast.show(error instanceof Error ? error.message : fallback);
}

async function handleSleepQuickLog(context: DailyLogContext) {
  const { currentChild, user, repository } = context;
  const { setSelectedDate, setJustClosedSleep } = context.state;

  if (!currentChild || !canStartSleep(context)) {
    return;
  }

  const startedAt = new Date().toISOString();
  const sleepData: SleepData = { startTime: startedAt };

  try {
    await repository.addDailyLog(currentChild.id, {
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
    reportWriteFailure(context, error, '開始睡眠記錄失敗，請稍後再試');
  }
}

async function handleRepeat(context: DailyLogContext, log: DailyLog) {
  const { currentChild, user, repository } = context;
  const { setSelectedDate } = context.state;

  if (!currentChild) {
    return;
  }

  const now = new Date().toISOString();

  try {
    await repository.addDailyLog(currentChild.id, {
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
    reportWriteFailure(context, error, '記錄失敗，請稍後再試');
  }
}

function handleQuickLog(
  context: DailyLogContext,
  type: 'feeding' | 'sleep' | 'diaper',
) {
  if (type === 'sleep') {
    void handleSleepQuickLog(context);

    return;
  }

  openLogForm(context, type);
}

async function handleWake(context: DailyLogContext, log: DailyLog) {
  const { currentChild, repository } = context;
  const { setJustClosedSleep } = context.state;

  if (!currentChild) {
    return;
  }

  const endTime = new Date().toISOString();

  const duration = calculateDuration(
    (log.data as SleepData).startTime,
    endTime,
  );

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
    await repository.updateDailyLog(currentChild.id, log.id, {
      data: { endTime, duration },
    });

    setJustClosedSleep(closed);
  } catch (error) {
    reportWriteFailure(context, error, '結束睡眠記錄失敗，請稍後再試');
  }
}

async function handleRecordNightWakings(
  context: DailyLogContext,
  log: DailyLog,
  nightWakings: number,
) {
  const { currentChild, repository } = context;
  const { setJustClosedSleep } = context.state;

  if (!currentChild) {
    return;
  }

  try {
    // 只送夜醒次數。連著整個 data 寫回去的話，這一筆會帶著我手上那一版的
    // 結束時間——剛按下「醒了」的那一版可能還沒回來，於是剛結束的睡眠又
    // 變回進行中，另一位照顧者同時改的欄位也一起被蓋掉。
    await repository.updateDailyLog(currentChild.id, log.id, {
      data: { nightWakings },
    });

    setJustClosedSleep(null);
  } catch (error) {
    reportWriteFailure(context, error, '記錄夜醒次數失敗，請稍後再試');
  }
}

async function handleSave(
  context: DailyLogContext,
  logData: Omit<DailyLog, 'id'>,
) {
  const { currentChild, user, repository } = context;
  const { editingLog, setSelectedDate } = context.state;

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
    await repository.updateDailyLog(
      currentChild.id,
      editingLog.id,
      dailyLogChanges(editingLog, completeLogData),
    );
  } else {
    await repository.addDailyLog(currentChild.id, completeLogData);
  }

  // 補記昨天的餵奶時，紀錄不會落在目前這一天。跳到它真正落在的日子，
  // 不然使用者剛存的東西會憑空消失。
  setSelectedDate(new Date(completeLogData.timestamp));
}

function handleEdit(context: DailyLogContext, log: DailyLog) {
  const { setShowModal, setModalType, setEditingLog } = context.state;

  setEditingLog(log);
  setModalType(log.type);
  setShowModal(true);
}

async function handleDelete(context: DailyLogContext, logId: string) {
  const { currentChild, toast, repository } = context;
  const { justClosedSleep, setJustClosedSleep } = context.state;

  if (!currentChild) {
    return;
  }

  try {
    await repository.deleteDailyLog(currentChild.id, logId);

    // 剛關掉的那一段被刪了，就不該再問它的夜醒次數。
    if (justClosedSleep?.id === logId) {
      setJustClosedSleep(null);
    }
  } catch (error) {
    console.error('刪除日誌失敗:', error);

    toast.show(
      error instanceof Error ? error.message : '刪除失敗，請稍後再試',
    );
  }
}

function canStartSleep(context: DailyLogContext) {
  const { isToday, openSleep } = context.view;
  const { toast } = context;

  if (!isToday) {
    openLogForm(context, 'sleep'); // 補記過去的睡眠沒有「現在開始」可言

    return false;
  }

  if (openSleep) {
    toast.show(
      isStaleOpenSleep(openSleep)
        ? '上一段睡眠還沒有結束時間，先補上才能開始新的一段。'
        : '寶寶還在睡。先按「醒了」結束這一段，才能開始新的一段。',
    );

    return false;
  }

  return true;
}
