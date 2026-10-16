import { useMemo } from 'react';

import { savePreferences } from '~app/portal/services/preferences';

import { useCentreSelectedChip } from '~app/platform/hooks/useCentreSelectedChip';

import type { VenueKind } from '~app/littleouting/domain/venueModels';

import { CENTRE_ACCESS } from '~app/littleouting/domain/centreAccess';

import { restaurants } from '~app/littleouting/domain/restaurants';

import type { useOutingData } from './useOutingState';

/** 縣市排序：六都在前，其餘依館數多寡，離島最後——和家長心裡的順序一致。 */
const CITY_ORDER = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '澎湖縣',
  '金門縣',
  '連江縣',
];

type View = VenueKind | 'checklist';

/** 縣市籌碼裡的「全部縣市」。 */
const ALL_CITIES = 'all';

export function useOutingSelection({
  view,
  setView,
  pickedCity,
  setPickedCity,
  query,
  setQuery,
  centres,
  loading,
}: ReturnType<typeof useOutingData>) {
  const source = view === 'restaurant' ? restaurants : centres;

  const cities = useMemo(() => {
    const present = new Set(source.map((v) => v.city));

    return CITY_ORDER.filter((c) => present.has(c));
  }, [source]);

  /* 記著的縣市不一定還在這一頁的名冊裡（餐廳只有 6 個縣市有，上游也可能改
     字），名冊還在路上時更是一顆籌碼都還沒有。畫面上被選中的縣市一律只能是
     籌碼列上真的有的那幾個，其餘當「全部縣市」——否則家長會拿到一份被篩過的
     清單，卻找不到任何一顆看起來被選中的籌碼。 */
  const city = cities.includes(pickedCity) ? pickedCity : ALL_CITIES;

  /* 記著的縣市在 22 顆籌碼裡多半不是第一顆，重新整理之後它會落在畫面外——家長
     看到一份被篩過的清單，卻沒有一顆籌碼看起來被選中。和 LittleGuard 的縣市列
     用同一個 hook 把它捲進來。 */
  const { scrollerRef, selectedRef } = useCentreSelectedChip(city);

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return source.filter((venue) => {
      if (city !== ALL_CITIES && venue.city !== city) {
        return false;
      }

      if (keyword === '') {
        return true;
      }

      // 家長記得的常常是路名或區名，不是館名，所以地址也要搜。
      return (
        venue.name.toLowerCase().includes(keyword)
        || venue.address.toLowerCase().includes(keyword)
        || venue.district.includes(keyword)
      );
    });
  }, [source, city, query]);

  const centresLoading = view === 'centre' && loading;

  const access = city !== ALL_CITIES ? CENTRE_ACCESS[city] : undefined;

  /* 選了就記起來，下次打開直接是這裡。 */
  const chooseView = (next: View) => {
    setView(next);
    setQuery('');
    // 縣市也要跟著回「全部縣市」：餐廳只有 6 個縣市有，留著親子館那邊選的縣
    // 市，22 縣市裡有 16 個會得到一張空清單，而餐廳這一頁連那顆被選中的縣市
    // 籌碼都畫不出來，家長看不到自己在篩什麼。
    setPickedCity(ALL_CITIES);
    savePreferences({ outingTab: next, outingCity: ALL_CITIES });
  };

  const chooseCity = (next: string) => {
    setPickedCity(next);
    savePreferences({ outingCity: next });
  };

  return {
    source,
    cities,
    city,
    scrollerRef,
    selectedRef,
    visible,
    centresLoading,
    access,
    chooseView,
    chooseCity,
  };
}
