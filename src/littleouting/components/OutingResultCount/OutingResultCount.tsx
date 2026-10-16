import type { useOutingState } from '~app/littleouting/hooks/useOutingState';

/**
 * 一次最多畫幾張卡。全部縣市有 247 處，全畫出來手機會卡，而且家長也不會
 * 一路滑到底——超過就提示縮小範圍，比無限長的清單有用。
 */
const MAX_RENDERED = 30;

export function OutingResultCount(
  { visible }: Pick<ReturnType<typeof useOutingState>, 'visible'>,
) {
  return (
    <p className="text-xs text-ink-faint">
      共
      {' '}
      {visible.length}
      {' '}
      處
      {visible.length > MAX_RENDERED && `，先顯示 ${MAX_RENDERED} 處`}
    </p>
  );
}
