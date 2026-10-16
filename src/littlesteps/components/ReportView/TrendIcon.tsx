import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { TrendDirection } from '~app/littlesteps/domain/trendCalculator';
interface TrendIconProps {
  direction: TrendDirection;
}

export /**
 * Helper: render trend icon. Colour and shape together encode the value, so
 * this one stays.
 */
function TrendIcon({ direction }: TrendIconProps) {
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
