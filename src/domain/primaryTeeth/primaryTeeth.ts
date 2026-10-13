import type { PrimaryTooth, ToothJaw } from '../records';

/**
 * 乳牙萌發參考月齡。
 *
 * 主要來源（單一來源，未與其他資料混用）：
 * 社團法人中華民國兒童牙科醫學會（TAPD）衛教專區「0至三歲 Between 0 to 3 years」
 * 一文所附之「乳齒萌發時間表」圖表。
 * 文章：https://www.tapd.org.tw/people/health/content.php?id=18
 * 圖表：https://www.tapd.org.tw/upload/ckeditor/2021-10-13-191502.png
 * （2026-08-27 查核；圖表標題下方註明「此時間表為平均值，僅供參考」）
 *
 * 該表以「平均值 ± 誤差」表示，共 10 列（上下顎 × 5 個牙位）。本檔逐列換算為
 * 含端點的月齡區間 [平均值 − 誤差, 平均值 + 誤差]，原文對照如下：
 *   ① 6 個月大 ±2 個月：下顎正中乳門齒      → 4-8
 *   ② 6 個月大 ±2 個月：上顎正中乳門齒      → 4-8
 *   ③ 9 個月大 ±2 個月：上顎乳側門齒        → 7-11
 *   ④ 9 個月大 ±2 個月：下顎乳側門齒        → 7-11
 *   ⑤ 1 歲大 ±3 個月：上顎第一乳臼齒        → 9-15
 *   ⑥ 1 歲大 ±3 個月：下顎第一乳臼齒        → 9-15
 *   ⑦ 1 歲 6 個月大 ±3 個月：上顎乳犬齒     → 15-21
 *   ⑧ 1 歲 6 個月大 ±3 個月：下顎乳犬齒     → 15-21
 *   ⑨ 2 歲大 ±5 個月：下顎第二乳臼齒        → 19-29
 *   ⑩ 2 歲大 ±5 個月：上顎第二乳臼齒        → 19-29
 *
 * 兩點與直覺不同、但確實是來源原貌，請勿「順手修正」：
 *
 * 1. TAPD 對上下顎同名牙位給的平均值與誤差完全相同，故本檔上下顎區間相同。
 *    該表的上下顎差異是用萌發「順序」表達（①下顎正中乳門齒 早於 ②上顎正中乳門齒、
 *    ⑨下顎第二乳臼齒 早於 ⑩上顎第二乳臼齒），而非給不同的月齡區間。
 *    坊間常見的「下顎中門齒 6-10 個月、上顎 8-12 個月、上顎第二乳臼齒 25-33 個月」
 *    出自美國牙醫學會（ADA）的圖表，與本檔來源不同，不併用。
 *
 * 2. 月齡不隨牙位順位遞增：乳犬齒（順位 3）晚於第一乳臼齒（順位 4）萌發。
 *    臨床萌發順序為 正中門齒 → 側門齒 → 第一乳臼齒 → 乳犬齒 → 第二乳臼齒，
 *    即順位 1 → 2 → 4 → 3 → 5。ADA 圖表亦呈現同樣的順序。
 *
 * 個別差異大，本資料僅供家長參考，不作為診斷依據。
 */

/** 由中線往外的順位 1-5 對應的牙位名稱 */
export const toothPositionLabels: Record<number, string> = {
  1: '正中門齒',
  2: '側門齒',
  3: '乳犬齒',
  4: '第一乳臼齒',
  5: '第二乳臼齒',
};

const jawPrefixes: Record<ToothJaw, string> = {
  upper: '上',
  lower: '下',
};

/**
 * 來源表的一列：一個牙位（jaw + position）。左右各一顆共用同一列，
 * 因為 TAPD 圖表在牙弓左右兩側標的是同一個編號、同一個區間。
 */
interface EruptionWindow {
  jaw: ToothJaw;
  position: number;
  fromMonth: number;
  toMonth: number;
}

const eruptionWindows: EruptionWindow[] = [
  { jaw: 'upper', position: 1, fromMonth: 4, toMonth: 8 },
  { jaw: 'upper', position: 2, fromMonth: 7, toMonth: 11 },
  { jaw: 'upper', position: 3, fromMonth: 15, toMonth: 21 },
  { jaw: 'upper', position: 4, fromMonth: 9, toMonth: 15 },
  { jaw: 'upper', position: 5, fromMonth: 19, toMonth: 29 },
  { jaw: 'lower', position: 1, fromMonth: 4, toMonth: 8 },
  { jaw: 'lower', position: 2, fromMonth: 7, toMonth: 11 },
  { jaw: 'lower', position: 3, fromMonth: 15, toMonth: 21 },
  { jaw: 'lower', position: 4, fromMonth: 9, toMonth: 15 },
  { jaw: 'lower', position: 5, fromMonth: 19, toMonth: 29 },
];

/**
 * 全副乳牙 20 顆。id 為 `<jaw>-<side>-<position>`，例：`upper-right-1`、`lower-left-5`，
 * 讓牙弓圖能以位置直接定址。
 */
export const primaryTeeth: PrimaryTooth[] = eruptionWindows.flatMap(
  ({ jaw, position, fromMonth, toMonth }) =>
    (['right', 'left'] as const).map((side) => ({
      id: `${jaw}-${side}-${position}`,
      name: `${jawPrefixes[jaw]}${toothPositionLabels[position]}`,
      jaw,
      position,
      side,
      eruptFromMonth: fromMonth,
      eruptToMonth: toMonth,
    })),
);

/** 乳牙總數 20，由資料推導，避免與陣列各寫一份而失準 */
export const TOOTH_COUNT = primaryTeeth.length;
