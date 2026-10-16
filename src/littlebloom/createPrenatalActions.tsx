import type { usePrenatalForm } from '~app/littlebloom/hooks/usePrenatalForm';
import type { PrenatalPageProps } from './PrenatalPage';
type Options = ReturnType<typeof usePrenatalForm>
  & Pick<PrenatalPageProps, 'onComplete' | 'onUndo'>;

export function createPrenatalActions(p: Options) {
  const submit = async (templateId: string) => {
    if (p.saving) {
      return;
    }

    p.setSaving(true);
    p.setFailure(null);

    try {
      await p.onComplete(templateId, {
        completedDate: p.completedDate,
        clinicName: p.clinicName.trim() || undefined,
        notes: p.notes.trim() || undefined,
      });

      p.setFormFor(null);
    } catch (error) {
      console.error('儲存產檢記錄失敗:', error);

      p.setFailure({
        templateId,
        message: '儲存失敗，剛才填的內容還在，請確認網路後再送出。',
      });
    } finally {
      p.setSaving(false);
    }
  };

  const undo = async (templateId: string) => {
    if (p.saving) {
      return;
    }

    p.setSaving(true);
    p.setFailure(null);

    try {
      await p.onUndo(templateId);
    } catch (error) {
      console.error('取消產檢記錄失敗:', error);
      p.setFailure({ templateId, message: '取消失敗，請確認網路後再試一次。' });
    } finally {
      p.setSaving(false);
    }
  };

  return { submit, undo };
}
