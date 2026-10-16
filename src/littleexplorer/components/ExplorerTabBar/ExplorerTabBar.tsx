import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { BellRing, BookOpen, PenLine, Sprout } from 'lucide-react';
import { tap } from '~app/platform/components/Motion';

export type ExplorerTab = 'development' | 'reminders' | 'diary' | 'wiki';

interface TabDefinition {
  id: ExplorerTab;
  label: string;
  icon: LucideIcon;
}

/**
 * Data-driven so the bar stays one block of JSX rather than four copies,
 * mirroring how Sidebar declares its menuSections.
 */
const TABS: TabDefinition[] = [
  { id: 'development', label: '成長', icon: Sprout },
  {
    id: 'reminders',
    label: '提醒',
    icon: BellRing,
  },
  { id: 'diary', label: '日記', icon: PenLine },
  { id: 'wiki', label: '百科', icon: BookOpen },
];

interface ExplorerTabBarProps {
  active: ExplorerTab;
  onSelectTab: (tab: ExplorerTab) => void;
  /** 逾期＋到期的任務數；0 或未給則不顯示紅點 */
  reminderBadge?: number;
}

/**
 * Bottom navigation for LittleExplorer's four parallel tabs.
 *
 * Reports the selected tab; the root workflow owns route navigation.
 */
export default function ExplorerTabBar({
  active,
  reminderBadge = 0,
  onSelectTab,
}: ExplorerTabBarProps) {
  return (
    <nav
      className={
        'fixed bottom-0 left-0 right-0 z-40 bg-white border-t '
        + 'border-explorer-sand shadow-soft'
      }
    >
      <div className="flex pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          const showBadge = tab.id === 'reminders' && reminderBadge > 0;

          return (
            <motion.button
              key={tab.id}
              type="button"
              whileTap={tap}
              onClick={() => {
                onSelectTab(tab.id);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={
                'flex-1 min-h-[56px] flex flex-col items-center '
                + 'justify-center gap-1 transition-colors '
                + (isActive
                  ? 'text-explorer-sunbeam-ink'
                  : 'text-ink-muted hover:text-ink')
                + ''
              }
            >
              <span className="relative">
                <Icon
                  className={`w-6 h-6 ${isActive ? 'fill-explorer-sunbeam/20' : ''}`}
                />
                {showBadge && (
                  <span
                    className={
                      'absolute -top-2 -right-2.5 min-w-[20px] h-5 px-1 '
                      + 'rounded-full bg-explorer-clay-ink text-white text-xs '
                      + 'font-semibold flex items-center justify-center'
                    }
                    aria-label={`${reminderBadge} 項待處理`}
                  >
                    {reminderBadge > 9 ? '9+' : reminderBadge}
                  </span>
                )}
              </span>
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
