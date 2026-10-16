import { WeeklyReport } from './WeeklyReport';

/**
 * Generate summary text in Traditional Chinese
 */
export function generateSummaryText(report: WeeklyReport): string {
  const parts: string[] = [];

  // Feeding summary
  if (report.feeding.avgDailyAmount > 0) {
    parts.push(`餵奶量平均每日 ${report.feeding.avgDailyAmount}ml`);
  } else if (report.feeding.avgDailyCount > 0) {
    parts.push(`平均每日餵奶 ${report.feeding.avgDailyCount} 次`);
  }

  // Sleep summary
  if (report.sleep.avgDailyHours > 0) {
    const sleepComment
      = report.sleep.avgDailyHours < report.sleep.recommendedHours
        ? '，略低於建議值，建議觀察作息'
        : '，符合建議範圍';

    parts.push(`睡眠時數平均 ${report.sleep.avgDailyHours} 小時${sleepComment}`);
  }

  // Poop summary
  if (report.poop.avgDailyCount > 0) {
    if (report.poop.longestGap > 48) {
      parts.push(
        `排便間隔最長達 ${Math.round(report.poop.longestGap)} 小時，需留意`,
      );
    } else {
      parts.push('排便規律正常');
    }
  }

  if (parts.length === 0) {
    return '尚無足夠資料產生摘要，請持續記錄寶寶的日常。';
  }

  return parts.join('。') + '。';
}
