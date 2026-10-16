import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import type { ReactNode } from 'react';

import AppBar from '~app/platform/components/AppBar';

import type { useOutingState } from '~app/littleouting/hooks/useOutingState';

export function OutingHeader({
  theme,
  headerActions,
}: Pick<
  (ReturnType<typeof useOutingState> & { theme: ServiceTheme }),
  'theme'
> & { headerActions: ReactNode }) {
  return (
    <AppBar
      theme={theme}
      title={theme.name}
      subtitle={theme.role}
      actions={headerActions}
    />
  );
}
