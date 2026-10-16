import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { DiaryEntry, DiaryMood } from '~app/family/domain/familyRecords';
import { confirmDelete } from '~app/platform/services/confirmation';
const today = () => toLocalDateKey();

export function createDiaryActions({
  mood,
  setComposerOpen,
  setEditingId,
  setDate,
  setContent,
  setMood,
  setFormError,
  content,
  date,
  saving,
  setSaving,
  editingId,
  onUpdate,
  onAdd,
  setDeleteError,
  onDelete,
}: {
  mood: DiaryMood | undefined;
  setComposerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setMood: React.Dispatch<React.SetStateAction<DiaryMood | undefined>>;
  setFormError: React.Dispatch<React.SetStateAction<string>>;
  content: string;
  date: string;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  editingId: string | null;
  onUpdate: (entryId: string, updates: Partial<DiaryEntry>) => Promise<void>;
  onAdd: (
    entry: Omit<DiaryEntry, 'id' | 'childId' | 'createdAt'>,
  ) => Promise<string | undefined>;
  setDeleteError: React.Dispatch<
    React.SetStateAction<{ entryId: string; message: string } | null>
  >;
  onDelete: (entryId: string) => Promise<void>;
}) {
  const resetForm = () => {
    setComposerOpen(false);
    setEditingId(null);
    setDate(today());
    setContent('');
    setMood(undefined);
    setFormError('');
  };

  const startEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setComposerOpen(false);
    setDate(entry.date);
    setContent(entry.content);
    setMood(entry.mood);
  };

  const submit = async () => {
    const trimmed = content.trim();

    if (!trimmed || !date || date > today() || saving) {
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingId) {
        await onUpdate(editingId, { date, content: trimmed, mood });
      } else {
        await onAdd({ date, content: trimmed, mood });
      }

      resetForm();
    } catch (error) {
      console.error('儲存日記失敗:', error);
      setFormError('儲存失敗，剛才寫的內容還在，請確認網路後再送出。');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: DiaryEntry) => {
    if (!confirmDelete('這則日記')) {
      return;
    }

    setDeleteError(null);

    try {
      await onDelete(entry.id);

      if (editingId === entry.id) {
        resetForm();
      }
    } catch (error) {
      console.error('刪除日記失敗:', error);

      setDeleteError({
        entryId: entry.id,
        message: '刪除失敗，請確認網路後再試一次。',
      });
    }
  };

  return { resetForm, startEdit, submit, remove };
}
