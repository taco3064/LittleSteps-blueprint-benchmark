import type { WikiArticle } from '../records';

/**
 * 一篇文章是否命中關鍵字。
 *
 * 涵蓋成因、處理步驟與警訊，不只標題與摘要：家長記得的往往是症狀的樣子
 * （「後腦杓一直流汗」），而不是文章叫什麼名字。
 *
 * 獨立成一個模組是為了讓跨知識庫搜尋用同一套判準——搜尋結果的寬鬆程度
 * 在「這個服務裡」和「其他階段」之間不一致，是最難解釋的那種怪。
 */
export function matchesKeyword(
  article: WikiArticle<string>,
  keyword: string,
): boolean {
  if (keyword === '') {
    return true;
  }

  return (
    article.title.toLowerCase().includes(keyword)
    || article.summary.toLowerCase().includes(keyword)
    || article.causes.some((cause) => cause.toLowerCase().includes(keyword))
    || article.solutions.some(
      (solution) =>
        solution.step.toLowerCase().includes(keyword)
        || solution.detail.toLowerCase().includes(keyword),
    )
    || article.warningSignals.some((signal) => signal.toLowerCase().includes(keyword))
  );
}
