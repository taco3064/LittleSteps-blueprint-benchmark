import type { ReactNode } from 'react';
import ExplorerTabBar from '../ExplorerTabBar';
import AppBar from '../AppBar';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import AppHomeButton from '../AppHomeButton';
import AccountButton from '../AccountButton';
import type { ExplorerTab } from '../ExplorerTabBar';

interface ExplorerShellProps {
  active: ExplorerTab;
  childName?: string;
  /** 已格式化的年齡字串，例：2歲3個月 */
  ageLabel?: string;
  reminderBadge?: number;
  children: ReactNode;
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
  active,
  childName,
  ageLabel,
  reminderBadge,
  children,
}: ExplorerShellProps) {
  const theme = SERVICE_THEME.littleexplorer;
  const subtitle = [childName ?? '小小探險家', ageLabel].filter(Boolean).join(' · ');

  return (
    <div className={`min-h-dscreen ${theme.pageBg}`}>
      <AppBar
        theme={theme}
        title={theme.name}
        subtitle={subtitle}
        actions={(
          /* explorer-sand (#FDF8EE) is almost white, so the default neutral
             tint would disappear against the bar. */
          <>
            <AccountButton
              service="littleexplorer"
              className={
                'bg-explorer-sunbeam/25 hover:bg-explorer-sunbeam/40 '
                + 'text-explorer-sunbeam-ink'
              }
            />
            <AppHomeButton
              className={
                'bg-explorer-sunbeam/25 hover:bg-explorer-sunbeam/40 '
                + 'text-explorer-sunbeam-ink'
              }
            />
          </>
        )}
      />

      {/* pb-24 clears the fixed tab bar. */}
      <main className="screen-body space-y-4 pb-24">{children}</main>

      <ExplorerTabBar active={active} reminderBadge={reminderBadge} />
    </div>
  );
}
