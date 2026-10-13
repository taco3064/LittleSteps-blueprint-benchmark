import { useEffect, useRef } from 'react';

export const ROOM_SHEET_TITLE_ID = 'babyoasis-room-sheet-title';
export const NEARBY_SHEET_TITLE_ID = 'babyoasis-nearby-sheet-title';

export const useSheetDialog = (onClose: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  // 只在掛載時搶一次焦點。若跟著 onClose 重跑，每次 render 都會把焦點拉回
  // 面板本身，家長就捲不動裡面的清單了。
  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return ref;
};

export const IGNORE_ESCAPE = () => {};
