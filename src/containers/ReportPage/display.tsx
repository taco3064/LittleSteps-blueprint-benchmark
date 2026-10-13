import type { WeeklyReport } from '~app/domain/reportGenerator';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { TrendDirection } from '~app/domain/trendCalculator';
import { CONSISTENCIES, getConsistencyLabel } from '~app/domain/logHelpers';

/**
 * Helper: format date string YYYY-MM-DD to MM/DD
 */
export function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('-');

  if (parts.length < 3) {
    return dateStr;
  }

  return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
}

/**
 * Helper: generate date labels for the last N days (oldest first)
 */
export function generateDateLabels(days: number): string[] {
  const labels: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    labels.push(`${month}/${day}`);
  }

  return labels;
}

/**
 * 平均只用「有記錄的日子」算。天數比整段期間少的時候要講出來，否則
 * 「平均每日」這句話的分母會悄悄換掉，而讀數字的人不知道。
 */
export function LoggedDaysNote({
  loggedDays,
  periodDays,
}: {
  loggedDays: number;
  periodDays: number;
}) {
  if (loggedDays === 0 || loggedDays >= periodDays) {
    return null;
  }

  return (
    <div className="text-xs text-ink-faint mt-0.5">
      {loggedDays}
      {' 天有記錄'}
    </div>
  );
}

/**
 * Helper: render trend icon. Colour and shape together encode the value, so
 * this one stays.
 */
export function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === 'increasing') {
    return <TrendingUp className="w-4 h-4 text-primary-dark" />;
  }

  if (direction === 'decreasing') {
    return <TrendingDown className="w-4 h-4 text-mint-dark" />;
  }

  // 「資料不足」和「穩定」都用中性符號，但下面的文字必須分得出來——
  // 把沒記錄的日子講成「穩定」，等於拿沒有的資料下結論。
  return <Minus className="w-4 h-4 text-ink-faint" />;
}

/**
 * Helper: translate trend direction
 */
export function trendLabel(direction: TrendDirection): string {
  if (direction === 'increasing') {
    return '上升';
  }

  if (direction === 'decreasing') {
    return '下降';
  }

  if (direction === 'insufficient-data') {
    return '記錄不足';
  }

  return '穩定';
}

/**
 * Helper: translate poop consistency
 *
 * `consistencyDistribution` 的 key 是資料裡有什麼就是什麼，所以舊資料帶進一個
 * 不認識的值時原樣印出來，而不是印成空白或吞掉那一列。認得的那三個一律走共用
 * 的標籤：這裡若自己寫一份，同一筆紀錄在時間軸和報告裡就會有兩種說法。
 */
export function consistencyLabel(key: string): string {
  const known = CONSISTENCIES.find((value) => value === key);

  return known ? getConsistencyLabel(known) : key;
}

export function hasReportData(report: WeeklyReport | null) {
  return (
    report
    && (report.feeding.avgDailyCount > 0
      || report.sleep.avgDailyHours > 0
      || report.poop.avgDailyCount > 0
      || report.pumping !== undefined)
  );
}
