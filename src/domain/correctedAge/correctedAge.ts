import type { ChildProfile } from '../records';
import { GESTATION_DAYS } from '../dateHelpers';

/**
 * 早產兒的矯正年齡。
 *
 * 為什麼一定要有這個概念
 *   32 週出生、現在 6 個月大的寶寶，實際月齡是 6 個月，但發育進度只該用
 *   4 個月來看。拿實際月齡去查 WHO 生長標準，一個完全正常的體重會落到第 3
 *   百分位附近；拿去對里程碑，會問一個還不該會坐的孩子為什麼不會坐。錯的
 *   方向是最殘忍的那一邊：對最擔心的家庭製造假警報，而且就出現在他們要拿
 *   給醫師看的那一頁。
 *
 * 哪些頁面該矯正、哪些不該
 *   矯正的是「發育進度」——生長曲線、里程碑、發展檢核、幼兒百科的年齡分段。
 *   不矯正的是「政府依出生日排定的時程」——公費疫苗與兒童健檢都照實際出生
 *   日期算，早產兒不例外。這個差別家長最容易搞錯，所以那兩頁要把它寫出來，
 *   而不是靠使用者自己發現兩邊算法不同。
 *
 * 兩條邊界
 *   1. 37 週以上算足月，不矯正。矯正天數是 40 週減去出生週數。
 *   2. 矯正月齡超過 24 個月就停止矯正，之後一律用實際月齡——差距在這個年紀
 *      已經追上，繼續矯正反而會低估孩子。標記也在此時消失，見 isCorrecting。
 *
 * 沒填出生週數的孩子（包含這個欄位存在之前建立的所有檔案）一律當足月處理：
 * 行為與過去完全相同，不會多出空狀態，也不會催家長回去補。
 */

/** 37 週以上算足月。世界衛生組織與台灣兒童健康手冊都用這條線。 */
export const TERM_WEEKS = 37;

/** 矯正月齡超過這個數就停止矯正。 */
export const CORRECTION_UNTIL_MONTHS = 24;

/** 出生週數的合理範圍。20 週以下無法存活，42 週以上是過期妊娠。 */
export const GESTATIONAL_AGE_RANGE = { minWeeks: 20, maxWeeks: 42 } as const;

/** 算矯正年齡只需要這三個欄位，所以不強迫呼叫端交出整份檔案。 */
export type CorrectableChild = Pick<
  ChildProfile,
  'birthday' | 'gestationalAgeWeeks' | 'gestationalAgeDays'
>;

/**
 * 表單送出的形狀。兩個欄位都是選填，因為家長可能只填週數；`days` 缺席時
 * 一律當 0，與 gestationDays 的處理一致。
 */
export type GestationalAge = { weeks?: number; days?: number };

const MS_PER_DAY = 86_400_000;

/** 出生週數換算成天數；沒填或超出合理範圍時回 null。 */
function gestationDays(child: CorrectableChild): number | null {
  const weeks = child.gestationalAgeWeeks;

  if (weeks === undefined || !Number.isFinite(weeks)) {
    return null;
  }

  if (
    weeks < GESTATIONAL_AGE_RANGE.minWeeks
    || weeks > GESTATIONAL_AGE_RANGE.maxWeeks
  ) {
    return null;
  }

  const days = child.gestationalAgeDays ?? 0;

  if (!Number.isFinite(days) || days < 0 || days > 6) {
    return null;
  }

  return weeks * 7 + days;
}

/** 實際月齡。與 dateHelpers.calculateAge 同一套算法，但可以指定基準時間。 */
function chronologicalMonths(birthday: string, at: Date): number {
  const birth = new Date(birthday);

  let months
    = (at.getFullYear() - birth.getFullYear()) * 12
      + (at.getMonth() - birth.getMonth());

  if (at.getDate() < birth.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

/**
 * 要從實際年齡扣掉幾天。足月、沒填、或已經過了矯正期都回 0。
 *
 * 生長曲線把它用在「這一筆紀錄當天的年齡」上，所以扣的是天數而不是月數：
 * 記錄日期各不相同，一律換算成月再扣會把誤差放大到半個月。
 */
export function correctionDays(
  child: CorrectableChild,
  at: Date = new Date(),
): number {
  const gestation = gestationDays(child);

  if (gestation === null || gestation >= TERM_WEEKS * 7) {
    return 0;
  }

  const raw = GESTATION_DAYS - gestation;
  const chronological = chronologicalMonths(child.birthday, at);
  // 先用未矯正的月齡減去矯正量，判斷是否已經超過矯正期。用「矯正後」的月齡
  // 當判準會自己咬自己的尾巴：矯正量歸零之後，矯正月齡就變回實際月齡。
  const correctedNow = chronological - raw / 30.4375;

  return correctedNow > CORRECTION_UNTIL_MONTHS ? 0 : raw;
}

/** 這個孩子現在需不需要矯正。畫面要不要標「矯正年齡」看這個。 */
export function isCorrecting(
  child: CorrectableChild,
  at: Date = new Date(),
): boolean {
  return correctionDays(child, at) > 0;
}

/**
 * 矯正月齡。不需要矯正時就是實際月齡，所以呼叫端不必先問 isCorrecting。
 *
 * `at` 預設是現在，但生長曲線要算的是每一筆紀錄當天的年齡，所以留成參數。
 */
export function correctedAgeMonths(
  child: CorrectableChild,
  at: Date = new Date(),
): number {
  const shift = correctionDays(child, at);

  if (shift === 0) {
    return chronologicalMonths(child.birthday, at);
  }

  // 把基準日往後推，等於把出生日往後挪到預產期：矯正年齡就是「如果足月出生
  // 的話現在幾個月」。
  const shifted = new Date(at.getTime() - shift * MS_PER_DAY);

  return chronologicalMonths(child.birthday, shifted);
}

/** 「出生 32 週」／「出生 32 週 3 天」；沒填或超出範圍時回 null。 */
export function gestationalAgeLabel(child: CorrectableChild): string | null {
  const gestation = gestationDays(child);

  if (gestation === null) {
    return null;
  }

  const weeks = Math.floor(gestation / 7);
  const days = gestation % 7;

  return days === 0 ? `出生 ${weeks} 週` : `出生 ${weeks} 週 ${days} 天`;
}

/**
 * 生長曲線用的年齡：帶小數的月數，且早產兒已矯正。
 *
 * `at` 是那一筆測量的日期，不是今天——一筆在矯正年齡 6 個月時量的紀錄，就算
 * 孩子現在三歲了也還是該用矯正後的 6 個月去查 WHO 標準，否則同一筆數字會隨
 * 著時間在圖上跳動。
 *
 * 小數部分沿用原本 `(日差)/30` 的近似，足月兒算出來的值與矯正機制加入之前
 * 完全相同。
 */
export function growthAgeMonths(child: CorrectableChild, at: Date): number {
  const shift = correctionDays(child, at);
  const birth = new Date(child.birthday);
  const target = shift === 0 ? at : new Date(at.getTime() - shift * MS_PER_DAY);

  return (
    (target.getFullYear() - birth.getFullYear()) * 12
    + (target.getMonth() - birth.getMonth())
    + (target.getDate() - birth.getDate()) / 30
  );
}
