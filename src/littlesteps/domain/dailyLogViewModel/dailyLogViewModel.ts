import { isSameDay } from '~app/platform/domain/calendar';
import { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import {
  findLastLog,
  findOpenSleep,
  isIntakeFeedingLog,
  isPumpingLog,
  isStaleOpenSleep,
} from '../logHelpers';

export function getDailyLogViewModel({
  logs,
  selectedDate,
  modalType,
}: {
  logs: DailyLog[];
  selectedDate: Date;
  modalType: DailyLog['type'] | null;
}) {
  const isToday = isSameDay(selectedDate, new Date());
  const todayLogs = logs.filter((log) => isSameDay(log.timestamp, selectedDate));
  // 擠奶是產出，不是餵了一餐——這個數字要跟摘要卡說同一件事。
  const feedingCount = todayLogs.filter(isIntakeFeedingLog).length;

  // 忘了按「醒了」的那一筆不是一段睡眠，是一個待補的欄位；它有自己的卡片。
  const sleepCount = todayLogs.filter(
    (l) => l.type === 'sleep' && !isStaleOpenSleep(l),
  ).length;

  const diaperCount = todayLogs.filter((l) => l.type === 'diaper').length;

  const openSleep = findOpenSleep(logs);

  /*
    還在睡的那一段跨得過午夜，所以看今天時一定要看得到它，即使是昨晚入睡的。
    翻到過去的某一天時，只有那天入睡的才顯示。
  */
  const showOpenSleep
    = openSleep !== null
      && (isToday || isSameDay((openSleep.data as SleepData).startTime, selectedDate));

  const sleepMode: 'log' | 'sleeping' | 'start' = !isToday
    ? 'log'
    : openSleep
      ? 'sleeping'
      : 'start';

  /*
    預填與「再記一次」都讀這個孩子自己的紀錄——logs 本來就只有他一個人的。
    絕對不能改成 localStorage：孩子的資料不放在裝置上，而且一位有兩個孩子的
    家長，一個喝配方奶一個親餵，共用一份記憶只會讓兩張表都填錯。
  */
  const lastFeeding = findLastLog(logs, isIntakeFeedingLog);
  const lastPumping = findLastLog(logs, isPumpingLog);
  const lastDiaper = findLastLog(logs, (log) => log.type === 'diaper');
  /*
    表單沿用的是「上一筆同類型的紀錄」，擠奶也算——剛擠完的人多半是要再擠一次。
    「再記一次」則把兩者拆開：擠奶不是一餐，也不該擋住「再餵一次上次那餐」。
  */
  const lastFeedingForm = findLastLog(logs, (log) => log.type === 'feeding');

  const lastLogForForm
    = modalType === 'diaper'
      ? lastDiaper
      : modalType === 'feeding'
        ? lastFeedingForm
        : null;

  return {
    isToday,
    feedingCount,
    sleepCount,
    diaperCount,
    openSleep,
    showOpenSleep,
    sleepMode,
    lastFeeding,
    lastPumping,
    lastDiaper,
    lastLogForForm,
  };
}
