import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { tap } from '~app/domain/motion';

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
    className={'absolute bottom-32 right-4 z-[1000] w-14 h-14 flex '
      + 'items-center justify-center bg-white rounded-full '
      + 'shadow-soft hover:shadow-soft-lg transition-shadow'}
  >
    <Navigation
      className={`w-6 h-6 text-secondary-dark ${isLocating ? 'animate-spin' : ''}`}
    />
  </motion.button>
);
