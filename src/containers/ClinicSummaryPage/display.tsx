import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
} from 'lucide-react';

import { formatDate, formatTime } from '~app/domain/dateHelpers';

/** 這份摘要要帶去診間，所以產生時間必須連時刻一起顯示；日期部分沿用全站格式。 */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}

/**
 * Compute a trend arrow comparing current value to previous value.
 * Direction and magnitude are only carried by the glyph, so this one stays —
 * 也因此它需要一個文字替代，這份文件是要唸給醫師聽的。
 */
export function TrendArrow({
  current,
  previous,
}: {
  current?: number;
  previous?: number;
}) {
  if (current === undefined || previous === undefined) {
    return <span className="text-ink-faint">--</span>;
  }

  const diff = current - previous;
  const pct = previous !== 0 ? (diff / previous) * 100 : 0;

  if (Math.abs(pct) < 0.5) {
    return (
      <ArrowRight
        role="img"
        aria-label="持平"
        className="w-4 h-4 text-ink-faint inline-block"
      />
    );
  }

  // 先判方向、再判幅度。原本的順序讓 +0.5% 到 +1% 之間落到最後一個分支，
  // 於是「長大了 0.7%」在一份交給醫師的文件上畫成一個向下的箭頭。
  if (pct > 0) {
    return pct >= 5
      ? (
          <ArrowUp
            role="img"
            aria-label="明顯上升"
            className="w-4 h-4 text-mint-dark inline-block"
          />
        )
      : (
          <ArrowUpRight
            role="img"
            aria-label="上升"
            className="w-4 h-4 text-mint-dark inline-block"
          />
        );
  }

  return pct <= -5
    ? (
        <ArrowDown
          role="img"
          aria-label="明顯下降"
          className="w-4 h-4 text-primary-dark inline-block"
        />
      )
    : (
        <ArrowDownRight
          role="img"
          aria-label="下降"
          className="w-4 h-4 text-butter-dark inline-block"
        />
      );
}

export function PercentileBadge({ value }: { value?: number }) {
  if (value === undefined) {
    return null;
  }

  let bg = 'bg-mint-light text-mint-dark';

  if (value < 15) {
    bg = 'bg-butter-light text-butter-dark';
  } else if (value > 85) {
    bg = 'bg-secondary-light text-secondary-dark';
  }

  return (
    <span className={`tag ${bg}`}>
      P
      {Math.round(value)}
    </span>
  );
}

// ─── Sub-components ──────────────────────────────────────────

export function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-ink-muted mb-0.5">{label}</p>
      <p className="text-base font-medium text-ink">{value}</p>
    </div>
  );
}

export function MeasurementCard({
  label,
  value,
  percentile,
}: {
  label: string;
  value: string;
  percentile?: number;
}) {
  return (
    <div className="bg-secondary-light rounded-xl p-3 text-center">
      <p className="text-sm text-ink-muted mb-1">{label}</p>
      <p className="text-lg font-bold text-ink">{value}</p>
      {percentile !== undefined && (
        <div className="mt-1">
          <PercentileBadge value={percentile} />
        </div>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  small,
  loggedDays,
}: {
  label: string;
  value: string;
  small?: boolean;
  /** 這個數字用幾天的記錄算出來的。醫師看到的是平均，得看得到分母。 */
  loggedDays?: number;
}) {
  return (
    <div className="bg-warm-white rounded-xl p-3">
      <p className="text-sm text-ink-muted mb-1">{label}</p>
      <p className={`font-bold text-ink ${small ? 'text-sm' : 'text-lg'}`}>
        {value}
      </p>
      {loggedDays !== undefined && loggedDays > 0 && (
        <p className="text-xs text-ink-faint mt-0.5">
          {loggedDays}
          {' 天有記錄'}
        </p>
      )}
    </div>
  );
}
