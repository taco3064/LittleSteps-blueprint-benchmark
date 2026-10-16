import { useState } from 'react';
import { toLocalDateKey } from '~app/platform/domain/calendar';
const today = () => toLocalDateKey();

export function usePrenatalForm() {
  const [formFor, setFormFor] = useState<string | null>(null);
  const [completedDate, setCompletedDate] = useState(today);
  const [clinicName, setClinicName] = useState('');
  const [notes, setNotes] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [failure, setFailure] = useState<{
    templateId: string;
    message: string;
  } | null>(null);

  return {
    formFor,
    setFormFor,
    completedDate,
    setCompletedDate,
    clinicName,
    setClinicName,
    notes,
    setNotes,
    historyOpen,
    setHistoryOpen,
    saving,
    setSaving,
    failure,
    setFailure,
  };
}
