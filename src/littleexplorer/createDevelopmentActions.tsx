import type { DevelopmentCheckProgress } from '~app/family/domain/familyRecords';
import type { DevelopmentCheckItem } from '~app/knowledge/domain/referenceModels';

export function createDevelopmentActions({
  progress,
  onToggleCheck,
  setDiaryFor,
  setDiaryText,
  diaryFor,
  diaryText,
  setDiaryError,
  onQuickDiary,
  setSavedFor,
}: {
  progress: DevelopmentCheckProgress;
  onToggleCheck: (checkItemId: string) => Promise<void>;
  setDiaryFor: React.Dispatch<React.SetStateAction<string | null>>;
  setDiaryText: React.Dispatch<React.SetStateAction<string>>;
  diaryFor: string | null;
  diaryText: string;
  setDiaryError: React.Dispatch<React.SetStateAction<string>>;
  onQuickDiary: (content: string, linkedCheckItemId: string) => Promise<void>;
  setSavedFor: React.Dispatch<React.SetStateAction<string | null>>;
}) {
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

  return { handleToggle, handleQuickDiary };
}
