import {
  push,
  ref,
  serverTimestamp,
  update,
  type DatabaseReference,
} from 'firebase/database';
import { database } from '~app/platform/services/firebase';

import {
  FEEDBACK_FAILED_MESSAGE,
  FEEDBACK_THROTTLED_MESSAGE,
  isPermissionDenied,
} from '~app/feedback/domain/feedbackErrors';

export function createSubmitFeedback(userId: string | null) {
  return async (feedback: {
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
}

function newRecordRef(path: string): {
  recordRef: DatabaseReference;
  id: string;
} {
  const recordRef = push(ref(database, path));

  if (!recordRef.key) {
    throw new Error('無法產生紀錄編號');
  }

  return { recordRef, id: recordRef.key };
}
