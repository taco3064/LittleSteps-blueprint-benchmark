import { useChildWrite } from './useChildWrite';
import { useCallback } from 'react';
import { readGestationalAge } from '~app/family/domain/childForm';
import { useChildDraft } from './useChildDraft';
import type { AddChildModalProps, ChildModalMode } from '~app/family/domain/childForm';

import { GESTATIONAL_AGE_RANGE } from '~app/family/domain/correctedAge';
export type { AddChildModalProps, ChildModalMode } from '~app/family/domain/childForm';

export function useAddChildModal({
  isOpen,
  onClose,
  onSave,
  onJoin,
  editingChild,
  onDelete,
  modes = ['create', 'join'],
  accent = 'bg-primary-dark',
  accentText = 'text-white',
}: AddChildModalProps) {
  const draft = useChildDraft({ isOpen, onClose, onSave, editingChild, modes });

  const {
    mode,
    name,
    birthday,
    dueDate,
    gender,
    childUuid,
    gestationalWeeks,
    gestationalDays,
    setError,
  } = draft;

  const runWrite = useChildWrite(draft, onClose);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
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
            onSave({
              name: name,
              birthday: birthday,
              gender: gender || undefined,
              isPregnancy: undefined,
              dueDate: undefined,
              gestationalAge: gestationalAge,
            }),
          );
        }
      } else if (mode === 'pregnancy') {
        if (name && dueDate) {
          // 孕期檔案的 birthday 存的就是預產期。
          void runWrite(() =>
            onSave({
              name: name,
              birthday: dueDate,
              gender: undefined,
              isPregnancy: true,
              dueDate: dueDate,
            }),
          );
        }
      } else if (mode === 'join') {
        if (childUuid && onJoin) {
          void runWrite(() => onJoin(childUuid.trim()));
        }
      }
    },
    [
      mode,
      name,
      birthday,
      gender,
      dueDate,
      childUuid,
      onSave,
      onJoin,
      gestationalWeeks,
      gestationalDays,
      runWrite,
      setError,
    ],
  );

  const presentation = formPresentation(mode, { modes, onJoin, editingChild });

  return {
    ...draft,
    isOpen,
    onClose,
    editingChild,
    onDelete,
    accent,
    accentText,
    handleSubmit,
    ...presentation,
  };
}

function formPresentation(
  mode: ChildModalMode,
  {
    modes,
    onJoin,
    editingChild,
  }: {
    modes: readonly ChildModalMode[];
    onJoin: AddChildModalProps['onJoin'];
    editingChild: AddChildModalProps['editingChild'];
  },
) {
  const MODE_LABELS: Record<ChildModalMode, string> = {
    create: '寶寶',
    pregnancy: '懷孕中',
    join: '加入',
  };

  // 只有一種選擇時不畫分頁——LittleBloom 只建孕期檔案，一顆孤零零的
  // 「懷孕中」按鈕沒有在選什麼。
  const available = modes.filter((m) => m !== 'join' || onJoin);
  const showModeSelector = !editingChild && available.length > 1;

  const title = editingChild
    ? '編輯寶寶資料'
    : mode === 'create'
      ? '新增寶寶'
      : mode === 'pregnancy'
        ? '新增孕期'
        : '加入寶寶';

  const submitLabel = editingChild
    ? '儲存修改'
    : mode === 'create'
      ? '新增寶寶'
      : mode === 'pregnancy'
        ? '開始追蹤孕期'
        : '加入寶寶';

  return { MODE_LABELS, available, showModeSelector, title, submitLabel };
}
