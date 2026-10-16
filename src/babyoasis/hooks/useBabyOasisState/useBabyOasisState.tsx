import { useState } from 'react';

import { readPreferences } from '~app/portal/services/preferences';

import { useToast } from '~app/platform/hooks/useToast';

import { NursingRoom } from '~app/babyoasis/domain/nursingRooms';

import { CATEGORY_CHIPS } from '~app/babyoasis/domain/roomCategory';

import { NO_FILTERS, type RoomFilters } from '~app/babyoasis/domain/roomFilters';

import { useLocateAction } from './useLocateAction';
import { useOasisNearby } from './useOasisNearby';
import { useOasisRooms } from './useOasisRooms';

/** 資料還沒到、到了、載不進來——空白的地圖必須讀得出是哪一種。 */
type LoadState = 'loading' | 'ready' | 'failed';

/**
 * 上次篩到哪裡。
 *
 * 選定的捷運站與地圖視角刻意不記：那兩個在回答「我現在站在哪」，而這個裝置記
 * 的是「我家在哪、我在找什麼」——重新整理發生在出門途中，篩選要還在，位置不該
 * 沿用上一次。
 */
function restoredFilters(): RoomFilters {
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

export function useOasisSelection() {
  const toast = useToast();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<NursingRoom | null>(null);

  const [nursingRooms, setNursingRooms] = useState<NursingRoom[]>([]);

  const [loadState, setLoadState] = useState<LoadState>('loading');

  const [showNearby, setShowNearby] = useState(false);

  const [isLocating, setIsLocating] = useState(false);

  const [filters, setFilters] = useState<RoomFilters>(restoredFilters);

  return {
    toast,
    userLocation,
    setUserLocation,
    selectedRoom,
    setSelectedRoom,
    nursingRooms,
    setNursingRooms,
    loadState,
    setLoadState,
    showNearby,
    setShowNearby,
    isLocating,
    setIsLocating,
    filters,
    setFilters,
  };
}

export function useBabyOasisState() {
  const stage1 = useOasisSelection();
  const stage2 = useOasisRooms({ ...stage1 });
  const stage3 = useOasisNearby({ ...stage1, ...stage2 });
  const stage4 = useLocateAction({ ...stage1, ...stage2, ...stage3 });

  return { ...stage1, ...stage2, ...stage3, ...stage4 };
}
