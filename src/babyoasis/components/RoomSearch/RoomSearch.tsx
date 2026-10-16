import { useMemo, useState } from 'react';
import type { MrtStation } from '~app/babyoasis/domain/mrtStations';
import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { NO_FILTERS, type RoomFilters } from '~app/babyoasis/domain/roomFilters';
import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import AreaPicker from '../AreaPicker';
import MrtPicker from '../MrtPicker';
import { RoomFilterChips } from '../RoomFilterChips';
import { RoomQuery } from '../RoomQuery';
import { RoomResults } from '../RoomResults';
export { NO_FILTERS, type RoomFilters } from '~app/babyoasis/domain/roomFilters';

/**
 * 篩選條件由頁面持有：標記、附近清單與這份結果清單必須是同一批哺乳室，
 * 三個地方各自篩一次就會各自漂走。
 */
interface RoomSearchProps {
  /** 已經套過 filters 的哺乳室，並且已按距離或區域排好序。 */
  rooms: readonly NursingRoom[];
  /**
   * 區域選單用來算縣市與各行政區筆數的來源：套過類型與內部場所，但沒套區域。
   * 傳已篩好的 rooms 會讓家長選了臺北市之後再也選不到別的縣市。
   */
  areaRooms: readonly NursingRoom[];
  theme: ServiceTheme;
  filters: RoomFilters;
  onFiltersChange: (filters: RoomFilters) => void;
  /**
   * 選定的捷運站。它是附近清單與地圖的定位點，不是篩選條件——所以不在
   * RoomFilters 裡，也不會拿掉任何一筆哺乳室。
   */
  station: MrtStation | null;
  onStationChange: (station: MrtStation | null) => void;
  /** 交還給頁面的 selectedRoom：選定的哺乳室同時開詳情、帶動地圖。 */
  onSelect: (room: NursingRoom) => void;
}

/**
 * 哺乳室的搜尋與篩選。
 *
 * 地圖能做的是「附近有什麼」，不能做「我現在在的這間百貨」，也不能做「我明天
 * 要去的那一區有沒有」。家長站在特定賣場裡，最快的路徑是打出店名；在家排明天
 * 的行程時，要的是區域加場所類型。兩條路都收在同一張卡片裡，因為它們回答的是
 * 同一個問題的兩種問法。
 *
 * 關鍵字比對名稱、地址、縣市與鄉鎮市區四個欄位：家長記得的常常是路名或區名，
 * 甚至只記得「大遠百」而地址才寫著它所在的路。3,852 筆用最單純的
 * filter 就夠（實測整份掃完不到 1 ms），不需要 debounce 之類的機制。
 *
 * 場所類型只能單選：多選要另外給一組圖例說明「現在選了哪三類」，而那個圖例
 * 沒有人會讀。再按一次同一顆就是取消。
 */
export default function RoomSearch({
  rooms,
  areaRooms,
  theme,
  filters,
  onFiltersChange,
  station,
  onStationChange,
  onSelect,
}: RoomSearchProps) {
  const [query, setQuery] = useState('');
  const [areaOpen, setAreaOpen] = useState(false);
  const [stationOpen, setStationOpen] = useState(false);
  const keyword = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (keyword === '') {
      return rooms;
    }

    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(keyword)
        || room.address.toLowerCase().includes(keyword)
        || room.city.toLowerCase().includes(keyword)
        || (room.district?.toLowerCase().includes(keyword) ?? false),
    );
  }, [rooms, keyword]);

  const { city, district, category, excludeInternal } = filters;

  const hasFilter
    = city !== null || district !== null || category !== null || excludeInternal;

  /*
    只選了縣市就不列清單：那只是把地圖框到那個縣市，而臺北市有 611 處，
    沒有人會讀那份清單。關鍵字、行政區、場所類型與排除內部場所反過來都是
    「我想翻一份名單」的意思，所以它們會把清單叫出來——即使剩下的筆數還很大，
    單獨按排除內部場所就還剩 3,378 處。那種情況下清單有沒有用取決於排序：
    定位過就是最近的幾處；沒定位是照行政區排的前 30 處，標題會老實寫出共有
    幾處，請家長再縮一次。
  */
  const showList
    = keyword !== '' || district !== null || category !== null || excludeInternal;

  // `.chip-on` 的珊瑚紅是 LittleSteps 的品牌色，這裡換成 BabyOasis 的靖藍，
  // 做法比照 LittleGuard 的 CountyPicker。
  const chipClass = (isOn: boolean) =>
    `chip shrink-0 ${isOn ? `chip-on ${theme.fill} ${theme.fillText} border-transparent` : ''}`;

  const clearAll = () => {
    setQuery('');
    onFiltersChange(NO_FILTERS);
  };

  return (
    <div className="pointer-events-auto">
      <RoomQuery query={query} setQuery={setQuery} />

      {/* 橫向捲動而不是換行：chip 列換行會把地圖推掉半個畫面。 */}
      {/* data-testid：這一列刻意橫向捲動，E2E 要單獨量它，而不是算成整頁的水平
          溢出；捲動容器沒有角色也沒有可及名稱可選（docs/E2E_TEST_PLAN.md §6）。 */}
      <RoomFilterChips
        filters={filters}
        station={station}
        setAreaOpen={setAreaOpen}
        setStationOpen={setStationOpen}
        chipClass={chipClass}
        onFiltersChange={onFiltersChange}
      />

      <RoomResults
        showList={showList}
        matches={matches}
        hasFilter={hasFilter}
        theme={theme}
        clearAll={clearAll}
        setQuery={setQuery}
        onSelect={onSelect}
      />

      {areaOpen && (
        <AreaPicker
          rooms={areaRooms}
          city={city}
          district={district}
          onSelect={(nextCity, nextDistrict) =>
            onFiltersChange({ ...filters, city: nextCity, district: nextDistrict })}
          onClose={() => setAreaOpen(false)}
        />
      )}

      {stationOpen && (
        <MrtPicker
          selected={station}
          onSelect={onStationChange}
          onClose={() => setStationOpen(false)}
        />
      )}
    </div>
  );
}
