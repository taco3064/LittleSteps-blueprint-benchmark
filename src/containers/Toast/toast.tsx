import { ToastContext, type ToastTone } from '~app/contexts/Toast';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';
interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

/**
 * 取代 window.alert。
 *
 * 原本 25 處失敗與確認訊息都用 alert：它會凍住整個分頁、樣式完全不受控、
 * 在已安裝的 PWA 裡跳出瀏覽器等級的對話框，而且一次只能顯示一則——手上抱著
 * 孩子的人得先騰出手點掉才能繼續。訊息本身多半只是「存檔失敗，請稍後再試」，
 * 不值得攔下整個畫面。
 *
 * 保留 window.confirm 不動：那是刪除前的攔阻，本來就該擋住去路。
 */

const AUTO_DISMISS_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, tone: ToastTone = 'error') => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        // z-[3000] 高於帳號視窗的 2500 與 BabyOasis 地圖的 2000：訊息若被
        // 蓋住就等於沒出現，而它常常正是在說某個動作失敗了。
        <div
          className={
            'fixed inset-x-0 bottom-0 z-[3000]'
            + ' pointer-events-none p-4 space-y-2'
          }
        >
          <AnimatePresence initial={false}>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18 }}
                className="pointer-events-auto max-w-2xl mx-auto"
              >
                <div
                  // 失敗訊息要打斷朗讀，成功訊息不必。
                  role="status"
                  aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
                  className="card flex items-start gap-3 shadow-soft-lg"
                >
                  {toast.tone === 'error'
                    ? (
                        <AlertCircle
                          className="w-5 h-5 shrink-0 mt-0.5 text-primary-dark"
                        />
                      )
                    : (
                        <CheckCircle2
                          className="w-5 h-5 shrink-0 mt-0.5 text-mint-dark"
                        />
                      )}
                  <p className="flex-1 text-sm text-ink">{toast.message}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                    aria-label="關閉訊息"
                    className="btn-icon -mr-1.5 -mt-1.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

/**
 * 拿不到 provider 時退回 alert 而不是丟例外。
 *
 * 這些呼叫點全都在報告失敗；為了「通知機制沒接上」而讓畫面直接壞掉，
 * 會把一個小失敗放大成整頁錯誤。單元測試單獨掛載元件時也走這條路。
 */
