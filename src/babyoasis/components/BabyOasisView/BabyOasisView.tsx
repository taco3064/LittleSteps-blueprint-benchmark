import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import type { ReactNode } from 'react';
import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import type { useBabyOasisState } from '~app/babyoasis/hooks/useBabyOasisState';
import { LocateButton } from '../LocateButton';
import { NearbyRoomsSheet } from '../NearbyRoomsSheet';
import { OasisHeader } from '../OasisHeader';
import { OasisMap } from '../OasisMap';
import { OasisSearch } from '../OasisSearch';
import { RoomDetailSheet } from '../RoomDetailSheet';

type BabyOasisViewProps = ReturnType<typeof useBabyOasisState>
  & { headerActions: ReactNode } & {
    renderReport: (
      room: NursingRoom,
      onOpenChange: (open: boolean) => void,
    ) => ReactNode;
  };

export function BabyOasisView({
  userLocation,
  selectedRoom,
  setSelectedRoom,
  nursingRooms,
  loadState,
  showNearby,
  isLocating,
  filters,
  station,
  loadRooms,
  isFiltered,
  areaRooms,
  filteredRooms,
  origin,
  nearby,
  sortedRooms,
  closeRoom,
  closeNearby,
  handleFiltersChange,
  handleStation,
  handleLocate,
  headerActions,
  renderReport,
}: BabyOasisViewProps) {
  const theme = SERVICE_THEME.babyoasis;

  return (
    /* h-dscreen, not h-screen: 100vh counts the browser chrome that is
       physically covering the bottom of a phone screen, which pushed the
       locate button and sheet handles under it. */
    <div className="relative h-dscreen w-full overflow-hidden">
      {/* Sits above Leaflet's panes, hence the z-[1000]. */}
      {/* 標題列自成一層，不跟底下的內容共用容器：<header> 只有在不位於 <main>
          之內時才算 banner 地標，而這一頁的主要內容（搜尋、地圖、面板）就是
          底下那個 <main>。 */}
      <OasisHeader
        headerActions={headerActions}
        theme={theme}
        nursingRooms={nursingRooms}
        loadState={loadState}
        isFiltered={isFiltered}
        filteredRooms={filteredRooms}
      />

      {/* h-full：地圖那一層是 h-full，要有一個有高度的父層才量得到。這一層
          不設 position，底下 absolute 的定位鈕與搜尋列因此仍然以最外層那個
          relative 容器為準，位置與先前完全一樣。 */}
      <main className="h-full">
        {/* 搜尋列掛在標題列下方，畫面下緣要留給定位鈕與地圖的資料來源標註。
            搜尋列先前是接在標題列後面自然流下來的，現在標題列在另一層，只好
            自己定位；top-16 是 AppBar 講好的掛法（見 AppBar.tsx 與 DiaryPage
            的月份分隔），它對的是 4rem 的本體，不含底下那條 1px 的分隔線，
            所以搜尋列比先前高 1px。
            外層不吃指標事件，否則搜尋列旁邊的透明留白會把地圖的拖曳攔下來。 */}
        <OasisSearch
          theme={theme}
          setSelectedRoom={setSelectedRoom}
          loadState={loadState}
          filters={filters}
          station={station}
          loadRooms={loadRooms}
          areaRooms={areaRooms}
          sortedRooms={sortedRooms}
          handleFiltersChange={handleFiltersChange}
          handleStation={handleStation}
        />

        {/* Map */}
        {/* data-testid 掛在外層而不是 MapContainer：Leaflet 是用 JS 直接把地圖畫進
            這個 div，畫出來的東西沒有角色也沒有可及名稱可以選；而 MapContainer 只
            轉傳 className/id/style，其餘的 prop 都當成 Leaflet 的設定值。
            E2E 的選取規則見 docs/E2E_TEST_PLAN.md §6。 */}
        <OasisMap
          userLocation={userLocation}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          nursingRooms={nursingRooms}
          station={station}
          isFiltered={isFiltered}
          filteredRooms={filteredRooms}
        />

        {/* Locate me button */}
        <LocateButton onLocate={handleLocate} isLocating={isLocating} />

        {/* 附近清單：以定位或選定的捷運站為原點，用空間索引取最近幾筆並顯示實際
            距離。資料還沒到就先不開——那時清單只會說「沒有已登記的哺乳室」，
            等於謊報。 */}
        <AnimatePresence>
          {showNearby && origin && !selectedRoom && loadState === 'ready' && (
            <NearbyRoomsSheet
              nearby={nearby}
              title={origin.title}
              emptyText={origin.emptyText}
              onSelect={setSelectedRoom}
              onClose={closeNearby}
            />
          )}
        </AnimatePresence>

        {/* Room detail bottom sheet */}
        <AnimatePresence>
          {selectedRoom && (
            <RoomDetailSheet
              renderReport={renderReport}
              room={selectedRoom}
              onClose={closeRoom}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
