import type { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { durationPoints } from './durationPoints';
import { filterSleepLogs } from './filterSleepLogs';
import { wakingsPoints } from './wakingsPoints';

/**
 * Calculate sleep quality score (0-100)
 * Based on: session duration and recorded night wakings.
 */
export function calculateSleepQualityScore(logs: DailyLog[]): number {
  // 還在睡的那一段沒有時長可以評分。當成「0 分鐘的一段睡眠」會在寶寶正在睡
  // 的那一刻把整天的分數拉下來，而那正是這個函式現在拒絕做的事：拿沒有的
  // 資料當成壞消息。
  const sleepLogs = filterSleepLogs(logs).filter(
    (log) => (log.data as SleepData).endTime,
  );

  if (sleepLogs.length === 0) {
    return 0;
  }

  const totalScore = sleepLogs.reduce((total, log) => {
    const sleepData = log.data as SleepData;

    return (
      total
      + durationPoints(sleepData.duration || 0)
      + wakingsPoints(sleepData.nightWakings)
    );
  }, 0);

  return Math.round(totalScore / sleepLogs.length);
}
