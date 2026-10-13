import { motion } from 'framer-motion';
import {
  domainLabels,
} from '~app/domain/developmentChecks';
import { listItem } from '~app/domain/motion';
import type {
  DevelopmentCheckItem,
  DevelopmentDomain,
} from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

import { DevelopmentCheckRow } from './DevelopmentCheckRow';
import type { DevelopmentModel } from './useDevelopmentModel';

const THEME = SERVICE_THEME.littleexplorer;

export function DevelopmentChecks({ model, domain, items }: {

  model: DevelopmentModel;
  domain: DevelopmentDomain;
  items: DevelopmentCheckItem[];
}) {
  return (
    <motion.section key={domain} variants={listItem} className="panel">
      <h3 className={`mb-3 ${THEME.body}`}>{domainLabels[domain]}</h3>

      <ul className="space-y-2">
        {items.map((item) => {
          return (
            <DevelopmentCheckRow key={item.id} model={model} item={item} />
          );
        })}
      </ul>
    </motion.section>
  );
}
