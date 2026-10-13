import { ref, serverTimestamp, update } from 'firebase/database';
import { database } from '../firebase';
import {
  FEEDBACK_FAILED_MESSAGE,
  FEEDBACK_THROTTLED_MESSAGE,
  isPermissionDenied,
  newRecordRef,
} from './shared';

export function submitFeedbackOperation(userId: string | null) {
  /**
   * 回饋與 users/$uid/lastFeedbackAt 是同一筆 multi-path 更新，不能拆成兩筆。
   *
   * feedbacks 是唯一任何登入者都寫得進去的節點，而登入對每一個 Google 帳號
   * 開放：沒有上限的話，一支迴圈就能把 Spark 方案的儲存額度寫滿，而回饋沒有
   * 人讀得到，所以不會有人發現。規則的解法是每個帳號一分鐘一則：feedbacks 的
   * .write 從同一筆寫入裡讀自己的 lastFeedbackAt（newData.parent()），要求它
   * 等於伺服器的 now，而 lastFeedbackAt 自己的 validate 又要求比上一次晚 60 秒。
   * 戳記交給 serverTimestamp()，客戶端填的數字永遠對不上 now。
   *
   * 分開寫的話，單獨的回饋那一筆讀不到戳記，一定被擋。
   */
  const submitFeedback = async (feedback: {
    title: string;
    content: string;
    userId: string;
    /**
     * 聯絡方式是選填的：只有家長在表單上勾了「讓我們可以回覆你」才會帶上來。
     * 沒勾就整個鍵都不出現——規則把這兩個欄位當選填，而空字串是它收得下、也
     * 會照樣存起來的字串，那等於沒問就送。
     */
    userEmail?: string;
    userName?: string;
  }) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { id } = newRecordRef('feedbacks');
    const now = new Date().toISOString();

    const feedbackData = {
      id,
      ...feedback,
      timestamp: now,
      createdAt: now,
    };

    try {
      await update(ref(database), {
        [`feedbacks/${id}`]: feedbackData,
        [`users/${userId}/lastFeedbackAt`]: serverTimestamp(),
      });
    } catch (error) {
      // 表單這一側能造成的拒絕只剩一種：一分鐘內送過。userId 是自己的 uid，
      // 欄位長度在表單就已經封頂。伺服器那一側還有兩個不在表單手上的原因——
      // 帳號在 app 開著的時候被停用（auth 變成 null），或 App Check 開始強制
      // 執行後 reCAPTCHA 載不進來——它們也回 PERMISSION_DENIED，這裡會說錯話。
      throw new Error(
        isPermissionDenied(error)
          ? FEEDBACK_THROTTLED_MESSAGE
          : FEEDBACK_FAILED_MESSAGE,
      );
    }

    return id;
  };

  return submitFeedback;
}
