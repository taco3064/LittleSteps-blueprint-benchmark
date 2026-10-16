// 睡眠統計介面
export interface SleepStats {
  totalDuration: number; // 總睡眠時長（分鐘）
  /** 每日平均睡眠時長（分鐘）。分母是有記錄的天數，不是時段長度。 */
  dailyAverage: number;
  sleepCount: number; // 睡眠次數
  averageDuration: number; // 平均每次睡眠時長（分鐘）
  nightSleep: number; // 夜間睡眠時長（分鐘）
  daytimeNaps: number; // 白天小睡時長（分鐘）
  nightSleepCount: number; // 夜間睡眠次數
  napCount: number; // 白天小睡次數
  daysInPeriod: number; // 時段長度：今日 1、本週 7、本月 30
  /**
   * 這個時段裡真的有睡眠記錄的天數。
   *
   * 每日平均一律除這個數。除以時段長度的話，只記了一晚的家長會看到
   * 「每天平均睡 1.7 小時」，而建議值是 13-15 小時——那不是孩子的狀況，
   * 是 29 天沒記錄被當成 29 天沒睡。
   */
  daysWithRecords: number;
}
