import { useState } from 'react';
import { confirmDelete } from '~app/domain/confirmDelete';
import { useAuth } from '~app/hooks/useAuth';
import { useOptionalChildStore } from '~app/hooks/useChildStoreContext';
import { useToast } from '~app/hooks/useToast';

export default function DeleteAccountButton({ onClose }: { onClose: () => void }) {
  const { user, deleteAccount } = useAuth();
  const store = useOptionalChildStore();
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!store || deleting) {
      return;
    }

    if (
      !confirmDelete(
        '這個帳號',
        '只有你一個人在用的寶寶資料與所有紀錄',
        // 共用的孩子留給對方，這句一定要在：少了它，唯一講得通的讀法是
        // 「全部刪掉」，而那會讓另一半的紀錄看起來也要跟著消失。
        '和家人共用的寶寶會留給他們，只把你從成員名單上移除。',
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      // 資料先刪、Auth 使用者後刪。反過來的話，使用者一消失就沒有任何身分回得去
      // 清那些節點——孩子的紀錄會留在資料庫裡，誰都讀不到也刪不掉。
      await store.deleteAccountData();

      // 重新驗證、登出與回到入口頁都在 deleteAccount 裡，失敗也由它出訊息。
      // 沒刪成功就把這張表留著：刪除的入口在這裡，而 WebView 那條路要家長
      // 重新登入——登入按鈕也在這張表上。
      if (await deleteAccount()) {
        onClose();
      }
    } catch {
      // 資料那一步沒過，所以 Auth 使用者還在，家長可以再試一次。store 記過 log。
      toast.show('帳號還沒刪掉，請稍後再試');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {user && store && (
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className={
            'btn-ghost w-full text-primary-dark hover:bg-primary-light'
            + ' disabled:opacity-60'
          }
        >
          {deleting ? '刪除中…' : '刪除帳號'}
        </button>
      )}
    </>
  );
}
