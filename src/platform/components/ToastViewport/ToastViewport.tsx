import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import type { Toast } from '~app/platform/domain/toast';

export function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  return createPortal(
    // z-[3000] 高於帳號視窗的 2500 與 BabyOasis 地圖的 2000：訊息若被
    // 蓋住就等於沒出現，而它常常正是在說某個動作失敗了。
    <div className="fixed inset-x-0 bottom-0 z-[3000] pointer-events-none p-4 space-y-2">
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
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-primary-dark" />
                  )
                : (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-mint-dark" />
                  )}
              <p className="flex-1 text-sm text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
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
  );
}
