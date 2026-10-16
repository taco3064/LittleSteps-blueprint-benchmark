import { shiftDays } from '~app/platform/domain/calendar';
/**
 * 日期時間工具函數
 * 用於快速日誌功能的日期處理
 */

/**
 * 計算月齡。
 *
 * 以日為準：尚未過當月生日時不計入該月，因此 1/31 出生的孩子在 2/1
 * 是 0 個月而非 1 個月。LittleExplorer 的年齡段判定與 careSchedule 的
 * 到期日計算都依賴這個精度。
 */
export function calculateAge(birthday: string): number {
  const birth = new Date(birthday);
  const now = new Date();

  let months
    = (now.getFullYear() - birth.getFullYear()) * 12
      + (now.getMonth() - birth.getMonth());

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

/** Naegele 法則：預產期為末次月經第一天起算 280 天。 */
export const GESTATION_DAYS = 280;

/** 由末次月經第一天推預產期。 */
export function dueDateFromLmp(lastPeriodDate: string): string {
  return shiftDays(lastPeriodDate, GESTATION_DAYS);
}

/** 由預產期回推末次月經第一天。與 dueDateFromLmp 互為反函式。 */
export function lmpFromDueDate(dueDate: string): string {
  return shiftDays(dueDate, -GESTATION_DAYS);
}
