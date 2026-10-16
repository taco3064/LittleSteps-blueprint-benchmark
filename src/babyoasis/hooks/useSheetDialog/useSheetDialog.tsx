import { useEffect, useRef } from 'react';

/**
 * 兩張底部面板共用的對話框行為：Escape 關得掉，開啟時焦點會進到面板裡。
 *
 * 不借 ModalFrame——那是置中的對話框，形狀和貼齊下緣、蓋著地圖的面板不同；
 * 這裡需要的只是它的鍵盤行為。
 */
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
