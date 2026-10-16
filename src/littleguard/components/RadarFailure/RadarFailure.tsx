import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import type { ReactNode } from 'react';
import AppBar from '~app/platform/components/AppBar';

import EmptyState from '~app/platform/components/EmptyState';

type Props = {
  theme: ServiceTheme;
  headerActions: ReactNode;
  onOpenStatistics: () => void;
};

export function RadarFailure({
  theme,
  headerActions,
  onOpenStatistics,
}: Props) {
  return (
    <div className={`screen ${theme.pageBg}`}>
      <AppBar
        theme={theme}
        title={theme.name}
        subtitle={theme.role}
        actions={headerActions}
      />
      {/* AppBar 留在 <main> 外面，它的 <header> 才算得上 banner 地標；
            同 BloomShell、ExplorerShell 與 OutingPage 的形狀。 */}
      <main className="screen-body">
        <EmptyState
          theme={theme}
          title="現在抓不到資料"
          description="可以先看疾管署的傳染病統計查詢系統。"
          action={{
            label: '前往疾管署',
            onClick: onOpenStatistics,
          }}
        />
      </main>
    </div>
  );
}
