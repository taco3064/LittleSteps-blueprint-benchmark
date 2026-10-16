import { WikiCategory } from '~app/knowledge/domain/referenceModels';

import {
  babyWikiArticles,
  babyWikiCategoryColors,
  wikiCategoryLabels,
} from '~app/knowledge/domain/babyWiki';

import { WikiBrowser } from '~app/portal';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

import { BabyWikiView } from '~app/littlesteps/components/BabyWikiView';

const CATEGORY_ORDER: WikiCategory[] = [
  'skin',
  'oral',
  'motor',
  'digestive',
  'fever',
  'sleep',
  'daily',
];

const CATEGORY_ICONS: Record<WikiCategory, string> = {
  skin: 'Droplets',
  oral: 'Smile',
  motor: 'Footprints',
  digestive: 'Soup',
  fever: 'Thermometer',
  sleep: 'Moon',
  daily: 'Sun',
};

export default function BabyWikiPage() {
  return (
    <BabyWikiView>
      <WikiBrowser
        articles={babyWikiArticles}
        categoryLabels={wikiCategoryLabels}
        categoryColors={babyWikiCategoryColors}
        categoryOrder={CATEGORY_ORDER}
        categoryIcons={CATEGORY_ICONS}
        searchPlaceholder="搜尋症狀、關鍵字..."
        theme={SERVICE_THEME.littlesteps}
        crossSearchService="littlesteps"
      />
    </BabyWikiView>
  );
}
