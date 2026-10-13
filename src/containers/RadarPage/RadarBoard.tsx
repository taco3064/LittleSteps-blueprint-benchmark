import { motion } from 'framer-motion';
import DiseaseRow from '~app/components/DiseaseRow';
import { stagger } from '~app/domain/motion';

import type { RadarModel } from './useRadarModel';

export function RadarBoard({ model }: { model: RadarModel }) {
  const { setOpen, freshness, board } = model;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {board.map((row) => (
        <DiseaseRow
          key={row.disease}
          disease={row.disease}
          cell={row.cell}
          parts={row.parts}
          showStatus={freshness !== 'expired'}
          onOpen={() => setOpen(row.disease)}
        />
      ))}
    </motion.div>
  );
}
