import { motion } from 'framer-motion';
import type { PregnancyWikiCategory } from '~app/domain/records';
import {
  pregnancyWikiArticles,
  pregnancyWikiCategoryLabels,
  pregnancyWikiCategoryColors,
} from '~app/domain/pregnancyWiki';
import WikiBrowser from '../WikiBrowser';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { fadeInUp } from '~app/domain/motion';
import BloomShell from '../BloomShell';

const CATEGORY_ORDER: PregnancyWikiCategory[] = [
  'checkup',
  'symptoms',
  'nutrition',
  'health',
  'lifestyle',
];

const CATEGORY_ICONS: Record<PregnancyWikiCategory, string> = {
  checkup: 'Stethoscope',
  symptoms: 'Activity',
  nutrition: 'Apple',
  health: 'Heart',
  lifestyle: 'Sun',
};

export default function LittleBloomWikiPage() {
  return (
    <BloomShell
      title="孕期知識庫"
      subtitle="常見孕期疑問與處理方式"
      backTo="littlebloom"
    >
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <WikiBrowser
          articles={pregnancyWikiArticles}
          categoryLabels={pregnancyWikiCategoryLabels}
          categoryColors={pregnancyWikiCategoryColors}
          categoryOrder={CATEGORY_ORDER}
          categoryIcons={CATEGORY_ICONS}
          searchPlaceholder="搜尋孕期症狀、關鍵字..."
          theme={SERVICE_THEME.littlebloom}
          crossSearchService="littlebloom"
        />
      </motion.div>
    </BloomShell>
  );
}
