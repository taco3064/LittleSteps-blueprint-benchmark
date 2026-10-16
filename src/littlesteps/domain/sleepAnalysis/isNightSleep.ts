/**
 * 判斷是否為夜間睡眠（18:00-06:00 之間開始）
 */
export function isNightSleep(startTime: string): boolean {
  const hour = new Date(startTime).getHours();

  return hour >= 18 || hour < 6;
}
