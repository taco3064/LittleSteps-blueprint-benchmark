/**
 * 分享結果。
 *
 * 這是一個純函式，拿不到 toast 的 hook，所以它只回報發生了什麼，由呼叫端
 * 決定要不要說話——原本它自己 alert('已複製到剪貼簿！')，等於一個 util
 * 直接接管了畫面。
 *
 * 'cancelled' 和 'failed' 分開：使用者在系統分享面板上按取消，不是失敗，
 * 不該收到「分享失敗，請稍後再試」。
 */
export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/**
 * 有系統分享面板就用它，沒有就退回剪貼簿。
 *
 * `url` 是選用的：里程碑要帶上 app 連結推薦給其他家長，看診摘要不要——
 * 那份文字是要給醫師看的，塞一個推薦連結進去很奇怪。
 */
export async function shareText(
  title: string,
  text: string,
  url?: string,
): Promise<ShareOutcome> {
  if (navigator.share) {
    try {
      await navigator.share(url ? { title, text, url } : { title, text });

      return 'shared';
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return 'cancelled';
      }

      console.error('分享失敗:', error);

      return 'failed';
    }
  }

  try {
    await navigator.clipboard.writeText(url ? `${text} ${url}` : text);

    return 'copied';
  } catch (error) {
    console.error('複製失敗:', error);

    return 'failed';
  }
}

export async function shareMilestone(title: string): Promise<ShareOutcome> {
  return shareText(
    'LittleSteps - 育兒里程碑',
    `我的寶貝達成了【${title}】里程碑了！推薦給新手父母的育兒神器：`,
    window.location.href,
  );
}
