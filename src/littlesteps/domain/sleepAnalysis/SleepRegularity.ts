// 睡眠規律性介面
export interface SleepRegularity {
  bedtimeRegularity: number; // 0-100 分數，越高越規律
  wakeTimeRegularity: number; // 0-100 分數，越高越規律
  /** 夜間就寢的平均時刻；只記過小睡時沒有這個數字 */
  averageBedtime?: string;
  /** 夜間睡醒的平均時刻；只記過小睡時沒有這個數字 */
  averageWakeTime?: string;
}
