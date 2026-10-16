import { useState } from 'react';
import { bandForMonths } from '~app/family/domain/ageBands';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { ToddlerAgeBand } from '~app/knowledge/domain/referenceModels';
const today = () => toLocalDateKey();

export function useRemindersForm(ageMonths: number) {
  const [band, setBand] = useState<ToddlerAgeBand>(() => bandForMonths(ageMonths));

  const [formFor, setFormFor] = useState<string | null>(null);
  const [completedDate, setCompletedDate] = useState(today);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [failure, setFailure] = useState<{
    taskId: string;
    message: string;
  } | null>(null);

  return {
    band,
    setBand,
    formFor,
    setFormFor,
    completedDate,
    setCompletedDate,
    location,
    setLocation,
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
