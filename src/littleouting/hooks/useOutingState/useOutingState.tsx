import { useEffect, useState } from 'react';

import { readPreferences } from '~app/portal/services/preferences';

import type { Venue, VenueKind } from '~app/littleouting/domain/venueModels';

import { family_centres } from '~app/littleouting/services/family_centres';

import { useOutingSelection } from './useOutingSelection';

type View = VenueKind | 'checklist';

const VIEWS: { id: View; label: string }[] = [
  { id: 'centre', label: '親子館' },
  { id: 'restaurant', label: '親子餐廳' },
  { id: 'checklist', label: '出發前' },
];

/** 縣市籌碼裡的「全部縣市」。 */
const ALL_CITIES = 'all';

export function useOutingData() {
  /* 上次停在哪一頁、篩到哪個縣市。只讀一次；搜尋字串刻意不記，那是一次性的
     問句，不是「我家在哪」。分頁 id 對不上今天的 VIEWS 就當沒存過。 */
  const [stored] = useState(readPreferences);

  const [view, setView] = useState<View>(
    () => VIEWS.find((entry) => entry.id === stored.outingTab)?.id ?? 'centre',
  );

  const [pickedCity, setPickedCity] = useState<string>(
    stored.outingCity ?? ALL_CITIES,
  );

  const [query, setQuery] = useState('');

  const [centres, setCentres] = useState<Venue[]>([]);

  const [loadFailed, setLoadFailed] = useState(false);

  /* 名冊還在路上時，畫面不能先講「共 0 處 / 找不到符合的場地」——那是在回答
     一個還沒問完的問題。 */
  const [loading, setLoading] = useState(true);

  // 名冊約 118 KB，和哺乳室資料一樣放靜態 JSON，不進 JS bundle。
  useEffect(() => {
    let active = true;

    family_centres()
      .then((rows) => {
        if (active) {
          setCentres(rows);
        }
      })
      .catch((error) => {
        console.error('親子館資料載入失敗:', error);

        if (active) {
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    stored,
    view,
    setView,
    pickedCity,
    setPickedCity,
    query,
    setQuery,
    centres,
    setCentres,
    loadFailed,
    setLoadFailed,
    loading,
    setLoading,
  };
}

export function useOutingState() {
  const stage1 = useOutingData();
  const stage2 = useOutingSelection({ ...stage1 });

  return { ...stage1, ...stage2 };
}
