import { push, ref, type DatabaseReference } from 'firebase/database';
import { database } from '../firebase';
export {
  FEEDBACK_THROTTLED_MESSAGE,
  FEEDBACK_FAILED_MESSAGE,
} from '~app/domain/feedbackErrors';

/**
 * 新紀錄的 key 一律交給 push()。
 *
 * 原本是 `${prefix}_${Date.now()}`：共享的孩子有兩個家長（createdBy 就是為此
 * 存在），同一毫秒各寫一筆，後到的那筆會靜靜蓋掉對方的紀錄。push() 的 key 由
 * 客戶端產生且含隨機位元，兩端不會撞。
 *
 * 既有的 Date.now() key 原樣留著——讀取一律 Object.values 後照紀錄自己的時間
 * 排序，沒有任何地方把 key 的順序當成時間順序。
 */
export function newRecordRef(path: string): {
  recordRef: DatabaseReference;
  id: string;
} {
  const recordRef = push(ref(database, path));

  if (!recordRef.key) {
    throw new Error('無法產生紀錄編號');
  }

  return { recordRef, id: recordRef.key };
}

/** 規則擋下回饋時給家長看的話：每個帳號一分鐘一則，見 submitFeedback。 */

/** 其他失敗（斷線、SDK 例外）的一句；SDK 的原文對家長沒有意義。 */

/**
 * SDK 把規則的拒絕包成 message 以 PERMISSION_DENIED 開頭、code 也是它的 Error。
 * 兩個都看：測試裡的假 SDK 只給 message。
 */
export const isPermissionDenied = (error: unknown): boolean =>
  error instanceof Error
  && ((error as { code?: unknown }).code === 'PERMISSION_DENIED'
    || /permission_denied/i.test(error.message));

/**
 * 一份集合快照攤成陣列。
 *
 * 沒有任何紀錄時給空陣列，不是 undefined：匯出的檔案裡那三個 key 一定要在，
 * 缺 key 的話讀檔的人分不出「這個孩子沒有日記」與「當初匯出的版本沒有日記」。
 */
export function collectionRows<T>(snapshot: { val: () => unknown }): T[] {
  const value = snapshot.val();

  return value ? Object.values(value as Record<string, T>) : [];
}

/**
 * 一份檔案整份消失時要一起消失的三個節點。
 *
 * deleteChild 與 deleteAccountData 都要寫這一組，而漏掉其中任何一個都是同一種
 * 後果：一份沒有任何人是成員、再也讀不到也刪不掉的資料。所以只寫一次。
 */
export const fullChildDeletePaths = (
  childId: string,
): Record<string, null> => ({
  [`children/${childId}`]: null,
  // 紀錄搬出孩子本體之後，刪孩子不會再把它們一起帶走。少了這一筆，
  // childRecords/{childId} 會留在資料庫裡，而且沒有人是成員、沒有任何人
  // 讀得到或刪得掉——一份孩子的健康紀錄就這樣漏在那裡。
  [`childRecords/${childId}`]: null,
  // 索引跟著本體走，否則代碼還查得到、加入時卻只換到一則講不出原因的錯誤。
  [`childIndex/${childId}`]: null,
});
