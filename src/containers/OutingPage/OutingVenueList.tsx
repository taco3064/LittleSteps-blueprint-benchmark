import { motion } from 'framer-motion';
import VenueCard from '../VenueCard';
import { stagger } from '~app/domain/motion';

import { MAX_RENDERED } from './outingOptions';

import type { OutingModel } from './useOutingModel';

export function OutingVenueList({ model }: { model: OutingModel }) {
  const { visible } = model;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {visible.slice(0, MAX_RENDERED).map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
      {visible.length > MAX_RENDERED && (
        <p className="text-sm text-ink-muted text-center py-2">
          {'還有 '}
          {visible.length - MAX_RENDERED}
          {' 處。選一個縣市，或搜尋區域名稱。'}
        </p>
      )}
    </motion.div>
  );
}
