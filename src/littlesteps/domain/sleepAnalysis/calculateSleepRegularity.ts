import { minutesOfDay } from '~app/family/domain/circularTime';
import { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { SleepRegularity } from './SleepRegularity';
import { calculateTimeStats } from './calculateTimeStats';
import { filterLogsByPeriod } from './filterLogsByPeriod';
import { isNightSleep } from './isNightSleep';

/**
 * 計算睡眠規律性
 */
export function calculateSleepRegularity(logs: DailyLog[]): SleepRegularity {
  const sleepLogs = logs.filter((log) => log.type === 'sleep');

  // 只取最近 7 天的記錄
  const weekLogs = filterLogsByPeriod(sleepLogs, 'week');

  const completedSleeps = weekLogs.filter((log) => {
    const data = log.data as SleepData;

    return data.endTime && data.duration;
  });

  // 只算夜間睡眠。小睡混進來的話，早上 09:30 的小睡和晚上 20:00 的就寢會被
  // 平均成 14:45，而每個這個年紀的孩子都在小睡——那個數字對每一位使用者都是錯的。
  const nightSleeps = completedSleeps.filter((log) =>
    isNightSleep((log.data as SleepData).startTime),
  );

  const bedtimes: number[] = [];
  const wakeTimes: number[] = [];

  nightSleeps.forEach((log) => {
    const data = log.data as SleepData;

    bedtimes.push(minutesOfDay(new Date(data.startTime)));
    wakeTimes.push(minutesOfDay(new Date(data.endTime!)));
  });

  const bedtimeStats = calculateTimeStats(bedtimes);
  const wakeTimeStats = calculateTimeStats(wakeTimes);

  return {
    bedtimeRegularity: bedtimeStats.score,
    wakeTimeRegularity: wakeTimeStats.score,
    averageBedtime: bedtimeStats.time,
    averageWakeTime: wakeTimeStats.time,
  };
}
