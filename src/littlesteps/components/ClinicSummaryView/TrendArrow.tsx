import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
} from 'lucide-react';
interface TrendArrowProps {
  current?: number;
  previous?: number;
}

export /**
 * Compute a trend arrow comparing current value to previous value.
 * Direction and magnitude are only carried by the glyph, so this one stays —
 * 也因此它需要一個文字替代，這份文件是要唸給醫師聽的。
 */
function TrendArrow({ current, previous }: TrendArrowProps) {
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
