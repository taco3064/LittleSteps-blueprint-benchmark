import { get, ref, update } from 'firebase/database';
import { ChildProfile } from '~app/domain/records';
import { database } from '../firebase';
import { fullChildDeletePaths } from './shared';

export function deleteChildOperation(userId: string | null) {
  /**
   * 刪除檔案。
   *
   * 一筆 root fan-out，不是一連串 remove。規則裡的 root 指的是「寫入前」的
   * 資料庫，而 childRecords/{childId} 與 childIndex/{childId} 的授權都是去
   * children/{childId}/members 查我在不在。所以先刪掉孩子本體，後面兩筆就會
   * 被拒——留下一份沒有任何人是成員、再也讀不到也刪不掉的健康紀錄，以及一個
   * 查得到卻加入不了的殘留代碼。同一筆裡每個路徑都對寫入前的狀態驗證，
   * 順序問題就不存在了。
   *
   * 整份刪除的條件是「建立者，或名單上最後一位成員」。其他成員刪掉的是自己的
   * 成員資格——那才是真的交回讀寫權限，光清掉自己的 childrenIds 只是從自己的
   * 名單上藏起來。建立者現在走得掉（規則只要求成員數不歸零，見
   * database.rules.json），所以最後一位成員有可能不是建立者；那時照樣要整份
   * 刪除，否則名單一空，這份健康紀錄就沒有任何人讀得到、也沒有任何人刪得掉。
   *
   * currentChildId 一起帶進同一筆。少了它，刪掉當下選取的檔案之後它仍然指著
   * 已經不存在的 id，currentChild 變成 undefined——即使還有另一個孩子，每一頁
   * 都會顯示「還沒有寶寶資料，請新增」，等於叫家長去建一個他明明已經有的檔案。
   *
   * 別人的 childrenIds 動不了：users/$uid 只有本人寫得動。共享的孩子被刪掉
   * 之後，對方殘留的參照由對方那端的 useUserChildren 自癒。
   */
  const deleteChild = async (childId: string, remainingChildIds: string[] = []) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // 讀不到本體有兩種可能：已經被建立者刪掉，或自己的成員資格被收回了。兩種
    // 都還是要清掉自己這一端的名單，否則被收回的家長會永遠卡著一個讀不到、
    // 又刪不掉的項目。
    const childSnapshot = await get(ref(database, `children/${childId}`)).catch(
      () => null,
    );

    const childData = childSnapshot?.exists()
      ? (childSnapshot.val() as ChildProfile)
      : null;

    // 名單上除了我還有誰。整份刪除的條件是「我是建立者」或「我是最後一位成員」。
    const others = Object.keys(childData?.members ?? {}).filter(
      (uid) => uid !== userId,
    );

    const updates: Record<string, unknown> = {
      [`users/${userId}/childrenIds/${childId}`]: null,
      [`users/${userId}/currentChildId`]:
        remainingChildIds.find((id) => id !== childId) ?? null,
    };

    if (childData && (childData.createdBy === userId || others.length === 0)) {
      Object.assign(updates, fullChildDeletePaths(childId));
    } else if (childData) {
      updates[`children/${childId}/members/${userId}`] = null;
    }

    await update(ref(database), updates);
  };

  return deleteChild;
}
