import { TrendDirection } from '~app/littlesteps/domain/trendCalculator';

export /**
 * Helper: translate trend direction
 */
function trendLabel(direction: TrendDirection): string {
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
