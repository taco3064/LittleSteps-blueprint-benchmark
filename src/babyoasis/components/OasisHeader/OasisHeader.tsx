import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import 'leaflet/dist/leaflet.css';
import type { ReactNode } from 'react';

import AppBar from '~app/platform/components/AppBar';

import type { useBabyOasisState } from '~app/babyoasis/hooks/useBabyOasisState';

export function OasisHeader({
  theme,
  nursingRooms,
  loadState,
  isFiltered,
  filteredRooms,
  headerActions,
}: Pick<
  (ReturnType<typeof useBabyOasisState> & { theme: ServiceTheme }),
  'theme' | 'nursingRooms' | 'loadState' | 'isFiltered' | 'filteredRooms'
> & { headerActions: ReactNode }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000]">
      <AppBar
        theme={theme}
        title={theme.name}
        subtitle={
          loadState === 'ready'

            ? isFiltered

              ? `篩選後 ${filteredRooms.length} 處`

              : `全台 ${nursingRooms.length} 處哺乳室`

            : loadState === 'failed'

              ? '資料載入失敗'

              : '正在載入資料…'
        }
        actions={headerActions}
      />
    </div>
  );
}
