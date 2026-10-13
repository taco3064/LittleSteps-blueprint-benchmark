import { readPreferences } from '../preferences';
import type { NursingRoom } from '../records';
import { CATEGORY_CHIPS, type RoomCategory } from '../roomCategory';
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
export const NEARBY_LIMIT = 8;
export const NEARBY_RADIUS_KM = 10;
export const STATION_RADIUS_KM = 0.8;
export const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 60_000,
  enableHighAccuracy: false,
};
export const GEOLOCATION_TIMEOUT = 3;
export type LoadState = 'loading' | 'ready' | 'failed';
export const COLLATOR = new Intl.Collator('zh-Hant');

export function restoredFilters(): RoomFilters {
  const stored = readPreferences();

  return {
    ...NO_FILTERS,
    city: stored.oasisCity,
    // 沒有縣市的行政區篩不出任何東西，一起放掉。
    district: stored.oasisCity === null ? null : stored.oasisDistrict,
    // 分類必須真的是籌碼上那六個。另外四類（辦公場所、學校…）沒有籌碼，套上
    // 去只會讓地圖無聲地少掉一半，而家長看不到自己在篩什麼。
    category: CATEGORY_CHIPS.find((chip) => chip === stored.oasisCategory) ?? null,
    excludeInternal: stored.oasisExcludeInternal,
  };
}

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
