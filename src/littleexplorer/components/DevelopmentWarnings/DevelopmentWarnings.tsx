import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { DevelopmentWarning } from '~app/knowledge/domain/referenceModels';
import { listItem, tap } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littleexplorer;
interface DevelopmentWarningsProps {
  setWarningsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  warningsOpen: boolean;
  warning: DevelopmentWarning;
}

export default function DevelopmentWarnings({
  setWarningsOpen,
  warningsOpen,
  warning,
}: DevelopmentWarningsProps) {
  return (
    <motion.section
      variants={listItem}
      className="bg-explorer-clay/10 rounded-3xl p-5"
    >
      <motion.button
        type="button"
        whileTap={tap}
        onClick={() => setWarningsOpen(!warningsOpen)}
        aria-expanded={warningsOpen}
        className="w-full min-h-tap flex items-center gap-2 text-left"
      >
        <h3 className={`flex-1 ${THEME.body}`}>什麼時候該諮詢醫師</h3>
        <ChevronDown
          className={
            'w-5 h-5 shrink-0 text-explorer-bark/40 '
            + 'transition-transform '
            + (warningsOpen ? 'rotate-180' : '')
            + ''
          }
        />
      </motion.button>

      {warningsOpen && (
        <div className="mt-4 space-y-3">
          <ul className="space-y-2">
            {warning.signals.map((signal) => (
              <li key={signal} className={`text-sm flex gap-2 ${THEME.body}`}>
                <span className="text-explorer-clay-ink shrink-0">·</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
          <p
            className={`text-sm leading-relaxed border-t border-explorer-clay/20 pt-3 ${THEME.muted}`}
          >
            {warning.action}
          </p>
        </div>
      )}
    </motion.section>
  );
}
