import { MIN_DAYS_FOR_SCORE } from './MIN_DAYS_FOR_SCORE';
import { ReportScore } from './ReportScore';
import { getScoreLabel } from './getScoreLabel';

export /**
 * 分數少於 MIN_DAYS_FOR_SCORE 天就不給——`score` 是 null，畫面顯示「資料不足」，
 * `label` 給的是下一步而不是評語。`loggedDays` 是分母，讀分數的人要看得到。
 */
function buildScore(loggedDays: number, score: number): ReportScore {
  if (loggedDays < MIN_DAYS_FOR_SCORE) {
    return { score: null, label: '再記幾天', loggedDays };
  }

  return { score, label: getScoreLabel(score), loggedDays };
}
