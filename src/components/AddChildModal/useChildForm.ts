import { useState, useEffect } from 'react';
import type { ChildProfile, Gender } from '~app/domain/records';
import { GESTATIONAL_AGE_RANGE, type GestationalAge } from '~app/domain/correctedAge';
export type ChildModalMode = 'create' | 'join' | 'pregnancy';

export interface ChildSaveInput {
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
  onSave: (input: ChildSaveInput) => void | Promise<void>;
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

export interface ChildFormValues {
  name: string;
  birthday: string;
  dueDate: string;
  gender: Gender | '';
  childUuid: string;
  gestationalWeeks: string;
  gestationalDays: string;
}

const EMPTY_FORM: ChildFormValues = {
  name: '',
  birthday: '',
  dueDate: '',
  gender: '',
  childUuid: '',
  gestationalWeeks: '',
  gestationalDays: '',
};

export interface ChildFieldProps {
  form: ChildFormValues;
  setField: <K extends keyof ChildFormValues>(key: K, value: ChildFormValues[K]) => void;
  editingChild?: ChildProfile | null;
}

export function useChildForm({
  isOpen,
  onClose,
  onSave,
  onJoin,
  editingChild,
  modes,
}: Pick<
  AddChildModalProps,
  'isOpen' | 'onClose' | 'onSave' | 'onJoin' | 'editingChild'
> & {
  modes: readonly ChildModalMode[];
}) {
  const initialMode = modes[0];
  const [mode, setMode] = useState<ChildModalMode>(initialMode);
  // 字串而不是數字：數字型 state 沒辦法表達「使用者清空了這一格」。
  const [form, setForm] = useState<ChildFormValues>(EMPTY_FORM);

  const {
    name,
    birthday,
    dueDate,
    gender,
    childUuid,
    gestationalWeeks,
    gestationalDays,
  } = form;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(editingChild ? 'create' : initialMode);

    setForm((previous) =>
      editingChild
        ? {
            ...previous,
            name: editingChild.name,
            birthday: editingChild.birthday,
            gender: editingChild.gender || '',
            gestationalWeeks: editingChild.gestationalAgeWeeks?.toString() ?? '',
            gestationalDays: editingChild.gestationalAgeDays?.toString() ?? '',
          }
        : EMPTY_FORM,
    );

    setError('');
  }, [editingChild, isOpen, initialMode]);

  const runWrite = async (write: () => void | Promise<void>) => {
    setSaving(true);
    setError('');

    try {
      await write();
      onClose();
    } catch {
      // 呼叫端已經跳過提示，這裡只解釋視窗為什麼還開著。
      setError('儲存失敗，請確認網路後再試一次。');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      if (name && birthday) {
        const gestationalAge = readGestationalAge(gestationalWeeks, gestationalDays);

        if (gestationalAge === 'invalid') {
          setError(
            `出生週數請填 ${GESTATIONAL_AGE_RANGE.minWeeks}-${GESTATIONAL_AGE_RANGE.maxWeeks} 週、天數 0-6 天，或整格留空。`,
          );

          return;
        }

        void runWrite(() =>
          onSave({ name, birthday, gender: gender || undefined, gestationalAge }),
        );
      }
    } else if (mode === 'pregnancy') {
      if (name && dueDate) {
        // 孕期檔案的 birthday 存的就是預產期。
        void runWrite(() =>
          onSave({ name, birthday: dueDate, isPregnancy: true, dueDate }),
        );
      }
    } else if (mode === 'join') {
      if (childUuid && onJoin) {
        void runWrite(() => onJoin(childUuid.trim()));
      }
    }
  };

  const setField = <K extends keyof ChildFormValues>(
    key: K, value: ChildFormValues[K],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  return { mode, setMode, form, setField, saving, error, handleSubmit };
}

/**
 * 週數留空就送 undefined，兩格都不寫進資料。填了但超出合理範圍時擋下來
 * 並說清楚，而不是靜靜存一個算不出矯正年齡的數字——correctedAge 讀到範圍
 * 外的值會當足月處理，家長會以為自己填了卻沒有作用。
 */
const readGestationalAge = (
  gestationalWeeks: string,
  gestationalDays: string,
): { weeks?: number; days?: number } | 'invalid' | undefined => {
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
};
