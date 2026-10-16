import { motion } from 'framer-motion';
import {
  STATUS_COPY,
  statusOf,
  type DiseaseCell,
} from '~app/littleguard/domain/radar';
import type { RadarCell } from '~app/littleguard/domain/radarModels';
import { listItem } from '~app/platform/components/Motion';

interface Props {
  disease: string;
  cell: RadarCell;
  /** 這一列底下的表現（腸病毒的手足口病與疱疹性咽峽炎）；沒有就不給。 */
  parts?: readonly DiseaseCell[];
  /** 資料過期時只留數字，不顯示可能已經錯的狀態。 */
  showStatus: boolean;
  onOpen: () => void;
}

/**
 * 一種病一列。
 *
 * 狀態是文字不是圖示：文案本身已經帶方向（變多／差不多／比平常少），再加一個
 * 箭頭只是把同一件事說兩次，而四個並排的上升箭頭本身就是一組警報視覺。
 *
 * 文案與顏色一律從 STATUS_COPY 取，這裡不列任何狀態名單——radar.ts 之後再多
 * 幾個狀態，這一列都不用改，也不會漏掉哪一個。
 *
 * 右邊只留人次。「169.0/萬」是板上唯一一個家長沒辦法拿來做任何事的數字，而多
 * 還是少已經由狀態文案講完了；把它拿掉，390px 的卡片內寬（約 326px）也就不必
 * 再為了「疱疹性咽峽炎 ＋ 最近變多，多留意 ＋ 169.0/萬 ＋ 35 人次」擠在同一列
 * 而縮字級。左邊病名配狀態、右邊人次，還是兩欄。
 *
 * parts 那一行小字是家長不用點進來就拿得到的答案：手足口病與疱疹性咽峽炎不是
 * 另外兩種病，是同一批就診人次的兩種表現，都算在這一列裡面。
 */
export default function DiseaseRow({
  disease,
  cell,
  parts,
  showStatus,
  onOpen,
}: Props) {
  const copy = STATUS_COPY[statusOf(cell)];

  return (
    <motion.button
      type="button"
      variants={listItem}
      onClick={onOpen}
      className={
        'card-tap w-full min-h-tap flex items-start '
        + 'justify-between gap-3 text-left'
      }
    >
      <span className="min-w-0">
        <span className="block text-ink font-medium">{disease}</span>
        {parts && parts.length > 0 && (
          <span className="block text-xs text-ink-faint">
            {`含${parts.map((part) => part.disease).join('、')}`}
          </span>
        )}
        {showStatus && (
          <span className={`block text-sm mt-0.5 ${copy.tone}`}>{copy.label}</span>
        )}
      </span>
      <span className="shrink-0 text-ink tabular-nums">
        {cell.visits}
        {' 人次'}
      </span>
    </motion.button>
  );
}
