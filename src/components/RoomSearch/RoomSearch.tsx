import { NO_FILTERS, type RoomFilters } from '~app/domain/oasisFilters';
import { useMemo, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import type { NursingRoom } from '~app/domain/records';
import type { ServiceTheme } from '~app/domain/serviceTheme';
import EmptyState from '../EmptyState';
import {
  ACCESS_LABEL,
  accessOf,
  CATEGORY_CHIPS,
  CATEGORY_LABEL,
  type RoomAccess,
} from '~app/domain/roomCategory';
import AreaPicker from '../AreaPicker';
import MrtPicker from '../MrtPicker';
import type { MrtStation } from '~app/domain/mrtStations';

/**
 * 一次最多畫幾列。全台 3,852 處，「新光三越」這種關鍵字動輒數十筆，
 * 全畫出來在手機上是滑不完的清單；超過就老實說還有幾處，請家長再具體一點。
 * 和親子好去處的 MAX_RENDERED 同一個數字，兩邊的清單長度感覺才一致。
 */
const MAX_RESULTS = 30;

/**
 * 進不去的用琥珀色，要問人的用中性灰：前者是「別白跑一趟」，後者只是多走一趟
 * 服務台。`open` 沒有樣式，因為它不會被畫出來——一列什麼標籤都沒有，本來就讀作
 * 直接走進去。
 */
const ACCESS_TAG_CLASS: Record<Exclude<RoomAccess, 'open'>, string> = {
  internal: 'bg-butter-light text-butter-dark',
  staff_help: 'bg-ink/5 text-ink-muted',
};

/**
 * 篩選條件由頁面持有：標記、附近清單與這份結果清單必須是同一批哺乳室，
 * 三個地方各自篩一次就會各自漂走。
 */
export { NO_FILTERS, type RoomFilters } from '~app/domain/oasisFilters';
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

  const clearAll = () => {
    setQuery('');
    onFiltersChange(NO_FILTERS);
  };

  return (
    <div className="pointer-events-auto">
      <div className="relative">
        <Search
          className={
            'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ' + 'text-ink-faint'
          }
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜尋場所、地址或區域"
          aria-label="搜尋哺乳室"
          className={
            'w-full min-h-tap pl-11 pr-14 py-3 bg-white '
            + 'rounded-2xl shadow-soft text-sm text-ink '
            + 'placeholder-ink-faint '
            + '[&::-webkit-search-cancel-button]:appearance-none'
          }
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="清除搜尋"
            className="btn-icon absolute right-1 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <RoomFilterChips
        {...{ filters, station, theme, onFiltersChange, setAreaOpen, setStationOpen }}
      />
      {showList && (
        <RoomResults {...{ matches, hasFilter, theme, clearAll, setQuery, onSelect }} />
      )}
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

function RoomFilterChips({
  filters,
  station,
  theme,
  onFiltersChange,
  setAreaOpen,
  setStationOpen,
}: Pick<RoomSearchProps, 'filters' | 'station' | 'theme' | 'onFiltersChange'> & {
  setAreaOpen: (open: boolean) => void;
  setStationOpen: (open: boolean) => void;
}) {
  const { city, district, category, excludeInternal } = filters;

  const chipClass = (isOn: boolean) =>
    `chip shrink-0 ${isOn ? `chip-on ${theme.fill} ${theme.fillText} border-transparent` : ''}`;

  return (
    <>
      {/* 橫向捲動而不是換行：chip 列換行會把地圖推掉半個畫面。 */}
      {/* data-testid：這一列刻意橫向捲動，E2E 要單獨量它，而不是算成整頁的水平
          溢出；捲動容器沒有角色也沒有可及名稱可選（docs/E2E_TEST_PLAN.md §6）。 */}
      <div data-testid="scroll-row-oasis-filters" className="row-bleed flex gap-2 py-1">
        <button
          type="button"
          onClick={() => setAreaOpen(true)}
          aria-haspopup="dialog"
          className={chipClass(city !== null)}
        >
          {city === null
            ? '全部縣市'
            : district === null
              ? city
              : `${city} ${district}`}
        </button>
        {/* 捷運站不是篩選條件而是定位點，但它跟篩選籤一樣是「怎麼收窄」的操作，
            家長會在同一列找它。 */}
        <button
          type="button"
          onClick={() => setStationOpen(true)}
          aria-haspopup="dialog"
          className={chipClass(station !== null)}
        >
          {station === null ? '捷運站' : `捷運${station.name}站`}
        </button>
        {CATEGORY_CHIPS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              onFiltersChange({ ...filters, category: category === id ? null : id })}
            aria-pressed={category === id}
            className={chipClass(category === id)}
          >
            {CATEGORY_LABEL[id]}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            onFiltersChange({ ...filters, excludeInternal: !excludeInternal })}
          aria-pressed={excludeInternal}
          className={chipClass(excludeInternal)}
        >
          排除內部場所
        </button>
      </div>
    </>
  );
}

function RoomResults({
  matches,
  hasFilter,
  theme,
  clearAll,
  setQuery,
  onSelect,
}: {
  matches: readonly NursingRoom[];
  hasFilter: boolean;
  theme: ServiceTheme;
  clearAll: () => void;
  setQuery: (query: string) => void;
  onSelect: RoomSearchProps['onSelect'];
}) {
  return (
    <>
      {matches.length === 0
        ? (
            <div className="mt-2">
              {/* 條件篩掉的和關鍵字打錯的，要講不一樣的話：前者給得起一條退路。 */}
              {hasFilter
                ? (
                    <EmptyState
                      theme={theme}
                      title="這些條件下沒有哺乳室"
                      description="試著放寬條件，或換個關鍵字。"
                      action={{ label: '清除篩選', onClick: clearAll }}
                    />
                  )
                : (
                    <EmptyState
                      theme={theme}
                      title="找不到符合的哺乳室"
                      description="換個關鍵字，或改用路名、區域名稱找找看。"
                    />
                  )}
            </div>
          )
        : (
      /* 38vh 是刻意壓低的上限：底部的附近清單最高 45vh，定位鈕與地圖的
             資料來源標註也都在下緣，結果清單不能長到蓋住它們。 */
            <div
              className={
                'mt-2 bg-white rounded-2xl shadow-soft max-h-[38vh] ' + 'overflow-y-auto'
              }
            >
              <p className="sticky top-0 bg-white px-4 pt-3 pb-1 text-xs text-ink-faint">
                {'共 '}
                {matches.length}
                {' 處'}
                {matches.length > MAX_RESULTS && `，先顯示 ${MAX_RESULTS} 處`}
              </p>
              <ul className="px-2 pb-2">
                {matches.slice(0, MAX_RESULTS).map((room) => (
                  <RoomResult
                    key={room.id}
                    room={room}
                    theme={theme}
                    setQuery={setQuery}
                    onSelect={onSelect}
                  />
                ))}
                {matches.length > MAX_RESULTS && (
                  <li className="px-3 py-2 text-sm text-ink-muted text-center">
                    {'還有 '}
                    {matches.length - MAX_RESULTS}
                    {' 處，再加上關鍵字或縮小區域。'}
                  </li>
                )}
              </ul>
            </div>
          )}
    </>
  );
}

function RoomResult({
  room,
  theme,
  setQuery,
  onSelect,
}: {
  room: NursingRoom;
  theme: ServiceTheme;
  setQuery: (value: string) => void;
  onSelect: RoomSearchProps['onSelect'];
}) {
  const access = accessOf(room);

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          // 選定後清掉關鍵字，結果清單才會收起來。留著的話家長關掉
          // 詳情面板，看到的是清單依舊蓋住地圖與剛飛過去的那個點。
          setQuery('');
          onSelect(room);
        }}
        className={
          'w-full flex items-center gap-3 p-3 rounded-2xl '
          + 'hover:bg-ink/5 active:bg-ink/10 transition-colors '
          + 'text-left'
        }
      >
        <MapPin className={`w-4 h-4 shrink-0 ${theme.ink}`} />
        <div className="min-w-0 flex-1">
          {/* 名稱自己截斷，標籤留在旁邊不被截掉：整行 truncate 的
                            話，「大葉高島屋百貨股份有限公司」這種長名字會把後面
                            的標籤一起吃掉——而需要標籤的正是這些長名字。 */}
          <p className="flex items-center gap-2">
            <span className="font-medium text-ink truncate">{room.name}</span>
            {/* 最多一個標籤，哪一個由 accessOf 決定：兩個一起成立
                              時的取捨寫在它那裡，不在這裡重推一次。 */}
            {access !== 'open' && (
              <span className={`tag shrink-0 ${ACCESS_TAG_CLASS[access]}`}>
                {ACCESS_LABEL[access]}
              </span>
            )}
          </p>
          {/* 地址本身就以縣市區起頭，比再拼一次縣市有用；同名的分館
                            （例如天母兩館）只有樓層分得開，有就一起寫上。 */}
          <p className="text-sm text-ink-muted truncate">
            {room.address}
            {room.floor ? `｜${room.floor}` : ''}
          </p>
        </div>
      </button>
    </li>
  );
}
