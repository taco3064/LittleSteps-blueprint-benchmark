import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { tap } from '~app/platform/components/Motion';

/**
 * 定位鈕。轉不轉圈由頁面決定，不是自己數秒。
 *
 * 先前這裡開一個兩秒的 setTimeout 停止轉圈：定位其實還在跑（或永遠不會回來），
 * 圖示卻停了，家長只能一直重按。轉圈必須跟著真正的定位結果走。
 */
export const LocateButton = ({
  onLocate,
  isLocating,
}: {
  onLocate: () => void;
  isLocating: boolean;
}) => (
  <motion.button
    onClick={onLocate}
    disabled={isLocating}
    aria-busy={isLocating}
    whileTap={tap}
    aria-label="定位我的位置"
    className={
      'absolute bottom-32 right-4 z-[1000] w-14 h-14 flex item'
      + 's-center justify-center bg-white rounded-full shadow-so'
      + 'ft hover:shadow-soft-lg transition-shadow'
    }
  >
    <Navigation
      className={`w-6 h-6 text-secondary-dark ${isLocating ? 'animate-spin' : ''}`}
    />
  </motion.button>
);
