/**
 * The raw tables, keyed by gender then measurement type. Exported so the data
 * itself can be validated; read a single standard via `getWHOStandard()`.
 */
/**
 * 身高的接縫：WHO 用兩套標準。
 *
 * 0-24 個月量的是躺著的身長（length-for-age），24 個月以後量的是站著的身高
 * （height-for-age）。同一個 24 個月大的孩子，兩套標準的中位數差 0.67 公分
 * ——不是誤差，是姿勢造成的真實差異，WHO 的合併表就在第 731 天直接跳過去。
 *
 * 所以身高不能只有一個陣列：上面 maleHeightStandards 的 24 個月是身長值，
 * 27 個月是身高值，線性插值會在中間造出一段兩套標準都不認的曲線。實測 25 個
 * 月大、90 公分的男孩會被算成第 69 百分位，正確答案是第 74 百分位。
 *
 * 下面兩張表只放 24 個月起的身高標準；getWHOStandard 依年齡選表，插值永遠
 * 只發生在同一套標準之內。
 *
 * 來源：WHO length/height-for-age 合併 z-score 展開表第 731 天
 *   lhfa-boys-zscore-expanded-tables.xlsx / lhfa-girls-zscore-expanded-tables.xlsx
 *   （查證日期 2026-08-29）
 */
export const STANDING_HEIGHT_FROM_MONTHS = 24;
