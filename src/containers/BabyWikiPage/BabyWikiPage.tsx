import { WikiCategory } from '~app/domain/records';
import {
  babyWikiArticles,
  wikiCategoryLabels,
  babyWikiCategoryColors,
} from '~app/domain/babyWiki';
import WikiBrowser from '../WikiBrowser';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

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
    <div className="screen">
      <div className="screen-body">
        <p className="text-sm text-ink-muted mb-4">
          常見嬰幼兒照顧問題與處理方式，參考台灣兒科醫學指引
        </p>

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
      </div>
    </div>
  );
}
