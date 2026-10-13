import type { ActionContext } from './types';

export function deleteAccountDataAction({ user, firebaseChildren }: ActionContext) {
  const deleteAccountData = async () => {
    if (!user) {
      return;
    }

    try {
      await firebaseChildren.deleteAccountData();
    } catch (error) {
      console.error('刪除帳號的資料失敗:', error);

      throw error;
    }
  };

  return deleteAccountData;
}
