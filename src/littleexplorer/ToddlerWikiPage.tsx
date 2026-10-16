import { WikiBrowser } from '~app/portal';
import {
  toddlerWikiCategoryColors,
  toddlerWikiCategoryLabels, toddlerWikiArticles,
} from '~app/knowledge/domain/toddlerWiki';
import { useMemo, useState } from 'react';
import { TODDLER_MAX_MONTHS, TODDLER_MIN_MONTHS } from '~app/family/domain/ageBands';
import { correctedAgeMonths } from '~app/family/domain/correctedAge';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import type {
  ToddlerWikiArticle,
  ToddlerWikiCategory,
} from '~app/knowledge/domain/referenceModels';
import ToddlerWiki from '~app/littleexplorer/components/ToddlerWiki';
import {
  WIKI_STAGES,
  overlapsBand,
  relevanceTag,
  sortByRelevance,
  stageForMonths,
} from '~app/littleexplorer/domain/wikiRelevance';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import ExplorerShell from './ExplorerShell';

const CATEGORY_ICONS: Record<ToddlerWikiCategory, string> = {
  toilet: 'Bath',
  language: 'MessageCircle',
  emotion: 'Sparkles',
  eating: 'Soup',
  sleep: 'Moon',
  safety: 'ShieldCheck',
  health: 'Thermometer',
  preschool: 'Backpack',
};

const CATEGORY_ORDER: ToddlerWikiCategory[] = [
  'toilet',
  'language',
  'emotion',
  'eating',
  'sleep',
  'safety',
  'health',
  'preschool',
];

type StageFilter = string | 'all';

interface ToddlerWikiPageProps {
  currentChild?: ChildProfile | null;
  reminderBadge?: number;
}

/**
 * 幼兒百科：疑難雜症查詢。
 *
 * 不做年齡守門：查資料不需要先有孩子。
 *
 * 兩層篩選。年齡是上層——45 篇裡有 15 篇是階段性的（如廁訓練、入園準備、
 * 午睡、結巴），對一個 1 歲 2 個月的孩子還早得很，混在清單裡只是雜訊。
 * 分類是下層，維持原本的行為。
 *
 * 分三段而不是沿用成長檢核的五段：見 `WIKI_STAGES` 的說明——細分在這裡量不
 * 出東西，而三段剛好和「全部」並排成一列，手機上不必橫向滑動。
 *
 * 有孩子時預設落在他自己的那一段，一打開就是「現在該看的」；「全部」永遠在
 * 第一個位置，任何時候都回得去。
 *
 * 年齡篩選之所以不會藏住要緊的東西：橫跨整個幼兒期的內容（居家安全、哽噎、
 * 燒燙傷、熱痙攣、常備藥）區間都是 12-36，和每一段都有交集，所以任何一段都
 * 篩不掉它們。
 */
export default function ToddlerWikiPage({
  currentChild,
  reminderBadge,
}: ToddlerWikiPageProps) {
  // 分段對應的是發育階段（「這個年紀在鬧什麼」），所以早產兒用矯正年齡。
  const ageMonths = currentChild ? correctedAgeMonths(currentChild) : null;

  const inToddlerRange
    = ageMonths !== null
      && ageMonths >= TODDLER_MIN_MONTHS
      && ageMonths < TODDLER_MAX_MONTHS;

  const currentStage = inToddlerRange ? stageForMonths(ageMonths as number) : null;

  const [stage, setStage] = useState<StageFilter>(() => currentStage?.id ?? 'all');

  const articles = useMemo(() => {
    const picked = WIKI_STAGES.find((s) => s.id === stage);

    const withinStage = picked
      ? toddlerWikiArticles.filter((article) =>
          overlapsBand(article, picked.start, picked.end),
        )
      : toddlerWikiArticles;

    return ageMonths === null
      ? withinStage
      : sortByRelevance(withinStage, ageMonths);
  }, [stage, ageMonths]);

  /*
   * 分類籌碼只列這一段真的有文章的分類。
   *
   * 原本固定送整份 CATEGORY_ORDER 進 WikiBrowser，而年齡篩選是在這裡先做掉的
   * ——1 歲 2 個月的孩子預設落在 12-18 段，「如廁訓練」與「入園與社交」兩顆
   * 籌碼一按就是 0 篇，空狀態卻說「請嘗試其他關鍵字」，把年齡篩選的結果算到
   * 關鍵字頭上。
   */
  const categories = useMemo(() => {
    const present = new Set(articles.map((article) => article.category));

    return CATEGORY_ORDER.filter((category) => present.has(category));
  }, [articles]);

  const tagFor = useMemo(
    () =>
      ageMonths === null
        ? undefined
        : (article: ToddlerWikiArticle) => relevanceTag(article, ageMonths),
    [ageMonths],
  );

  const theme = SERVICE_THEME.littleexplorer;

  return (
    <ToddlerWiki
      ExplorerShell={ExplorerShell}
      currentChild={currentChild}
      reminderBadge={reminderBadge}
      stage={stage}
      setStage={setStage}
      theme={theme}
      currentStage={currentStage}
      browser={(
        <WikiBrowser
          key={categories.join('|')}
          articles={articles}
          categoryLabels={toddlerWikiCategoryLabels}
          categoryColors={toddlerWikiCategoryColors}
          categoryOrder={categories}
          categoryIcons={CATEGORY_ICONS}
          searchPlaceholder="搜尋幼兒照顧問題"
          articleTag={tagFor}
          theme={theme}
          crossSearchService="littleexplorer"
        />
      )}
    />
  );
}
