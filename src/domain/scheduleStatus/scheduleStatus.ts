/**
 * 「有到期日的待辦」的狀態機。
 *
 * 這段邏輯原本在 littleexplorer/utils/careSchedule.ts 與
 * littlebloom/utils/prenatalSchedule.ts 各寫一份，函式體逐字相同，只有回傳
 * 型別的名字不同（CareTaskStatus 對 PrenatalItemStatus，成員一模一樣）。
 * 兩邊講的是同一件事：一個從某個錨點日期推算出到期日的項目，現在是還沒到、
 * 到了、過了，還是做完了。
 *
 * 錨點不同（出生日加月數／末次月經加週數），狀態判斷相同——所以分開的是
 * 展開時程的那一層，不是這一層。
 */

export type ScheduleStatus = 'upcoming' | 'due' | 'overdue' | 'done';

/**
 * @param completedDate 已完成的日期。undefined 表示還沒完成；空字串代表
 *   「完成了但沒記日期」，仍算完成——疫苗只勾了接種、沒填日期就是這種情形。
 * @param today 注入以利測試
 * @param dueDate 建議施行日
 * @param windowEnd 可執行區間的結束日，過了就是逾期
 */
export function resolveScheduleStatus({
  completedDate,
  today,
  dueDate,
  windowEnd,
}: {
  completedDate: string | undefined;
  today: Date;
  dueDate: Date;
  windowEnd: Date;
}): ScheduleStatus {
  if (completedDate !== undefined) {
    return 'done';
  }

  if (today.getTime() > windowEnd.getTime()) {
    return 'overdue';
  }

  if (today.getTime() >= dueDate.getTime()) {
    return 'due';
  }

  return 'upcoming';
}
