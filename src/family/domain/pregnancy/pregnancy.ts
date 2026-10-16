import type { ChildProfile } from '../familyRecords';

/**
 * 這份檔案目前代表的是「還沒出生的孩子」。
 *
 * 判斷同時看 `isPregnancy` 與 `pregnancyData.status`：出生之後我們保留
 * `pregnancyData` 當作孕期紀錄，只把 status 改成 archived，所以只看
 * `isPregnancy` 或只看 `pregnancyData` 是否存在都會判錯。
 *
 * 有名字的原因是這個判斷散在四個地方（側邊欄、LittleSteps 儀表板、
 * LittleExplorer 年齡守門、LittleBloom），語意必須一致。
 */
export function isPregnancyProfile(child: ChildProfile | null | undefined): boolean {
  return child?.isPregnancy === true && child.pregnancyData?.status !== 'archived';
}

/**
 * LittleBloom 這一頁是關於哪一份檔案。
 *
 * 原本整個 LittleBloom 都讀 currentChild，但 currentChildId 只有在新增
 * 「第一個」孩子時才會自動指過去。已經有寶寶檔案的家長新增孕期檔案之後，
 * 檔案確實建好了，選取的卻還是那個寶寶——畫面於是一直說「還沒有孕期檔案」。
 * 更糟的是產檢紀錄與登記出生也都寫向 currentChild，等於寫到寶寶的檔案上。
 *
 * 所以 LittleBloom 自己認主：有進行中的孕期檔案就用它，與現在選了誰無關。
 * 沒有的話，才退回「currentChild 帶著已封存的孕期資料」——那是剛生完的媽媽，
 * 需要看到「寶寶已經出生了」而不是空狀態。
 *
 * 兩份進行中的孕期檔案取第一份。一個帳號上限是 2 個檔案，理論上做得到，
 * 但同時追兩個孕期不是這個 app 的情境。
 */
export function resolvePregnancyChild(
  childProfiles: ChildProfile[],
  currentChild: ChildProfile | null | undefined,
): ChildProfile | undefined {
  const active = childProfiles.find(isPregnancyProfile);

  if (active) {
    return active;
  }

  return currentChild?.pregnancyData ? currentChild : undefined;
}
