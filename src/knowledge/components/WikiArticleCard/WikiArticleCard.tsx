import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import type {
  WikiArticle,
  WikiCategoryColors,
} from '~app/knowledge/domain/referenceModels';
import { getLucideIcon } from '~app/platform/components/LucideIcons';
import { collapse } from '~app/platform/components/Motion';
import { pressable } from '~app/platform/components/Pressable';
import type {
  PresentationTheme as ServiceTheme,
} from '~app/platform/domain/presentationTheme';

interface WikiArticleCardProps {
  article: WikiArticle;
  isExpanded: boolean;
  onToggle: () => void;
  /** Display label for the article's category; resolved by the owning sub-app. */
  categoryLabel: string;
  /** Category color scheme; resolved by the owning sub-app. */
  categoryColors: WikiCategoryColors;
  /** Optional situational label, e.g. whether this applies at the child's age. */
  tag?: string;
  theme: ServiceTheme;
}

/**
 * Presentational wiki card shared by every sub-app. It is deliberately
 * data-agnostic: the category label and colors are passed in, so it knows
 * nothing about baby-vs-pregnancy category sets. Each sub-app owns its own
 * categories, labels, colors and article data.
 */
export default function WikiArticleCard({
  article,
  isExpanded,
  onToggle,
  categoryLabel,
  categoryColors,
  tag,
  theme,
}: WikiArticleCardProps) {
  // 每篇文章的圖示都不一樣，在三十幾篇的長清單裡是用來重新找回某一列的記號，
  // 所以留著；但原本包在外面那層著色圓角方塊只是裝飾，而且分類已經有文字 pill。
  const IconComponent = getLucideIcon(article.icon);

  return (
    <motion.div
      layout
      className="card-tap overflow-hidden"
      {...pressable(onToggle, isExpanded)}
    >
      <WikiArticleCardView0Part1
        IconComponent={IconComponent}
        categoryColors={categoryColors}
        article={article}
        categoryLabel={categoryLabel}
        tag={tag}
        theme={theme}
        isExpanded={isExpanded}
      />

      <WikiArticleCardView0Part2 isExpanded={isExpanded} article={article} />
    </motion.div>
  );
}

function WikiArticleCardView0Part1({
  IconComponent,
  categoryColors,
  article,
  categoryLabel,
  tag,
  theme,
  isExpanded,
}: {
  IconComponent: LucideIcon;
  categoryColors: WikiCategoryColors;
  article: WikiArticle<string>;
  categoryLabel: string;
  tag: string | undefined;
  theme: ServiceTheme;
  isExpanded: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${categoryColors.text}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-ink">{article.title}</h3>
          <span className={`tag ${categoryColors.pill}`}>{categoryLabel}</span>
          {/* 情境標籤放在分類後面：它回答的是「這篇現在跟我有關嗎」，
                和分類是兩種不同的資訊，所以用服務色而不是分類色。 */}
          {tag && <span className={`tag ${theme.tint} ${theme.ink}`}>{tag}</span>}
        </div>
        <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">
          {article.summary}
        </p>
      </div>

      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 mt-1"
      >
        <ChevronDown className="w-5 h-5 text-ink-faint" />
      </motion.div>
    </div>
  );
}

function WikiArticleCardView0Part2({
  isExpanded,
  article,
}: {
  isExpanded: boolean;
  article: WikiArticle<string>;
}) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div {...collapse} className="overflow-hidden">
          <div className="mt-4 pt-4 space-y-4 border-t border-ink/5">
            {article.causes.length > 0 && (
              <div>
                <h4 className="text-ink mb-2">可能原因</h4>
                <ul className="space-y-1.5">
                  {article.causes.map((cause, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-ink-muted">
                      <span className="text-ink-faint flex-shrink-0">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-ink mb-2">處理方式</h4>
              <ol className="space-y-3">
                {article.solutions.map((solution, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span
                      className={
                        'flex-shrink-0 w-5 h-5 rounded-full bg-primary-light '
                        + 'text-primary-dark flex items-center justify-center text-xs '
                        + 'font-bold mt-0.5'
                      }
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium text-ink text-sm">
                        {solution.step}
                      </span>
                      <p className="text-sm text-ink-muted leading-relaxed mt-0.5">
                        {solution.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {article.warningSignals.length > 0 && (
              <div className="bg-primary-soft rounded-2xl p-3 border border-primary/30">
                <h4 className="text-primary-dark mb-2">就醫警訊</h4>
                <ul className="space-y-1.5">
                  {article.warningSignals.map((signal, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-primary-dark">
                      <span className="flex-shrink-0">•</span>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {article.relatedArticleIds.length > 0 && (
              <p className="text-xs text-ink-faint">
                有
                {' '}
                {article.relatedArticleIds.length}
                {' '}
                篇相關文章
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
