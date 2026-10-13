import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import EmptyState from '~app/components/EmptyState';
import { listItem } from '~app/domain/motion';
import { goTo } from '~app/domain/navigate';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

const THEME = SERVICE_THEME.littleexplorer;

export function DevelopmentGraduation() {
  return (
    <motion.div variants={listItem}>
      <EmptyState
        theme={THEME}
        icon={PartyPopper}
        title="已經滿 3 歲了"
        description={
          // 原本只說「告一段落」就結束了，等於把家長送進一條死路。
          // 實際上還有事要做：疫苗時程在 48 與 60 個月還有 3 劑，
          // 而幼兒百科的文章沒有年齡限制，隨時查得到。
          '幼兒期的成長追蹤告一段落，紀錄都留著。\n滿 5 歲前還有幾劑疫苗要打，時程在 LittleSteps 的疫苗追蹤；百科文章隨時都能回來看。'
        }
        action={{
          label: '看疫苗時程',
          onClick: () => {
            goTo('littlesteps/vaccine-tracking');
          },
        }}
      />
    </motion.div>
  );
}
