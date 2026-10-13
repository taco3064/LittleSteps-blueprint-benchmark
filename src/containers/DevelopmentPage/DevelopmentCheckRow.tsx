import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { tap } from '~app/domain/motion';
import type {
  DevelopmentCheckItem,
} from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

import { DevelopmentDiary } from './DevelopmentDiary';
import type { DevelopmentModel } from './useDevelopmentModel';

const THEME = SERVICE_THEME.littleexplorer;

export function DevelopmentCheckRow({ model, item }: {

  model: DevelopmentModel;
  item: DevelopmentCheckItem;
}) {
  const {
    progress,
    expandedId,
    setExpandedId,
    diaryFor,
    savedFor,
    diaryError,
    handleToggle,
  } = model;

  const achieved = progress[item.id]?.achieved === true;
  const isExpanded = expandedId === item.id;

  return (
    <li
      key={item.id}
      className="rounded-2xl bg-explorer-sand/60 py-1 pr-3"
    >
      {/* 勾選鍵佔滿左側 44px，之後每一層都用 pl-tap 對齊題目 */}
      <div className="flex items-start">
        <motion.button
          type="button"
          whileTap={tap}
          onClick={() => handleToggle(item)}
          aria-pressed={achieved}
          aria-label={`${achieved ? '取消' : '標記'}：${item.title}`}
          className="w-tap h-tap shrink-0 flex items-center justify-center"
        >
          <span
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
              achieved
                ? 'bg-explorer-meadow-ink border-explorer-meadow-ink text-white'
                : 'bg-white border-explorer-bark/25'
            }`}
          >
            {achieved && (
              <Check className="w-4 h-4" strokeWidth={3} />
            )}
          </span>
        </motion.button>

        <button
          type="button"
          onClick={() =>
            setExpandedId(isExpanded ? null : item.id)}
          aria-expanded={isExpanded}
          className="flex-1 min-h-tap flex items-center text-left py-1"
        >
          <span
            className={`text-sm ${achieved ? THEME.body : THEME.muted}`}
          >
            {item.title}
            <ChevronDown
              className={`inline-block w-4 h-4 ml-1 align-middle text-explorer-bark/40 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="pl-tap pr-1 pb-2 space-y-2">
          <p className={`text-sm leading-relaxed ${THEME.muted}`}>
            {item.detail}
          </p>
          <ul className="space-y-1">
            {item.tips.map((tip) => (
              <li
                key={tip}
                className={`text-sm flex gap-2 ${THEME.muted}`}
              >
                <span className="text-explorer-meadow-ink shrink-0">
                  ·
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diaryFor === item.id && (
        <DevelopmentDiary model={model} item={item} />
      )}

      {diaryFor === item.id && diaryError && (
        <p
          role="alert"
          className="pl-tap pb-2 text-xs text-primary-dark"
        >
          {diaryError}
        </p>
      )}

      {savedFor === item.id && (
        <p className="pl-tap pb-2 text-xs text-explorer-meadow-ink">
          已寫進日記
        </p>
      )}
    </li>
  );
}
