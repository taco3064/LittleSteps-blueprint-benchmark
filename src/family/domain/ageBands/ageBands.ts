import type { ToddlerAgeBand } from '~app/knowledge/domain/referenceModels';

/** 年齡段的顯示與遍歷順序。Record 型別本身不保證順序，需要時一律用這個陣列。 */
export const TODDLER_AGE_BANDS: ToddlerAgeBand[] = [
  '12-15',
  '15-18',
  '18-24',
  '24-30',
  '30-36',
];

/** 每個年齡段的起始月齡，與 TODDLER_AGE_BANDS 同序。 */
const BAND_START_MONTHS: number[] = [12, 15, 18, 24, 30];

/**
 * 由月齡挑出所屬年齡段。
 *
 * 範圍外一律夾到最近的一端：未滿 12 個月得到第一段、滿 36 個月以上得到最後
 * 一段。頁面另外會顯示引導卡或畢業卡，此處只保證永遠回傳一個有效的段，
 * 讓呼叫端不必處理 undefined。
 */
export function bandForMonths(ageMonths: number): ToddlerAgeBand {
  let index = 0;

  for (let i = 0; i < BAND_START_MONTHS.length; i++) {
    if (ageMonths >= BAND_START_MONTHS[i]) {
      index = i;
    }
  }

  return TODDLER_AGE_BANDS[index];
}

/** 幼兒期的月齡範圍，兩端皆為 LittleExplorer 的服務邊界。 */
export const TODDLER_MIN_MONTHS = 12;
export const TODDLER_MAX_MONTHS = 36;
