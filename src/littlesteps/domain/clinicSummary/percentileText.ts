export /** 沒有性別就算不出百分位，所以這個括號常常是空的 */
function percentileText(value?: number): string {
  return value === undefined ? '' : `（P${Math.round(value)}）`;
}
