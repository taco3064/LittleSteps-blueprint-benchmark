import type { WikiArticle } from './wiki';

// Toddler Wiki (幼兒百科) — LittleExplorer
export type ToddlerWikiCategory
  = | 'toilet' // 如廁訓練
    | 'language' // 語言發展
    | 'emotion' // 情緒與行為
    | 'eating' // 飲食與挑食
    | 'sleep' // 睡眠轉換
    | 'safety' // 學步期安全
    | 'health' // 生病與就醫
    | 'preschool';
// 入園與社交

/**
 * 幼兒百科文章。
 *
 * `ageRange` 是這篇最相關的月齡區間，含頭不含尾，起始值對齊
 * `TODDLER_AGE_BANDS` 的界線（12/15/18/24/30）。橫跨整個幼兒期的常備知識
 * 用 `[12, 36]`。用途只有排序與標籤——任何年齡都讀得到每一篇。
 */
export interface ToddlerWikiArticle extends WikiArticle<ToddlerWikiCategory> {
  ageRange: [number, number];
}
