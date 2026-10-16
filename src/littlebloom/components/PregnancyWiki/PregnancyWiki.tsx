import { motion } from 'framer-motion';
import { fadeInUp } from '~app/platform/components/Motion';
import type { BloomShellProps } from '../BloomShell';

interface PregnancyWikiProps {
  browser: React.ReactNode;
  BloomShell: React.ComponentType<BloomShellProps>;
}

export default function PregnancyWiki({ BloomShell, browser }: PregnancyWikiProps) {
  return (
    <BloomShell
      title="孕期知識庫"
      subtitle="常見孕期疑問與處理方式"
      backTo="littlebloom"
    >
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        {browser}
      </motion.div>
    </BloomShell>
  );
}
