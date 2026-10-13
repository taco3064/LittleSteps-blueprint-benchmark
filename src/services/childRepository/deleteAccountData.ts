import { get, ref, remove, update } from 'firebase/database';
import { ChildProfile } from '~app/domain/records';
import { database } from '../firebase';
import { fullChildDeletePaths } from './shared';

export function deleteAccountDataOperation(userId: string | null) {
  /**
   * 刪除帳號的資料端。
   *
   * Auth 使用者本身由 AuthContext 的 deleteAccount 刪掉，而且一定排在這之後：
   * Auth 使用者一消失，這個客戶端就沒有任何身分再回來清資料，剩下的節點誰都
   * 碰不到。
   *
   * 一筆 root fan-out，理由與 deleteChild 相同——規則驗的是寫入前的 root。每個
   * 孩子分兩種情況：
   *
   * - 名單上只有我 → 整份刪掉，連紀錄與索引。少了這一步，帳號刪完會留下一份
   *   沒有任何成員、誰都讀不到也刪不掉的健康紀錄。
   * - 還有別人 → 只交回我的成員資格，孩子留給還在用它的家人。即使那份檔案是
   *   我建的也一樣：規則只要求成員數不歸零。
   *
   * 讀不回來的孩子跳過：成員資格早就被收回了，那一端沒有東西要清，而我自己的
   * childrenIds 反正整個節點一起刪。
   *
   * lastFeedbackAt 排在授權之後，跟 addChild 的 childIndex 同一個理由：它進不了
   * 上面那一筆。規則只在戳記過了節流窗口（60 秒）之後才允許刪除，因為「刪掉戳記
   * 再送一則」正是灌爆 feedbacks 的走法。所以在剛送出回饋的一分鐘內刪帳號，會
   * 留下這一個時間戳——防灌水比清掉一個整數重要，而那個整數除了「上次回饋的
   * 時間」以外什麼都不是。刪不掉不算刪帳號失敗，只記一行 log。
   */
  const deleteAccountData = async () => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const childIdsSnapshot = await get(ref(database, `users/${userId}/childrenIds`));

    const childIds = Object.keys(
      (childIdsSnapshot.val() as Record<string, true> | null) ?? {},
    );

    const children = await Promise.all(
      childIds.map(async (childId) => {
        const snapshot = await get(ref(database, `children/${childId}`)).catch(
          () => null,
        );

        return {
          childId,
          data: snapshot?.exists() ? (snapshot.val() as ChildProfile) : null,
        };
      }),
    );

    const updates: Record<string, unknown> = {
      [`users/${userId}/childrenIds`]: null,
      [`users/${userId}/currentChildId`]: null,
    };

    for (const { childId, data } of children) {
      if (!data) {
        continue;
      }

      const others = Object.keys(data.members ?? {}).filter((uid) => uid !== userId);

      if (others.length === 0) {
        Object.assign(updates, fullChildDeletePaths(childId));
      } else {
        updates[`children/${childId}/members/${userId}`] = null;
      }
    }

    await update(ref(database), updates);

    await remove(ref(database, `users/${userId}/lastFeedbackAt`)).catch((error) => {
      console.error(
        '清掉回饋節流戳記失敗（還在節流窗口內，規則不允許刪除）:',
        error,
      );
    });
  };

  return deleteAccountData;
}
