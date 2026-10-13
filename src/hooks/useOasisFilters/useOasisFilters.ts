import { useMemo } from 'react';
import { COLLATOR, NEARBY_LIMIT, type RoomFilters } from '~app/domain/oasisFilters';
import type { NursingRoom } from '~app/domain/records';
import { categoryOf, isInternalVenue } from '~app/domain/roomCategory';
import { createSpatialIndex, distanceBetween } from '~app/domain/spatialIndex';

import type { useOasisLocation } from '../useOasisLocation';

export function useOasisFilters(
  nursingRooms: NursingRoom[],
  filters: RoomFilters,
  origin: ReturnType<typeof useOasisLocation>['origin'],
) {
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

  const nearby = useMemo(() => {
    if (!origin) {
      return [];
    }

    return index.nearest({
      latitude: origin.lat,
      longitude: origin.lng,
      limit: NEARBY_LIMIT,
      maxDistanceKm: origin.radiusKm,
    });
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
          km: distanceBetween({ latitude: origin.lat, longitude: origin.lng }, room),
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

  return { isFiltered, areaRooms, filteredRooms, nearby, sortedRooms };
}
