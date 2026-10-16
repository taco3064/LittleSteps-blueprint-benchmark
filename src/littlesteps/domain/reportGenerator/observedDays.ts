export /** 只留下有記錄的那幾天；沒記錄的那天是 null，不是 0 */
function observedDays(series: Array<number | null>): number[] {
  return series.filter((value): value is number => value !== null);
}
