import type { PregnancyGuide } from './pregnancyGuide';
import { firstTrimester } from './firstTrimester';
import { secondTrimester } from './secondTrimester';
import { thirdTrimester } from './thirdTrimester';
export type { PregnancyGuide } from './pregnancyGuide';

/** 標準孕期週數，第 40 週即預產期所在週。 */
export const PREGNANCY_TOTAL_WEEKS = 40;

/**
 * 取得指定週數所屬的孕期。超出 1～40 的輸入會夾到邊界值，不拋錯；
 * 小數以無條件捨去處理，對齊產科「13 週 + 6 天仍算第 13 週」的慣例。
 * 分期界線：第一期 1–13 週、第二期 14–27 週、第三期 28–40 週。
 */
export function trimesterOf(week: number): 1 | 2 | 3 {
  const clamped = Number.isNaN(week)
    ? 1
    : Math.min(Math.max(Math.floor(week), 1), PREGNANCY_TOTAL_WEEKS);

  if (clamped <= 13) {
    return 1;
  }

  if (clamped <= 27) {
    return 2;
  }

  return 3;
}

export const pregnancyGuides: PregnancyGuide[] = [
  ...firstTrimester,
  ...secondTrimester,
  ...thirdTrimester,
];
