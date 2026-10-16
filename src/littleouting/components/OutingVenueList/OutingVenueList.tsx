import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { Venue } from '~app/littleouting/domain/venueModels';

import { stagger } from '~app/platform/components/Motion';

import type { useOutingState } from '~app/littleouting/hooks/useOutingState';

/**
 * 一次最多畫幾張卡。全部縣市有 247 處，全畫出來手機會卡，而且家長也不會
 * 一路滑到底——超過就提示縮小範圍，比無限長的清單有用。
 */
const MAX_RENDERED = 30;

export function OutingVenueList({
  visible,
  renderVenue,
}: Pick<ReturnType<typeof useOutingState>, 'visible'> & {
  renderVenue: (venue: Venue) => ReactNode;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {visible.slice(0, MAX_RENDERED).map((venue) => renderVenue(venue))}
      {visible.length > MAX_RENDERED && (
        <p className="text-sm text-ink-muted text-center py-2">
          還有
          {' '}
          {visible.length - MAX_RENDERED}
          {' '}
          處。選一個縣市，或搜尋區域名稱。
        </p>
      )}
    </motion.div>
  );
}
