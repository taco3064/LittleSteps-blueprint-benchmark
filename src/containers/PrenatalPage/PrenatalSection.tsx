import { motion } from 'framer-motion';

import type { ResolvedPrenatalItem } from '~app/domain/prenatalSchedule';

import { listItem } from '~app/domain/motion';

import type { PrenatalEditor } from './usePrenatalEditor';
import { THEME } from './presentation';
import PrenatalItem from './PrenatalItem';

export default function PrenatalSection({
  title,
  rows,
  editor,
}: {
  title: string;
  rows: ResolvedPrenatalItem[];
  editor: PrenatalEditor;
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <motion.section variants={listItem}>
      <h2 className={`px-1 mb-2 ${THEME.body}`}>
        {title}
        <span className={`ml-2 text-sm font-normal ${THEME.muted}`}>
          {rows.length}
        </span>
      </h2>

      <ul className="space-y-3">
        {rows.map((item) => (
          <PrenatalItem key={item.template.id} item={item} editor={editor} />
        ))}
      </ul>
    </motion.section>
  );
}
