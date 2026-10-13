import type { ReactNode } from 'react';
import type { ServiceTheme } from '~app/domain/serviceTheme';
import AppBar from '../AppBar';
import { RadarHeaderActions } from './RadarHeaderActions';

export function RadarLayout({ theme, children, footer, spacious = false }: {
  theme: ServiceTheme;
  children: ReactNode;
  footer?: ReactNode;
  spacious?: boolean;
}) {
  return (
    <div className={`screen ${theme.pageBg}`}>
      <AppBar
        theme={theme}
        title={theme.name}
        subtitle={theme.role}
        actions={<RadarHeaderActions />}
      />
      <main className={spacious ? 'screen-body space-y-4' : 'screen-body'}>
        {children}
      </main>
      {footer}
    </div>
  );
}
