import { useState } from 'react';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { DiaryMood } from '~app/family/domain/familyRecords';
const today = () => toLocalDateKey();

export function useDiaryForm() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<DiaryMood | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteError, setDeleteError] = useState<{
    entryId: string;
    message: string;
  } | null>(null);

  return {
    composerOpen,
    setComposerOpen,
    editingId,
    setEditingId,
    date,
    setDate,
    content,
    setContent,
    mood,
    setMood,
    saving,
    setSaving,
    formError,
    setFormError,
    deleteError,
    setDeleteError,
  };
}
