import type { ChildProfile, Gender } from '../familyRecords';
import { GESTATIONAL_AGE_RANGE, type GestationalAge } from '../correctedAge';
export type ChildModalMode = 'create' | 'join' | 'pregnancy';
export interface ChildFormValues {
  name: string;
  birthday: string;
  gender?: Gender;
  isPregnancy?: boolean;
  dueDate?: string;
  gestationalAge?: GestationalAge;
}
export interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * 回傳 promise 時，視窗會等它成功才關閉。寫入失敗的話輸入留在原地——
   * 家長不必重打一次名字與生日。
   */
  onSave: (values: ChildFormValues) => void | Promise<void>;
  onJoin?: (uuid: string) => void | Promise<void>; // New: join existing child
  editingChild?: ChildProfile | null;
  /** 只在編輯既有寶寶時提供。刪除從側邊欄那一列搬進來，避開誤觸。 */
  onDelete?: () => void;
  /**
   * 這個入口提供哪些分頁，順序即顯示順序。
   *
   * 每個服務自己開自己需要的：LittleBloom 只要建孕期檔案，LittleSteps 與
   * LittleExplorer 要建寶寶或加入既有寶寶。共用的是帳號與孩子資料，不是
   * 彼此的畫面——孕期檔案原本只能從 LittleSteps 的側邊欄新增，等於要先進
   * 別的服務才能開始用 LittleBloom。
   */
  modes?: readonly ChildModalMode[];
  /**
   * 選取中的分頁與送出鍵的顏色。預設是 LittleSteps 的主色；其他服務傳入
   * 自己的 `ServiceTheme.fill` + `fillText`，這樣視窗看起來就屬於當下的服務。
   */
  accent?: string;
  accentText?: string;
}

export function readGestationalAge(
  gestationalWeeks: string,
  gestationalDays: string,
): { weeks?: number; days?: number } | 'invalid' | undefined {
  if (gestationalWeeks.trim() === '' && gestationalDays.trim() === '') {
    return undefined;
  }

  const weeks = Number(gestationalWeeks);
  const days = gestationalDays.trim() === '' ? 0 : Number(gestationalDays);

  const weeksOk
    = Number.isInteger(weeks)
      && weeks >= GESTATIONAL_AGE_RANGE.minWeeks
      && weeks <= GESTATIONAL_AGE_RANGE.maxWeeks;

  const daysOk = Number.isInteger(days) && days >= 0 && days <= 6;

  if (!weeksOk || !daysOk) {
    return 'invalid';
  }

  return { weeks, days };
}
