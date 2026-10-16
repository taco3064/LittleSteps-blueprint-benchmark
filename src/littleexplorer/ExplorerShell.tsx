import type { ExplorerTab } from '~app/littleexplorer/components/ExplorerTabBar';
import type { Page } from '~app/portal/domain/routes';
import { AccountButton } from '~app/account';
import Frame, {
  type ExplorerShellProps,
} from '~app/littleexplorer/components/ExplorerShell';
import { AppHomeButton } from '~app/portal';
import { goTo } from '~app/portal/services/navigate';

const TAB_ROUTES: Record<ExplorerTab, Page> = {
  development: 'littleexplorer',
  reminders: 'littleexplorer/reminders',
  diary: 'littleexplorer/diary',
  wiki: 'littleexplorer/wiki',
};

export default function ExplorerShell(props: ExplorerShellProps) {
  return (
    <Frame
      {...props}
      onSelectTab={(tab) => goTo(TAB_ROUTES[tab])}
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
  );
}
