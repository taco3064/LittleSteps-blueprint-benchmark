import { useCallback } from 'react';
import type { useChildDraft } from './useChildDraft';

export function useChildWrite(
  { setSaving, setError }: ReturnType<typeof useChildDraft>,
  onClose: () => void,
) {
  return useCallback(
    async (write: () => void | Promise<void>) => {
      setSaving(true);
      setError('');

      try {
        await write();
        onClose();
      } catch {
        // 呼叫端已經跳過提示，這裡只解釋視窗為什麼還開著。
        setError('儲存失敗，請確認網路後再試一次。');
      } finally {
        setSaving(false);
      }
    },
    [setSaving, setError, onClose],
  );
}
