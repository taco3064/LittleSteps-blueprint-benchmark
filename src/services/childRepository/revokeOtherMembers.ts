import { get, ref, update } from 'firebase/database';
import { ChildProfile } from '~app/domain/records';
import { database } from '../firebase';

export function revokeOtherMembersOperation(userId: string | null) {
  /**
   * 收回分享：把其他成員移出名單，並關掉加入。
   *
   * 代碼已經在對方手上，所以「收回」不是換一組代碼而是刪成員；joinOpen 要一起
   * 關掉，否則對方下一秒就用手上的同一組代碼加回來。同一筆 update，不會只成功
   * 一半。
   *
   * 建立者留著。「收回分享」是把我分享出去的人請出去，不是把當初建檔的人趕走。
   * 規則現在允許移除任何一位成員（只要名單不歸零），所以這是產品上的決定，
   * 不再是規則替我們擋著。
   */
  const revokeOtherMembers = async (childId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const childSnapshot = await get(ref(database, `children/${childId}`));

    const childData = childSnapshot.exists()
      ? (childSnapshot.val() as ChildProfile)
      : null;

    if (!childData) {
      throw new Error('找不到這個寶寶的資料，請重新整理後再試');
    }

    const updates: Record<string, unknown> = { joinOpen: false };

    for (const memberUid of Object.keys(childData.members ?? {})) {
      if (memberUid === userId || memberUid === childData.createdBy) {
        continue;
      }

      updates[`members/${memberUid}`] = null;
    }

    await update(ref(database, `children/${childId}`), updates);
  };

  return revokeOtherMembers;
}
