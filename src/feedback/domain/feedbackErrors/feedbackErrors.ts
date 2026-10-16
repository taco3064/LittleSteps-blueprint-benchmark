/** 規則擋下回饋時給家長看的話：每個帳號一分鐘一則，見 submitFeedback。 */
export const FEEDBACK_THROTTLED_MESSAGE = '剛剛才送出過一次，請稍後再試';

/** 其他失敗（斷線、SDK 例外）的一句；SDK 的原文對家長沒有意義。 */
export const FEEDBACK_FAILED_MESSAGE = '提交失敗，請稍後再試';

/**
 * SDK 把規則的拒絕包成 message 以 PERMISSION_DENIED 開頭、code 也是它的 Error。
 * 兩個都看：測試裡的假 SDK 只給 message。
 */
export const isPermissionDenied = (error: unknown): boolean =>
  error instanceof Error
  && ((error as { code?: unknown }).code === 'PERMISSION_DENIED'
    || /permission_denied/i.test(error.message));
