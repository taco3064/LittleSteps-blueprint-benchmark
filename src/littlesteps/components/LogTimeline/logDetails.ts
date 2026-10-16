import { calculateDuration, formatDuration } from '~app/platform/domain/calendar';
import {
  DailyLog,
  DiaperData,
  FeedingData,
  SleepData,
} from '~app/family/domain/familyRecords';
import {
  getConsistencyLabel,
  getDiaperTypeLabel,
  getFeedingSideLabel,
  getFeedingTypeLabel,
  isStaleOpenSleep,
} from '~app/littlesteps/domain/logHelpers';

function feedingDetails(log: DailyLog) {
  const data = log.data as FeedingData;

  // 擠奶的類型字已經是這一列的標題，再印一次會變成「擠奶 · 擠奶」。
  const parts
    = data.feedingType === 'pumping' ? [] : [getFeedingTypeLabel(data.feedingType)];

  if (data.side) {
    parts.push(getFeedingSideLabel(data.side));
  }

  if (data.duration) {
    parts.push(`${data.duration}分鐘`);
  }

  // 擠奶的 ml 是擠出來的量，不是喝進去的——同一個單位，兩件事。
  if (data.amount) {
    parts.push(`${data.amount}ml`);
  }

  return parts.join(' · ');
}

function sleepDetails(log: DailyLog) {
  const data = log.data as SleepData;

  const parts = [
    data.endTime
      ? formatDuration(
          data.duration ?? calculateDuration(data.startTime, data.endTime),
        )
      : isStaleOpenSleep(log)
        ? '還沒有結束時間'
        : '進行中',
  ];

  // undefined 是沒問到，0 是家長說沒醒——只有後者值得印出來。
  if (data.nightWakings !== undefined) {
    parts.push(`夜醒 ${data.nightWakings} 次`);
  }

  return parts.join(' · ');
}

function diaperDetails(log: DailyLog) {
  const data = log.data as DiaperData;
  const parts = [getDiaperTypeLabel(data.type)];
  // 性狀只對大便有意義。舊資料存過對照表不認得的值，那種時候寧可只寫類型，
  // 也不要印出一個後面空著的分隔點。
  const consistency = getConsistencyLabel(data.consistency);

  if (consistency && (data.type === 'poop' || data.type === 'both')) {
    parts.push(consistency);
  }

  return parts.join(' · ');
}

export function getLogDetails(log: DailyLog) {
  if (log.type === 'feeding') {
    return feedingDetails(log);
  }

  if (log.type === 'sleep') {
    return sleepDetails(log);
  }

  return diaperDetails(log);
}
