import { toLocalDateKey } from '../dateHelpers';

/**
 * 「逾期」其實混了兩件事，界線是這個檔案什麼時候建立的。
 *
 * 家長替兩歲的孩子建檔的那一刻，1 歲到 2 歲之間每一項健檢與疫苗都成了逾期，
 * 提醒頁與產檢頁因此開場就是一整面「已逾期 425 天」。但那些項目多半早就做完，
 * app 只是沒有那段歷史——把缺紀錄說成漏掉的預約，是在責怪家長沒做錯的事。
 *
 * 界線取到期日與建檔日的先後：
 *   到期日在建檔之後 → 家長用 app 的期間漏掉的，該喊。
 *   到期日在建檔之前 → app 看不到的過去，收起來讓家長有空再補。
 */

export interface OverdueSplit<T> {
  /** 建檔之後才到期、至今沒登記：真的逾期。 */
  overdue: T[];
  /** 建檔之前就到期：app 沒有那段紀錄，不是漏掉的預約。 */
  missingHistory: T[];
}

/**
 * 把清單裡 status 為 overdue 的項目依建檔日切成兩堆，其餘狀態兩堆都不收。
 * 純函式，兩堆都維持傳入的順序。
 *
 * `profileCreatedAt` 收 ChildProfile.createdAt（ISO 時間戳），在此換算成本地
 * 日曆日再比——直接拿字串前 10 碼是 UTC 日期，台灣凌晨建的檔會被算成前一天。
 *
 * 到期日與建檔日同一天算真的逾期：那天家長已經在用 app，不屬於它看不到的過去。
 * 缺 createdAt 時不切分，全部留在 overdue：沒有分界點就照舊提醒，
 * 也不要把家長確實漏掉的項目藏進收合區。
 */
export function splitOverdueByProfileStart<
  T extends { dueDate: string; status: string },
>(items: T[], profileCreatedAt?: string): OverdueSplit<T> {
  const profileStart = profileCreatedAt ? toLocalDateKey(profileCreatedAt) : '';
  const overdue: T[] = [];
  const missingHistory: T[] = [];

  for (const item of items) {
    if (item.status !== 'overdue') {
      continue;
    }

    // 兩邊都是 YYYY-MM-DD，字串比較就是日期比較。
    if (profileStart && item.dueDate < profileStart) {
      missingHistory.push(item);
    } else {
      overdue.push(item);
    }
  }

  return { overdue, missingHistory };
}
