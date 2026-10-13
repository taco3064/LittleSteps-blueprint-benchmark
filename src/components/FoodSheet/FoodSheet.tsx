import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { sheet, backdrop } from '~app/domain/motion';

/** 與疫苗頁參考表相同的 bottom sheet。 */
export default function FoodSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <motion.div
        {...backdrop}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        {...sheet}
        className={
          'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 '
          + 'max-h-[85vh] overflow-y-auto'
        }
      >
        <div
          className={
            'sticky top-0 bg-white border-b border-ink/10 px-4 '
            + 'py-3 flex items-center justify-between gap-3'
          }
        >
          <h2>{title}</h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="btn-icon bg-ink/5 hover:bg-ink/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">{children}</div>
      </motion.div>
    </>
  );
}
