interface Props {
  /** 含本週在內的最近 8 週就診率，缺值為 null。 */
  values: (number | null)[];
  label: string;
}

/** 上下各留 4 個單位的邊，1.5 寬的線才不會被 viewBox 切掉半邊。 */
const TOP = 4;
const BOTTOM = 28;

/**
 * 8 週折線。viewBox + w-full，不寫死像素——手機上固定寬高的圖表會溢出。
 * 不畫座標軸、不上色塊：它的工作是讓人看出「在升還是在降」，不是精讀數值。
 *
 * 三個決定值得記一下：
 *
 * 1. 缺值不內插。缺的那幾週只是不畫點，x 座標照原本的週次算，所以「中間斷了
 *    六週」不會被畫成「連續兩週在升」。少於兩點就整個不畫，一個點連不成趨勢，
 *    畫出來的線是編的。
 * 2. `preserveAspectRatio="none"`。只給 viewBox 的話 svg 會等比縮放並留白，
 *    線被擠在容器中間，w-full 等於白給。拉伸換來的線寬變形則用
 *    `vector-effect="non-scaling-stroke"` 抵掉，stroke 回到螢幕像素。
 * 3. 顏色用 `currentColor`。服務色住在 serviceTheme，一支通用折線不該知道
 *    LittleGuard 是靖藍。
 */
export default function Sparkline({ values, label }: Props) {
  // flatMap 得為每一週配一個包裝陣列；八個點的圖表不值得那些垃圾。
  const points: { value: number; index: number }[] = [];

  values.forEach((value, index) => {
    if (value !== null) {
      points.push({ value, index });
    }
  });

  if (points.length < 2) {
    return null;
  }

  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value));
  // 一路持平時 max - min 是 0，除下去整條路徑會變成 NaN 而消失。
  const span = max - min || 1;
  const lastWeek = values.length - 1;

  const path = points
    .map(({ value, index }, i) => {
      const x = (index / lastWeek) * 100;
      const y = BOTTOM - ((value - min) / span) * (BOTTOM - TOP);

      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className="w-full h-8"
      role="img"
      aria-label={label}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
