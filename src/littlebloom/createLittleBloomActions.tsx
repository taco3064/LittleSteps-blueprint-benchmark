import type { Gender } from '~app/family/domain/familyRecords';

export function createLittleBloomActions({
  dateProblem,
  setBirthSaving,
  setBirthError,
  onRecordBirth,
  birthDate,
  birthGender,
  setBirthOpen,
}: {
  dateProblem: string | null;
  setBirthSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setBirthError: React.Dispatch<React.SetStateAction<string>>;
  onRecordBirth: (birthday: string, gender?: Gender) => Promise<void>;
  birthDate: string;
  birthGender: '' | Gender;
  setBirthOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const submitBirth = async () => {
    // 按鈕已經停用，這裡再擋一次：這個寫入沒有回頭路。
    if (dateProblem) {
      return;
    }

    setBirthSaving(true);
    setBirthError('');

    try {
      await onRecordBirth(birthDate, birthGender || undefined);
      setBirthOpen(false);
    } catch (error) {
      console.error('登記出生失敗:', error);
      setBirthError('儲存失敗，請確認網路後再試一次。');
    } finally {
      setBirthSaving(false);
    }
  };

  return { submitBirth };
}
