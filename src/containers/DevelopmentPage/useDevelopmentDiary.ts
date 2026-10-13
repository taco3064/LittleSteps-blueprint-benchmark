import { useState } from 'react';
import type { DevelopmentCheckItem } from '~app/domain/records';
import type { DevelopmentPageProps } from './useDevelopmentModel';

export function useDevelopmentDiary(
  { progress, onToggleCheck, onQuickDiary }: DevelopmentPageProps,
) {
  const [diaryFor, setDiaryFor] = useState<string | null>(null);
  const [diaryText, setDiaryText] = useState('');
  const [savedFor, setSavedFor] = useState<string | null>(null);
  const [diaryError, setDiaryError] = useState('');

  const handleToggle = async (item: DevelopmentCheckItem) => {
    const wasAchieved = progress[item.id]?.achieved === true;

    await onToggleCheck(item.id);

    if (!wasAchieved) {
      setDiaryFor(item.id);
      setDiaryText('');
    } else if (diaryFor === item.id) {
      setDiaryFor(null);
    }
  };

  const handleQuickDiary = async (item: DevelopmentCheckItem) => {
    const content = diaryText.trim();

    if (!content) {
      return;
    }

    setDiaryError('');

    try {
      await onQuickDiary(content, item.id);
    } catch {
      // 留著輸入框與文字：家長不必重打那一句話。
      setDiaryError('存不進日記，請稍後再試');

      return;
    }

    setDiaryFor(null);
    setDiaryText('');
    setSavedFor(item.id);
    window.setTimeout(() => setSavedFor((id) => (id === item.id ? null : id)), 2500);
  };

  return {
    diaryFor,
    setDiaryFor,
    diaryText,
    setDiaryText,
    savedFor,
    setSavedFor,
    diaryError,
    setDiaryError,
    handleToggle,
    handleQuickDiary,
  };
}
