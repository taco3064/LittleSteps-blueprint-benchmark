import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { ClinicSummaryView7 } from './ClinicSummaryView7';
interface ClinicSummaryView6Props {
  growthRows: {
    date: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
  }[];
}

export function ClinicSummaryView6({ growthRows }: ClinicSummaryView6Props) {
  return (
    <motion.section variants={listItem} className="panel mb-4">
      <h2>成長趨勢</h2>

      {growthRows.length === 0
        ? (
            <p className="text-ink-muted text-sm mt-4">尚無成長紀錄</p>
          )
        : (
            <ClinicSummaryView7 growthRows={growthRows} />
          )}
    </motion.section>
  );
}
