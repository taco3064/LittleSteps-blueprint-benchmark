import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

export function useDeleteAccountData({ user, firebaseChildren }: ChildActionContext) {
  return useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      await firebaseChildren.deleteAccountData();
    } catch (error) {
      console.error('刪除帳號的資料失敗:', error);

      throw error;
    }
  }, [user, firebaseChildren]);
}
