import { useState } from 'react';
import type { ChildProfile } from '~app/family/domain/familyRecords';

import { confirmDelete } from '~app/platform/services/confirmation';

export interface ShareChildUuidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAbout: () => void;
  child: ChildProfile | null;
  /** 失敗時 reject 且不 toast：訊息要留在這扇窗裡，家長才知道剛才那一下沒生效。 */
  revokeOtherMembers: (childId: string) => Promise<void>;
  setJoinOpen: (childId: string, open: boolean) => Promise<void>;
}

export function useShareChildUuidModal({
  isOpen,
  onClose,
  onAbout: navigateAbout,
  child,
  revokeOtherMembers,
  setJoinOpen,
}: ShareChildUuidModalProps) {
  const [pending, setPending] = useState<'copy' | 'join' | 'revoke' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!child) {
    return null;
  }

  const memberCount = Object.keys(child.members).length;
  // 開關直接讀資料庫來的值，不留一份本地狀態：寫入失敗時它就不會停在
  // 資料庫沒有的位置上。
  const joinOpen = child.joinOpen === true;
  const busy = pending !== null;

  const handleCopy = async () => {
    setError(null);
    setPending('copy');
    let opened = joinOpen;

    try {
      // 先確定代碼真的能用，才把它交到家長手上：順序反過來的話，寫入失敗的人
      // 手上會有一組貼出去也加不進來的代碼，而且看不出哪裡不對。
      if (!opened) {
        await setJoinOpen(child.id, true);
        opened = true;
      }

      await navigator.clipboard.writeText(child.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        opened
          ? '複製失敗，請手動選取上方代碼'
          : '開放加入沒有成功，代碼現在還不能用，請再試一次',
      );
    } finally {
      setPending(null);
    }
  };

  const handleToggleJoin = async () => {
    setError(null);
    setPending('join');

    try {
      await setJoinOpen(child.id, !joinOpen);
    } catch {
      setError('設定沒有存到，開關維持原本的狀態，請再試一次');
    } finally {
      setPending(null);
    }
  };

  const handleRevoke = async () => {
    // 走共用的刪除確認：全 app 只有這一種攔阻的說法，收回存取權不該長出第二種。
    if (!confirmDelete(`其他 ${memberCount - 1} 個帳號的存取權`)) {
      return;
    }

    setError(null);
    setPending('revoke');

    try {
      await revokeOtherMembers(child.id);
    } catch {
      setError('移除沒有成功，其他帳號仍然看得到，請再試一次');
    } finally {
      setPending(null);
    }
  };

  const onAbout = () => {
    onClose();
    navigateAbout();
  };

  return {
    isOpen,
    onClose,
    child,
    pending,
    error,
    copied,
    memberCount,
    joinOpen,
    busy,
    handleCopy,
    handleToggleJoin,
    handleRevoke,
    onAbout,
  };
}
