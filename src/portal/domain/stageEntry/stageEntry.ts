import {
  TODDLER_MAX_MONTHS,
  TODDLER_MIN_MONTHS,
} from '~app/family/domain/ageBands';
import { calculateAge } from '~app/family/domain/dateHelpers';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { isPregnancyProfile } from '~app/family/domain/pregnancy';
import type { Page } from '../routes';
import type { ServiceId } from '../serviceCatalogue';

/**
 * 這個孩子現在屬於哪一個階段。
 *
 * 登入後原本一律跳 littlesteps/dashboard，只看「有沒有孩子」這個布林值——
 * LandingPage 對 isPregnancy 和 birthday 一個字都沒讀。所以只有孕期檔案的
 * 使用者，登入後會落在嬰兒儀表板上；兩歲孩子的家長也一樣，落在一個里程碑
 * 資料早就到頂的頁面。
 *
 * 這裡回傳的是「該去哪」，不是「該顯示什麼」——各服務自己的年齡邊界處理
 * 不受影響。
 */
export type Stage = 'pregnancy' | 'baby' | 'toddler' | 'beyond';

export function stageOfChild(
  child: ChildProfile | undefined,
): Stage | undefined {
  if (!child) {
    return undefined;
  }

  if (isPregnancyProfile(child)) {
    return 'pregnancy';
  }

  const months = calculateAge(child.birthday);

  if (months < TODDLER_MIN_MONTHS) {
    return 'baby';
  }

  if (months <= TODDLER_MAX_MONTHS) {
    return 'toddler';
  }

  return 'beyond';
}

/**
 * 登入完成、或從入口進入時，這個孩子該落在哪一頁。
 *
 * 滿三歲之後仍然回 LittleSteps 的儀表板：那裡有疫苗到期卡片，而 32 劑裡有
 * 10 劑排在 12 個月之後、3 劑排在 48-60 個月。幼兒期的資料到 36 個月就停了，
 * 送過去只會看到畢業卡。
 */
export function entryPageForChild(child: ChildProfile | undefined): Page {
  switch (stageOfChild(child)) {
    case 'pregnancy':
      return 'littlebloom';
    case 'toddler':
      return 'littleexplorer';
    case 'baby':
    case 'beyond':
      return 'littlesteps/dashboard';
    default:
      // 還沒有孩子時不該自動跳去任何服務——那一頁會是空的，而下一步是新增檔案。
      return 'home';
  }
}

/**
 * 這個階段對應哪一個服務。
 *
 * 給入口頁標出「現在該看哪一個」用的。刻意不改變卡片順序：一個選擇器如果在
 * 使用者拇指底下換位置，記得住的位置就沒了，而階段一輩子只換三次
 * （出生、滿一歲、滿三歲）。標記給得出同樣的資訊，又不會移動目標。
 *
 * 三歲以後仍然指向 LittleSteps，理由同 entryPageForChild。
 */
export function serviceForStage(
  stage: Stage | undefined,
): ServiceId | undefined {
  switch (stage) {
    case 'pregnancy':
      return 'littlebloom';
    case 'toddler':
      return 'littleexplorer';
    case 'baby':
    case 'beyond':
      return 'littlesteps';
    default:
      return undefined;
  }
}
