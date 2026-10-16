import { WikiBrowser } from '~app/portal';
import type { PregnancyWikiCategory } from '~app/knowledge/domain/referenceModels';
import {
  pregnancyWikiArticles,
  pregnancyWikiCategoryColors,
  pregnancyWikiCategoryLabels,
} from '~app/knowledge/domain/wiki';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import PregnancyWiki from '~app/littlebloom/components/PregnancyWiki';
import BloomShell from './BloomShell';

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
    <PregnancyWiki
      BloomShell={BloomShell}
      browser={(
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
      )}
    />
  );
}
