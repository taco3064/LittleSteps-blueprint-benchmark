import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { goTo } from '~app/domain/navigate';
import { listItem, tap } from '~app/domain/motion';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

const THEME = SERVICE_THEME.littleexplorer;

/**
 * 身高體重的成長曲線在哪裡。
 *
 * WHO 生長標準這份資料涵蓋 0-36 個月，整個幼兒期都用得上——但那一頁住在
 * LittleSteps，而 LittleExplorer 裡完全沒有任何地方提到它（grep 過，一處
 * 都沒有）。這個分頁本身叫「成長」，內容卻只有發展檢核，家長合理地會以為
 * 這個 app 的成長曲線只到一歲。
 *
 * 這是階段交棒而不是「要記錄請去別的服務」：紀錄本來就在同一份孩子資料上，
 * 只是那張圖畫在另一個服務裡。
 */
export default function GrowthCurveLink() {
  return (
    <motion.button
      variants={listItem}
      whileTap={tap}
      type="button"
      onClick={() => goTo('littlesteps/growth-charts')}
      className="card-tap w-full text-left"
    >
      <div className="flex items-center gap-3">
        <TrendingUp className={`w-5 h-5 shrink-0 ${THEME.ink}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`mb-1 ${THEME.body}`}>身高體重的成長曲線</h3>
          <p className={`text-sm ${THEME.muted}`}>
            WHO 生長標準到 3 歲都適用，百分位在 LittleSteps 的成長曲線圖。
          </p>
        </div>
        <ArrowRight className={`w-4 h-4 shrink-0 ${THEME.ink}`} />
      </div>
    </motion.button>
  );
}
