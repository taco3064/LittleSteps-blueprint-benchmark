import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type LoadState,
  reconcileFilters,
  restoredFilters,
  type RoomFilters,
} from '~app/domain/oasisFilters';
import { savePreferences } from '~app/domain/preferences';
import type { NursingRoom } from '~app/domain/records';
import { fetchNursingRooms } from '~app/services/reference_data';

export function useOasisRooms() {
  const [nursingRooms, setNursingRooms] = useState<NursingRoom[]>([]);

  const [loadState, setLoadState] = useState<LoadState>('loading');

  const [filters, setFilters] = useState<RoomFilters>(restoredFilters);

  // 每次載入配一個序號，只有最新那次能寫進 state：重試時先前那次可能後到，
  // 卸載之後也不該再寫。
  const loadSeq = useRef(0);

  // 全國約 3,900 筆以靜態 JSON 提供，不進 JS bundle，並可獨立於程式碼被快取。
  // 這份 1.1 MB 刻意不放進 PWA 預快取，所以離線或訊號差時載不到是常態路徑，
  // 必須說得出口並且給得起重試，不能只留一張空地圖。
  const loadRooms = useCallback(() => {
    const seq = ++loadSeq.current;

    setLoadState('loading');

    fetchNursingRooms()
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

  useEffect(() => {
    loadRooms();

    return () => {
      loadSeq.current += 1;
    };
  }, [loadRooms]);

  return { nursingRooms, loadState, filters, loadRooms, handleFiltersChange };
}
