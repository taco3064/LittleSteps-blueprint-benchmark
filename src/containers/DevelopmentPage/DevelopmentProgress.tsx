import { motion } from 'framer-motion';
import { listItem } from '~app/domain/motion';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

import type { DevelopmentModel } from './useDevelopmentModel';

const THEME = SERVICE_THEME.littleexplorer;

export function DevelopmentProgress({ model }: { model: DevelopmentModel }) {
  const { bandItems, achievedCount } = model;

  return (
    <motion.section variants={listItem} className="panel">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className={THEME.body}>
          {'這個階段的 '}
          {bandItems.length}
          {' 件事'}
        </h2>
        <p className={`text-sm ${THEME.muted}`}>
          已經會了
          {' '}
          <span className="text-xl font-bold text-explorer-meadow-ink">
            {achievedCount}
          </span>
          {' '}
          件
        </p>
      </div>
      <div className="h-2.5 rounded-full bg-explorer-sand overflow-hidden">
        <div
          className="h-full rounded-full bg-explorer-meadow transition-all duration-500"
          style={{
            width: `${bandItems.length ? (achievedCount / bandItems.length) * 100 : 0}%`,
          }}
        />
      </div>
    </motion.section>
  );
}
