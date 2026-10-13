import { useState } from 'react';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import type { RemindersPageProps } from './useReminderModel';
const today = () => toLocalDateKey();

export function useReminderForm({ onCompleteTask, onUndoTask }: RemindersPageProps) {
  const [formFor, setFormFor] = useState<string | null>(null);
  const [completedDate, setCompletedDate] = useState(today);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  /* 建檔前那一區預設收合：重點是「有這些東西」，不是逐條看完。 */

  const [saving, setSaving] = useState(false);

  /* 失敗訊息綁在出問題的那一列：這一頁同時列十幾項，頁面級的橫幅說不清是哪一項。 */
  const [failure, setFailure] = useState<{ taskId: string; message: string } | null>(
    null,
  );

  const openForm = (taskId: string) => {
    setFormFor(taskId);
    setCompletedDate(today());
    setLocation('');
    setNotes('');
  };

  /*
   * store 的 upsertCareTaskRecord／清除記錄失敗時往外丟且不 toast——訊息由這
   * 一頁負責。表單要留著：家長剛填的院所與備註不能因為一次網路逾時就消失，
   * 而重複點擊會寫進兩次。
   */
  const submitForm = async (taskId: string) => {
    if (saving) {
      return;
    }

    setSaving(true);
    setFailure(null);

    try {
      await onCompleteTask({
        taskId,
        completedDate,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setFormFor(null);
    } catch (error) {
      console.error('儲存照護記錄失敗:', error);

      setFailure({
        taskId,
        message: '儲存失敗，剛才填的內容還在，請確認網路後再送出。',
      });
    } finally {
      setSaving(false);
    }
  };

  const undoTask = async (taskId: string) => {
    if (!onUndoTask || saving) {
      return;
    }

    setSaving(true);
    setFailure(null);

    try {
      await onUndoTask(taskId);
    } catch (error) {
      console.error('取消照護記錄失敗:', error);
      setFailure({ taskId, message: '取消失敗，請確認網路後再試一次。' });
    } finally {
      setSaving(false);
    }
  };

  return {
    formFor,
    setFormFor,
    completedDate,
    setCompletedDate,
    location,
    setLocation,
    notes,
    setNotes,
    saving,
    setSaving,
    failure,
    setFailure,
    openForm,
    submitForm,
    undoTask,
  };
}
