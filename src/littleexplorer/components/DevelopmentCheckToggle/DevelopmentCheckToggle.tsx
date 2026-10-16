import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import type { DevelopmentCheckItem } from '~app/knowledge/domain/referenceModels';
import { tap } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littleexplorer;
interface Props {
  handleToggle: (item: DevelopmentCheckItem) => Promise<void>;
  item: DevelopmentCheckItem;
  achieved: boolean;
  isExpanded: boolean;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function DevelopmentCheckToggle({
  handleToggle,
  item,
  achieved,
  isExpanded,
  setExpandedId,
}: Props) {
  return (
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
          {achieved && <Check className="w-4 h-4" strokeWidth={3} />}
        </span>
      </motion.button>

      <button
        type="button"
        onClick={() => setExpandedId(isExpanded ? null : item.id)}
        aria-expanded={isExpanded}
        className="flex-1 min-h-tap flex items-center text-left py-1"
      >
        <span className={`text-sm ${achieved ? THEME.body : THEME.muted}`}>
          {item.title}
          <ChevronDown
            className={`inline-block w-4 h-4 ml-1 align-middle text-explorer-bark/40 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>
    </div>
  );
}
