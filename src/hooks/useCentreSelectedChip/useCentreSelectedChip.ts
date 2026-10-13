import { useEffect, useRef } from 'react';

/**
 * 讓水平 chip 列自己把選中的那顆滾到中間。
 *
 * 預設選項一旦不是第一顆——例如「孩子現在的月齡」——它在 390px 上就會落在
 * 畫面外。家長看到的是前兩顆 chip，而且沒有一顆看起來被選中，於是以為
 * app 沒有幫他判斷。
 *
 * 刻意不用 `scrollIntoView({ inline: 'center' })`。它會往上找每一層可滾動的
 * 祖先，實測在 390px 下同時把整份文件往下拉了 124px；提醒頁的 chip 列位在
 * document y=4313，那一下會把畫面拋到幾千 px 之外。直接寫 scrollLeft 只動
 * 這一列。
 *
 * 用 rect 差值而不是 offsetLeft：這些 chip 列本身沒有定位，offsetParent 是
 * <body>，offsetLeft 會連置中欄位的 auto margin 一起算進去，在寬螢幕上會
 * 過度滾動。
 */
export function useCentreSelectedChip<T>(selected: T) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const chip = selectedRef.current;

    if (!scroller || !chip) {
      return;
    }

    const row = scroller.getBoundingClientRect();
    const box = chip.getBoundingClientRect();

    const centred
      = scroller.scrollLeft + (box.left - row.left) - (row.width - box.width) / 2;

    const left = Math.max(
      0,
      Math.min(centred, scroller.scrollWidth - scroller.clientWidth),
    );

    if (Math.abs(left - scroller.scrollLeft) < 1) {
      return;
    }

    // 明寫的 behavior: 'smooth' 會蓋過 index.css 的 reduced-motion 規則，
    // 所以這裡得自己問一次偏好。
    scroller.scrollTo({
      left,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, [selected]);

  return { scrollerRef, selectedRef };
}
