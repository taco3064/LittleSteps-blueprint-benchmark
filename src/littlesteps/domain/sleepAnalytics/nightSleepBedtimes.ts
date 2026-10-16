import { minutesOfDay } from '~app/family/domain/circularTime';
import type { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { isNightSleep } from '../sleepAnalysis';
import { getSleepLogsInRange } from './getSleepLogsInRange';

export /**
 * 夜間就寢時刻（當日分鐘數）。
 *
 * 只取夜間睡眠：小睡的開始時間不是就寢時間。原本的寫法是「每一天最早的那次
 * 睡眠」，對會小睡的孩子——也就是這個 app 的每一個孩子——取到的都是早上那次
 * 小睡。也不再按日曆日分組：夜間睡眠一晚一次，分組只是為了濾掉小睡，
 * 而那件事現在由 isNightSleep 正確地做。
 */
function nightSleepBedtimes(
  logs: DailyLog[],
  days: number,
  baseDate: Date,
): number[] {
  return getSleepLogsInRange(logs, days, baseDate)
    .filter((log) => isNightSleep((log.data as SleepData).startTime))
    .map((log) => minutesOfDay(new Date((log.data as SleepData).startTime)));
}
