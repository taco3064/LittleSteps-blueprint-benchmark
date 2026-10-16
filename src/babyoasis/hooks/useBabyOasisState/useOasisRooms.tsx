import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { MrtStation } from '~app/babyoasis/domain/mrtStations';

import { categoryOf, isInternalVenue } from '~app/babyoasis/domain/roomCategory';

import { reconcileFilters } from '~app/babyoasis/domain/roomFilters';

import { createSpatialIndex } from '~app/babyoasis/domain/spatialIndex';

import { nursing_rooms } from '~app/babyoasis/services/nursing_rooms';
import type { useOasisSelection } from './useBabyOasisState';

export function useOasisRooms({
  nursingRooms,
  setNursingRooms,
  setLoadState,
  filters,
  setFilters,
}: ReturnType<typeof useOasisSelection>) {
  /*
    選定的捷運站是「定位點」而不是「篩選條件」：它不會拿掉任何一筆哺乳室，
    只是把附近清單與地圖的原點換成那一站。所以它不住在 RoomFilters 裡。

    和定位互斥，因為兩者都在回答「附近有什麼」，而答案只能有一個原點：選了站
    就以站為準，重新定位就把站放掉。留著兩個原點的話，清單標題與距離會各自
    指向不同的地方。
  */
  const [station, setStation] = useState<MrtStation | null>(null);

  // 每次載入配一個序號，只有最新那次能寫進 state：重試時先前那次可能後到，
  // 卸載之後也不該再寫。
  const loadSeq = useRef(0);

  // 全國約 3,900 筆以靜態 JSON 提供，不進 JS bundle，並可獨立於程式碼被快取。
  // 這份 1.1 MB 刻意不放進 PWA 預快取，所以離線或訊號差時載不到是常態路徑，
  // 必須說得出口並且給得起重試，不能只留一張空地圖。
  const loadRooms = useCallback(() => {
    const seq = ++loadSeq.current;

    setLoadState('loading');

    nursing_rooms()
      .then((rooms) => {
        if (seq !== loadSeq.current) {
          return;
        }

        setNursingRooms(rooms);
        // 上次記下的區域條件現在才對得起資料——資料到了才知道那個行政區還在不在。
        setFilters((current) => reconcileFilters(current, rooms));
        setLoadState('ready');
      })
      .catch((error) => {
        console.error('哺乳室資料載入失敗:', error);

        if (seq !== loadSeq.current) {
          return;
        }

        setLoadState('failed');
      });
  }, []);

  useEffect(() => {
    loadRooms();

    return () => {
      loadSeq.current += 1;
    };
  }, [loadRooms]);

  /*
    篩選在這裡做一次就好：標記、附近清單與搜尋結果吃的必須是同一批，各自篩
    一次的話家長會在清單裡看到地圖上沒有的哺乳室。

    預設一個條件都不套。分類是從場所名稱推論出來的，不是國健署發布的欄位，
    預設就藏掉真實存在的哺乳室是更糟的那種錯。
  */
  const isFiltered
    = filters.city !== null
      || filters.district !== null
      || filters.category !== null
      || filters.excludeInternal;

  // 區域選單自己要算有哪些縣市、各行政區幾筆，所以這一層先不套區域。
  const areaRooms = useMemo(() => {
    if (filters.category === null && !filters.excludeInternal) {
      return nursingRooms;
    }

    return nursingRooms.filter(
      (room) =>
        (filters.category === null || categoryOf(room) === filters.category)
        && (!filters.excludeInternal || !isInternalVenue(room)),
    );
  }, [nursingRooms, filters.category, filters.excludeInternal]);

  const filteredRooms = useMemo(() => {
    if (filters.city === null) {
      return areaRooms;
    }

    return areaRooms.filter(
      (room) =>
        room.city === filters.city
        && (filters.district === null || room.district === filters.district),
    );
  }, [areaRooms, filters.city, filters.district]);

  // 建索引 0.4 ms，之後每次最近查詢 0.007 ms；逐筆線性掃描則是 0.5 ms。
  const index = useMemo(() => createSpatialIndex(filteredRooms), [filteredRooms]);

  return {
    station,
    setStation,
    loadSeq,
    loadRooms,
    isFiltered,
    areaRooms,
    filteredRooms,
    index,
  };
}
