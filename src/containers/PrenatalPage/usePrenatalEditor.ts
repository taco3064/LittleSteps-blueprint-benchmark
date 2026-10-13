import { useState } from 'react';

import type { PrenatalPageProps } from './types';
import { today } from './presentation';

export function usePrenatalEditor({
  onComplete,
  onUndo,
}: Pick<PrenatalPageProps, 'onComplete' | 'onUndo'>) {
  const [formFor, setFormFor] = useState<string | null>(null);

  const [completedDate, setCompletedDate] = useState(today);

  const [clinicName, setClinicName] = useState('');

  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);

  /* 失敗訊息綁在出問題的那一列：這一頁同時列 14 次產檢，頁面級的橫幅說不清是哪一項。 */
  const [failure, setFailure] = useState<{
    templateId: string;
    message: string;
  } | null>(null);

  /*
   * store 的 upsertPrenatalRecord／clearPrenatalRecord 失敗時往外丟且不 toast
   * ——訊息由這一頁負責。表單必須留著：家長剛打的院所與備註不能因為一次網路
   * 逾時就被清掉，而重複點擊會寫進兩次。
   */
  const submit = async (templateId: string) => {
    if (saving) {
      return;
    }

    setSaving(true);
    setFailure(null);

    try {
      await onComplete(templateId, {
        completedDate,
        clinicName: clinicName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setFormFor(null);
    } catch (error) {
      console.error('儲存產檢記錄失敗:', error);

      setFailure({
        templateId,
        message: '儲存失敗，剛才填的內容還在，請確認網路後再送出。',
      });
    } finally {
      setSaving(false);
    }
  };

  const undo = async (templateId: string) => {
    if (saving) {
      return;
    }

    setSaving(true);
    setFailure(null);

    try {
      await onUndo(templateId);
    } catch (error) {
      console.error('取消產檢記錄失敗:', error);
      setFailure({ templateId, message: '取消失敗，請確認網路後再試一次。' });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (templateId: string) => {
    if (formFor === templateId) {
      setFormFor(null);

      return;
    }

    setFormFor(templateId);
    setCompletedDate(today());
    setClinicName('');
    setNotes('');
  };

  return {
    form: { activeId: formFor, completedDate, clinicName, notes },
    saving,
    failure,
    submit,
    undo,
    toggle,
    change: {
      completedDate: setCompletedDate,
      clinicName: setClinicName,
      notes: setNotes,
    },
  };
}

export type PrenatalEditor = ReturnType<typeof usePrenatalEditor>;
