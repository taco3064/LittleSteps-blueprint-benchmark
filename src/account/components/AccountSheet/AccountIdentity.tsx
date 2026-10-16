import { LogOut } from 'lucide-react';
import type { AccountSheetProps } from './types';

export function AccountIdentity({ model }: AccountSheetProps) {
  const { user, onSignIn, handleSignOut } = model;

  return (
    <>
      {user
        ? (
            <div className="card flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-12 h-12 rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">
                  {user.displayName || '家長'}
                </p>
                <p className="text-sm text-ink-muted truncate">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-icon"
                title="登出"
                aria-label="登出"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )
        : (
            <div className="card">
              <p className="font-medium text-ink mb-1">登入後才能跨裝置同步</p>
              <p className="text-sm text-ink-muted mb-4">
                知識內容不需登入就能看；記錄下來的成長、疫苗與日誌需要帳號才存得住。
              </p>
              <button
                type="button"
                onClick={onSignIn}
                className="btn-primary w-full"
              >
                使用 Google 登入
              </button>
            </div>
          )}
    </>
  );
}
