import EmptyState from '~app/components/EmptyState';
import RoomSearch from '~app/components/RoomSearch';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { useOasisState } from '~app/hooks/useOasisState';

export function OasisSearch({ state }: { state: ReturnType<typeof useOasisState> }) {
  const {
    setSelectedRoom,
    loadState,
    filters,
    station,
    loadRooms,
    areaRooms,
    sortedRooms,
    handleFiltersChange,
    handleStation,
  } = state;

  const theme = SERVICE_THEME.babyoasis;

  return (
    <div className={'absolute top-16 left-0 right-0 z-[1000] max-w-2xl mx-auto '
      + 'px-4 pt-3 pointer-events-none'}
    >
      {loadState === 'ready'
        ? (
            <RoomSearch
              rooms={sortedRooms}
              areaRooms={areaRooms}
              theme={theme}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              station={station}
              onStationChange={handleStation}
              onSelect={setSelectedRoom}
            />
          )
        : (
      /* 資料沒到就不給搜尋框：對空陣列搜尋每次都回「找不到符合的哺乳室」，
               等於把「還在載入」和「載入失敗」都說成這一帶沒有哺乳室。 */
            <div className="pointer-events-auto">
              {loadState === 'failed'
                ? (
                    <EmptyState
                      theme={theme}
                      title="哺乳室資料載入失敗"
                      description="地圖上還沒有任何哺乳室。請確認網路連線後再試一次。"
                      action={{ label: '重新載入', onClick: loadRooms }}
                    />
                  )
                : (
                    <div className="panel" role="status">
                      <p className="text-sm text-ink-muted">正在載入全台哺乳室資料…</p>
                    </div>
                  )}
            </div>
          )}
    </div>
  );
}
