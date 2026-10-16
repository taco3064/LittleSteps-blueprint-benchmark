import { useState } from 'react';
import { bandForMonths } from '~app/family/domain/ageBands';
import type { ToddlerAgeBand } from '~app/knowledge/domain/referenceModels';

export function useDevelopmentForm(ageMonths: number) {
  const [band, setBand] = useState<ToddlerAgeBand>(() => bandForMonths(ageMonths));

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [warningsOpen, setWarningsOpen] = useState(false);
  const [diaryFor, setDiaryFor] = useState<string | null>(null);
  const [diaryText, setDiaryText] = useState('');
  const [savedFor, setSavedFor] = useState<string | null>(null);
  const [diaryError, setDiaryError] = useState('');

  return {
    band,
    setBand,
    expandedId,
    setExpandedId,
    warningsOpen,
    setWarningsOpen,
    diaryFor,
    setDiaryFor,
    diaryText,
    setDiaryText,
    savedFor,
    setSavedFor,
    diaryError,
    setDiaryError,
  };
}
