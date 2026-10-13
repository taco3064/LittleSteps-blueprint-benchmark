import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { getLucideIcon } from '~app/domain/lucideIcons';
import EmptyState from '~app/components/EmptyState';
import { listItem, stagger } from '~app/domain/motion';
import type { ServiceTheme, ServiceId } from '~app/domain/serviceTheme';
import type { WikiArticle, WikiCategoryColors } from '~app/domain/records';
import WikiArticleCard from '~app/components/WikiArticleCard';
import CrossWikiResults from '../CrossWikiResults';
import { matchesKeyword } from '~app/domain/matchesKeyword';
import { queryFromLocation } from '~app/domain/crossWikiSearch';

/**
 * 三個知識庫的瀏覽介面：搜尋、分類篩選、篇數、空狀態、展開卡片。
 *
 * 原本 BabyWikiPage、ToddlerWikiPage、LittleBloomWikiPage 各自實作過一次，
 * 而且完成度不同——孕期知識庫累積到 24 篇時仍然只有搜尋框，沒有分類 chip
 * 也沒有空狀態，搜尋不到東西時畫面直接空白。三份分歧的複本就是這樣長出
 * 缺陷的，所以行為集中在這裡，各服務只帶入自己的資料與配色。
 *
 * 配色以 ServiceTheme 帶入。這裡原本另有一份 WikiTheme（focusRing、
 * chipActive、chipInactive、mutedText），但 focus ring 現在是全域的、chip 有
 * 共用的 .chip/.chip-on，於是那份等於是第二套並行的配色詞彙。
 *
 * 搜尋涵蓋成因、處理步驟與警訊，不只標題與摘要：使用者記得的往往是症狀
 * 描述而不是文章標題。
 */

/**
 * `Article` 也是型別參數，不只 `Category`：幼兒百科的文章多帶一個 `ageRange`，
 * 而 `articleTag` 需要看得到那個欄位。預設值讓另外兩個知識庫的呼叫端不受影響。
 */
interface WikiBrowserProps<
  Category extends string,
  Article extends WikiArticle<Category> = WikiArticle<Category>,
> {
  articles: readonly Article[];
  categoryLabels: Record<Category, string>;
  categoryColors: Record<Category, WikiCategoryColors>;
  /** chip 的顯示順序；省略時採用 categoryLabels 的鍵序 */
  categoryOrder?: readonly Category[];
  /** 各分類的 lucide 圖示名稱；省略時 chip 只顯示文字 */
  categoryIcons?: Record<Category, string>;
  searchPlaceholder: string;
  /**
   * 依情境為每篇加一個小標籤，回傳 undefined 就不顯示。
   *
   * 幼兒百科用它標出哪些文章符合孩子現在的月齡；另外兩個知識庫不傳，
   * 卡片就和以前一樣。排序由呼叫端決定——這裡照傳入順序渲染。
   */
  articleTag?: (article: Article) => string | undefined;
  theme: ServiceTheme;
  /**
   * 有給就一併搜其他兩個知識庫，並把結果列在自己的結果下面。
   *
   * 家長的問題不管服務邊界——在幼兒百科搜「發燒」卻看不到寶寶百科那幾篇，
   * 是把 85 篇查證過的文章切成三份互不相通的直接後果。
   */
  crossSearchService?: ServiceId;
}

export default function WikiBrowser<
  Category extends string,
  Article extends WikiArticle<Category> = WikiArticle<Category>,
>({
  articles,
  categoryLabels,
  categoryColors,
  categoryOrder,
  categoryIcons,
  searchPlaceholder,
  articleTag,
  theme,
  crossSearchService,
}: WikiBrowserProps<Category, Article>) {
  // 從別的知識庫帶著關鍵字跳過來時，要落在搜尋中間，不是從空白開始。
  const [query, setQuery] = useState(() => queryFromLocation(window.location.search));
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = categoryOrder ?? (Object.keys(categoryLabels) as Category[]);

  const filtered = useMemo(
    () => filterArticles(articles, category, query),
    [articles, category, query],
  );

  return (
    <div className="space-y-4">
      <WikiSearch {...{ query, setQuery, searchPlaceholder }} />
      <WikiCategories
        {...{ categories, category, categoryIcons, categoryLabels, theme }}
        onSelect={(value) => {
          setCategory(value);
          setExpandedId(null);
        }}
      />
      <p className={`text-xs ${theme.muted}`}>
        {'共 '}
        {filtered.length}
        {' 篇文章'}
      </p>

      {filtered.length === 0
        ? (
            <EmptyState
              theme={theme}
              title="找不到相關文章"
              description="請嘗試其他關鍵字或清除篩選條件"
            />
          )
        : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((article) => (
                  <motion.div key={article.id} layout variants={listItem} exit="hidden">
                    <WikiArticleCard
                      article={article}
                      isExpanded={expandedId === article.id}
                      onToggle={() =>
                        setExpandedId(expandedId === article.id ? null : article.id)}
                      categoryLabel={categoryLabels[article.category]}
                      categoryColors={categoryColors[article.category]}
                      tag={articleTag?.(article)}
                      theme={theme}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

      {crossSearchService && (
        <CrossWikiResults query={query} service={crossSearchService} theme={theme} />
      )}
    </div>
  );
}

function WikiSearch({
  query,
  setQuery,
  searchPlaceholder,
}: {
  query: string;
  setQuery: (query: string) => void;
  searchPlaceholder: string;
}) {
  return (
    <>
      <div className="relative">
        <Search
          className={
            'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ' + 'text-ink-faint'
          }
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          // 原生的 search 清除鍵會和右邊那顆 44px 清除鍵並排出現兩個叉。
          className={
            'w-full min-h-tap pl-11 pr-14 py-3 bg-white '
            + 'rounded-2xl shadow-soft text-sm text-ink '
            + 'placeholder-ink-faint '
            + '[&::-webkit-search-cancel-button]:appearance-none'
          }
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="清除搜尋"
            className="btn-icon absolute right-1 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
}

function filterArticles<Category extends string, Article extends WikiArticle<Category>>(
  articles: readonly Article[],
  category: Category | 'all',
  query: string,
) {
  const keyword = query.trim().toLowerCase();

  return articles.filter(
    (article) =>
      (category === 'all' || article.category === category)
      && matchesKeyword(article, keyword),
  );
}

function WikiCategories<Category extends string>({
  categories,
  category,
  categoryIcons,
  categoryLabels,
  theme,
  onSelect,
}: {
  categories: readonly Category[];
  category: Category | 'all';
  categoryIcons?: Record<Category, string>;
  categoryLabels: Record<Category, string>;
  theme: ServiceTheme;
  onSelect: (value: Category | 'all') => void;
}) {
  return (
    <>
      {/* data-testid：下面那一列刻意橫向捲動，E2E 要單獨量它，而不是算成整頁的
          水平溢出；捲動容器沒有角色也沒有可及名稱可選（docs/E2E_TEST_PLAN.md §6）。 */}
      {categories.length > 1 && (
        <div
          data-testid="scroll-row-wiki-categories"
          className="row-bleed flex gap-2 pb-1"
        >
          {(['all', ...categories] as const).map((value) => {
            const isActive = category === value;

            const iconName
              = value === 'all' ? 'LayoutGrid' : categoryIcons?.[value as Category];

            const Icon = iconName ? getLucideIcon(iconName) : undefined;

            return (
              <button
                key={value}
                type="button"
                onClick={() => onSelect(value as Category | 'all')}
                aria-pressed={isActive}
                className={`chip shrink-0 ${isActive ? `chip-on ${theme.fill} ${theme.fillText} border-transparent` : ''}`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>
                  {value === 'all' ? '全部' : categoryLabels[value as Category]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
