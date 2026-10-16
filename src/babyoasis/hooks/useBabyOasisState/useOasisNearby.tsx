import { useCallback, useMemo } from 'react';

import { savePreferences } from '~app/portal/services/preferences';

import type { MrtStation } from '~app/babyoasis/domain/mrtStations';

import { distanceBetween } from '~app/babyoasis/domain/spatialIndex';

import { type RoomFilters } from '~app/babyoasis/domain/roomFilters';

import type { useOasisSelection } from './useBabyOasisState';
import type { useOasisRooms } from './useOasisRooms';

/** 定位後列出的鄰近筆數，以及超過多遠就不算「附近」。 */
const NEARBY_LIMIT = 8;

const NEARBY_RADIUS_KM = 10;

/**
 * 選了捷運站時的半徑。10 公里在捷運沿線等於整個市區，回答不了「這一站附近」。
 *
 * 800 公尺是量出來的，不是手感：全台 260 站對上這份哺乳室資料，235 站在 800
 * 公尺內至少有一處（154 站在 300 公尺內），平均 7.3 處、中位數 5 處，正好是
 * NEARBY_LIMIT 這個量級。再放寬只會把隔一站的場所混進來，那不是家長問的問題。
 */
const STATION_RADIUS_KM = 0.8;

/**
 * 清單排序用的中文定序器。等同 `localeCompare(other, 'zh-Hant')`，但整份
 * 3,852 筆實測 2.6 ms 而不是 21.6 ms：localeCompare 帶 locale 參數時每次
 * 比較都重建一個 collator，而排序會呼叫它四萬次以上。
 */
const COLLATOR = new Intl.Collator('zh-Hant');

export function useOasisNearby({
  userLocation,
  setSelectedRoom,
  setShowNearby,
  setFilters,
  station,
  setStation,
  filteredRooms,
  index,
}: ReturnType<typeof useOasisSelection> & ReturnType<typeof useOasisRooms>) {
  /*
    附近清單與清單排序的原點。選定的捷運站優先於定位，因為它是家長剛剛按下去
    的那個動作；兩者都沒有就沒有原點，清單改用區域排序。
  */
  const origin = useMemo(() => {
    if (station) {
      return {
        lat: station.latitude,
        lng: station.longitude,
        radiusKm: STATION_RADIUS_KM,
        title: `捷運${station.name}站附近`,
        emptyText: `這一站 ${STATION_RADIUS_KM * 1000} 公尺內沒有已登記的哺乳室，可換一站或拖動地圖查看。`,
      };
    }

    if (userLocation) {
      return {
        lat: userLocation[0],
        lng: userLocation[1],
        radiusKm: NEARBY_RADIUS_KM,
        title: '附近的哺乳室',
        emptyText: `${NEARBY_RADIUS_KM} 公里內沒有已登記的哺乳室，可拖動地圖查看其他區域。`,
      };
    }

    return null;
  }, [station, userLocation]);

  const nearby = useMemo(() => {
    if (!origin) {
      return [];
    }

    return index.nearest([origin.lat, origin.lng], NEARBY_LIMIT, origin.radiusKm);
  }, [index, origin]);

  /*
    清單順序。國健署回傳的順序是它自己的查詢順序，讀起來像亂數：同一條路上的
    三筆會散在清單的三個地方。有原點就照距離，沒有就照行政區再照名稱。
  */
  const sortedRooms = useMemo(() => {
    if (origin) {
      // 先把距離算好再排。放在比較函式裡的話，每一筆會被重算 log n 次。
      return filteredRooms
        .map((room) => ({
          room,
          km: distanceBetween(
            [origin.lat, origin.lng],
            [room.latitude, room.longitude],
          ),
        }))
        .sort((a, b) => a.km - b.km)
        .map((entry) => entry.room);
    }

    return [...filteredRooms].sort(
      (a, b) =>
        COLLATOR.compare(a.district ?? '', b.district ?? '')
        || COLLATOR.compare(a.name, b.name),
    );
  }, [filteredRooms, origin]);

  /*
    近四千個 <Marker> 只跟資料有關。先前這串直接寫在 render 裡，而 selectedRoom、
    showNearby、userLocation 都住在同一個元件——點開一筆哺乳室就把全部標記重建
    一次。抽成只依 filteredRooms 的 memo 之後，選取只動面板與地圖視角。
  */

  // 身分穩定的關閉函式：面板的 Escape 監聽掛在它上面，每次 render 換一個新的
  // 就等於每次 render 重掛一次監聽。
  const closeRoom = useCallback(() => setSelectedRoom(null), []);

  const closeNearby = useCallback(() => setShowNearby(false), []);

  /*
    篩到哪裡就記在裝置上，下次打開直接回到這裡：重新整理最常發生在出門途中，
    而那正是最不該重新篩一次的時候。身分和 setFilters 一樣穩定，才不會每次
    render 都換一個新的 prop 給搜尋列。
  */
  const handleFiltersChange = useCallback((next: RoomFilters) => {
    setFilters(next);

    savePreferences({
      oasisCity: next.city,
      oasisDistrict: next.district,
      oasisCategory: next.category,
      oasisExcludeInternal: next.excludeInternal,
    });
  }, []);

  /* 選了站就開清單，取消就收起來——按下去之後畫面必須有反應。 */
  const handleStation = useCallback((next: MrtStation | null) => {
    setStation(next);
    setShowNearby(next !== null);
  }, []);

  return {
    origin,
    nearby,
    sortedRooms,
    closeRoom,
    closeNearby,
    handleFiltersChange,
    handleStation,
  };
}
