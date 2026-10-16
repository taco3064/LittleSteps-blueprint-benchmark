import type { ReactNode } from 'react';
import AppBar from '~app/platform/components/AppBar';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import type { ExplorerTab } from '../ExplorerTabBar';
import ExplorerTabBar from '../ExplorerTabBar';

export interface ExplorerShellProps {
  active: ExplorerTab;
  childName?: string;
  /** 已格式化的年齡字串，例：2歲3個月 */
  ageLabel?: string;
  reminderBadge?: number;
  children: ReactNode;
}
interface ExplorerShellFrameProps extends ExplorerShellProps {
  actions: ReactNode;
  onSelectTab: (tab: ExplorerTab) => void;
}

/**
 * Chrome shared by LittleExplorer's four tabs: header, content slot, bottom
 * tab bar. Written once here so the four pages carry no chrome of their own.
 *
 * No back button — the tabs are siblings, there is no level above them.
 *
 * The gradient Sun badge that used to sit left of the wordmark on all four tabs
 * is gone; it was identical on every screen, so it carried no information and
 * only narrowed the title.
 */
export default function ExplorerShell({
  actions,
  onSelectTab,
  active,
  childName,
  ageLabel,
  reminderBadge,
  children,
}: ExplorerShellFrameProps) {
  const theme = SERVICE_THEME.littleexplorer;

  const subtitle = [childName ?? '小小探險家', ageLabel].filter(Boolean).join(' · ');

  return (
    <div className={`min-h-dscreen ${theme.pageBg}`}>
      <AppBar
        theme={theme}
        title={theme.name}
        subtitle={subtitle}
        actions={actions}
      />

      {/* pb-24 clears the fixed tab bar. */}
      <main className="screen-body space-y-4 pb-24">{children}</main>

      <ExplorerTabBar
        active={active}
        reminderBadge={reminderBadge}
        onSelectTab={onSelectTab}
      />
    </div>
  );
}
