import { useContext } from 'react';
import { ChildStoreContext } from '~app/contexts/ChildStore';
import type { ChildStore } from '~app/domain/childStore';

export function useChildStoreContext(): ChildStore {
  const store = useContext(ChildStoreContext);

  if (!store) {
    throw new Error('useChildStoreContext 必須在 ChildStoreProvider 之內使用');
  }

  return store;
}

/**
 * 帳號視窗用這個。
 *
 * AccountButton 掛在每個服務的 AppBar 上，而那些 shell 會被單元測試單獨
 * 掛載——那時沒有 provider，也不需要有：那些測試驗的是頁面內容，不是切換
 * 寶寶。拿不到 store 就只顯示帳號區塊，而不是讓整個 shell 炸掉。
 *
 * 真正接線錯誤仍然會被上面那個嚴格版本在 App 啟動時抓到。
 */
export function useOptionalChildStore(): ChildStore | null {
  return useContext(ChildStoreContext);
}
