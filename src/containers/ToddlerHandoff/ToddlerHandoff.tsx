import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { goTo } from '~app/domain/navigate';
import { listItem, tap } from '~app/domain/motion';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

const EXPLORER = SERVICE_THEME.littleexplorer;

/**
 * 滿一歲之後，告訴家長幼兒期的服務已經接手了。
 *
 * app 一直知道生日，卻從來沒說過這件事：LittleSteps 的里程碑資料只到 12 個
 * 月，LittleExplorer 從 12 個月開始，而整個 LittleSteps 裡沒有任何一處提到
 * LittleExplorer 存在。滿一歲的家長於是停在一個已經沒有新內容的服務裡，
 * 完全不知道發展檢核、兒童健檢與塗氟提醒在另一邊。
 *
 * 不做「一次性通知」：這是導覽而不是提示，沒有需要記住已讀狀態的東西，
 * 也就不必為了它引入一套偏好儲存。滿一歲之後它一直有用。
 */
export default function ToddlerHandoff({ childName }: { childName: string }) {
  return (
    <motion.button
      variants={listItem}
      whileTap={tap}
      type="button"
      onClick={() => goTo('littleexplorer')}
      className={`card-tap w-full text-left mb-4 ${EXPLORER.tint}`}
    >
      <div className="flex items-center gap-3">
        <EXPLORER.icon className={`w-5 h-5 shrink-0 ${EXPLORER.ink}`} />
        <div className="flex-1 min-w-0">
          <h3 className="mb-1">
            {childName}
            滿一歲了，幼兒期由 LittleExplorer 接手
          </h3>
          <p className="text-sm text-ink-muted">
            1-3 歲的發展檢核、兒童健檢與塗氟提醒都在那裡。這裡的紀錄都會留著。
          </p>
        </div>
        <ArrowRight className={`w-4 h-4 shrink-0 ${EXPLORER.ink}`} />
      </div>
    </motion.button>
  );
}
