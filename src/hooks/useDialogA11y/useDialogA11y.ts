import { useEffect, useRef } from 'react';

/**
 * Tab 走得到的東西。`:not([disabled])` 是關鍵：closeDisabled 期間關閉鈕會被
 * 停用，它同時就退出焦點環，不必另外寫一條規則。
 */
const FOCUSABLE
  = 'a[href],button:not([disabled]),input:not([disabled]),'
    + 'select:not([disabled]),textarea:not([disabled]),'
    + '[tabindex]:not([tabindex="-1"])';

/**
 * 對話框缺的那一半：Escape、焦點進出、Tab 關在裡面。
 *
 * `role="dialog"` 只是宣告，瀏覽器不會因此把焦點搬進來，也不會把 Tab 擋在
 * 裡面——那些一律要自己做。少了它們，鍵盤使用者打開表單後焦點還留在背後的
 * 頁面上，Tab 會一路走進被遮住的內容裡，而且沒有任何方式關掉。
 *
 * 住在 common/ui 而不是某一片覆蓋層裡：全站有三片（ModalFrame 的 sheet、
 * LittleSteps 的導覽抽屜、帳號與寶寶），而抽屜為了這個 hook 去 import
 * ModalFrame 是反向的依賴。抄成三份必定走鐘。
 */
export function useDialogA11y(
  isOpen: boolean,
  onClose: () => void,
  closeDisabled?: boolean,
) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // onClose 幾乎都是 inline arrow，每次 render 都是新身分。直接放進 deps 會讓
  // effect 反覆 cleanup／重跑，等於每次 render 都把焦點還回觸發按鈕。
  const latest = useRef({ onClose, closeDisabled });

  useEffect(() => {
    latest.current = { onClose, closeDisabled };
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const restoreTo = document.activeElement as HTMLElement | null;

    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      if (event.key === 'Escape') {
        if (latest.current.closeDisabled) {
          return;
        }

        event.preventDefault();
        latest.current.onClose();

        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      trapTab(event, dialog);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      restoreTo?.focus();
    };
  }, [isOpen]);

  return dialogRef;
}

function trapTab(event: KeyboardEvent, dialog: HTMLDivElement) {
  const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
  const active = document.activeElement;

  // 送出中只剩停用的按鈕時，焦點沒有地方可去，收回容器本身。
  if (focusables.length === 0) {
    event.preventDefault();
    dialog.focus();

    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  const leavingEdge = event.shiftKey
    ? active === first || active === dialog
    : active === last;

  if (!leavingEdge && dialog.contains(active)) {
    return;
  }

  event.preventDefault();
  (event.shiftKey ? last : first).focus();
}
