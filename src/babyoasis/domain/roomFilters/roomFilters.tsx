import { NursingRoom } from '../nursingRooms';
import type { RoomCategory } from '../roomCategory';
export interface RoomFilters {
  city: string | null;
  district: string | null;
  category: RoomCategory | null;
  excludeInternal: boolean;
}

export const NO_FILTERS: RoomFilters = {
  city: null,
  district: null,
  category: null,
  excludeInternal: false,
};

/**
 * 把上次的區域條件對一次今天的資料。
 *
 * 國健署會改場所名稱，某個行政區也可能一筆都不剩。對不上的那一項就地放掉：留
 * 著的話家長會拿到一張空地圖，而空地圖講不出它是因為上次的一個選擇才空的。
 */
export function reconcileFilters(
  filters: RoomFilters,
  rooms: readonly NursingRoom[],
): RoomFilters {
  if (filters.city === null) {
    return filters;
  }

  if (!rooms.some((room) => room.city === filters.city)) {
    return { ...filters, city: null, district: null };
  }

  if (filters.district === null) {
    return filters;
  }

  const present = rooms.some(
    (room) => room.city === filters.city && room.district === filters.district,
  );

  return present ? filters : { ...filters, district: null };
}
