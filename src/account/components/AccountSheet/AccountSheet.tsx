import type { ReactNode } from 'react';
import { AccountChildren } from './AccountChildren';
import { AccountIdentity } from './AccountIdentity';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { backdrop, sheet } from '~app/platform/components/Motion';

import type { AccountViewModel } from './types';

export default function AccountSheet({
  model,
  onClose,
  onAbout,
  dialogs,
}: {
  dialogs: ReactNode;
  model: AccountViewModel;
  onClose: () => void;
  onAbout: () => void;
}) {
  const { user, canDeleteAccount, dialogRef, deleting, handleDeleteAccount } = model;

  return (
    <>
      <motion.div
        {...backdrop}
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 z-40"
      />
      <motion.div
        {...sheet}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="帳號與寶寶"
        tabIndex={-1}
        className={
          'fixed inset-x-0 bottom-0 bg-white rounded-t-3xl '
          + 'z-50 max-h-[85vh] overflow-y-auto'
        }
      >
        <div
          className={
            'sticky top-0 bg-white border-b border-ink/10 px-4 '
            + 'py-3 flex items-center justify-between gap-3'
          }
        >
          <h2>帳號與寶寶</h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="btn-icon bg-ink/5 hover:bg-ink/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <AccountIdentity model={model} />

          {/* 已登入的家長想確認資料怎麼被保護時，會來這裡找；未登入的人也
              該在交出帳號之前就看得到。 */}
          <button
            type="button"
            onClick={onAbout}
            className="btn-ghost w-full justify-between px-4"
          >
            <span className="text-ink">關於資料</span>
            <span className="text-sm text-ink-faint">存在哪裡、誰看得到</span>
          </button>

          <AccountChildren model={model} />

          {/* 放在整張表的最後，離右上角的登出最遠：兩個動作的後果差得太多，
              擠在一起就會有人誤按。整句文字而不是圖示——這裡沒有任何圖示
              說得比字清楚，而且它不該看起來像一個順手的動作。 */}
          {user && canDeleteAccount && (
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className={
                'btn-ghost w-full text-primary-dark '
                + 'hover:bg-primary-light disabled:opacity-60'
              }
            >
              {deleting ? '刪除中…' : '刪除帳號'}
            </button>
          )}
        </div>
      </motion.div>

      {dialogs}
    </>
  );
}
