import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { useOasisState } from '~app/hooks/useOasisState';
import AccountButton from '../AccountButton';
import AppBar from '../AppBar';
import AppHomeButton from '../AppHomeButton';

export function OasisHeader({ state }: { state: ReturnType<typeof useOasisState> }) {
  const { nursingRooms, loadState, isFiltered, filteredRooms } = state;
  const theme = SERVICE_THEME.babyoasis;

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
        actions={(
          <>
            <AccountButton service="babyoasis" />
            <AppHomeButton />
          </>
        )}
      />
    </div>
  );
}
