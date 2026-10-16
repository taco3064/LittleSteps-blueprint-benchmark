import type { AddChildModalProps, ChildModalMode } from '~app/family/domain/childForm';
import { useState, useEffect } from 'react';
import type { Gender } from '~app/family/domain/familyRecords';

export function useChildDraft({
  editingChild,
  isOpen,
  modes = ['create', 'join'],
}: AddChildModalProps) {
  const [mode, setMode] = useState<ChildModalMode>(modes[0]);

  const [name, setName] = useState('');

  const [birthday, setBirthday] = useState('');

  const [dueDate, setDueDate] = useState('');

  const [gender, setGender] = useState<Gender | ''>('');

  const [childUuid, setChildUuid] = useState('');

  // 字串而不是數字：數字型 state 沒辦法表達「使用者清空了這一格」。
  const [gestationalWeeks, setGestationalWeeks] = useState('');

  const [gestationalDays, setGestationalDays] = useState('');

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingChild) {
      setMode('create');
      setName(editingChild.name);
      setBirthday(editingChild.birthday);
      setGender(editingChild.gender || '');
      setGestationalWeeks(editingChild.gestationalAgeWeeks?.toString() ?? '');
      setGestationalDays(editingChild.gestationalAgeDays?.toString() ?? '');
    } else {
      // 回到這個入口提供的第一個分頁，而不是硬回 'create'——只提供
      // 孕期的入口沒有 'create' 可回。
      setMode(modes[0]);
      setName('');
      setBirthday('');
      setDueDate('');
      setGender('');
      setGestationalWeeks('');
      setGestationalDays('');
      setChildUuid('');
    }
  }, [editingChild, isOpen]);

  useEffect(() => setError(''), [editingChild, isOpen]);

  return {
    mode,
    setMode,
    name,
    setName,
    birthday,
    setBirthday,
    dueDate,
    setDueDate,
    gender,
    setGender,
    childUuid,
    setChildUuid,
    gestationalWeeks,
    setGestationalWeeks,
    gestationalDays,
    setGestationalDays,
    saving,
    setSaving,
    error,
    setError,
  };
}
