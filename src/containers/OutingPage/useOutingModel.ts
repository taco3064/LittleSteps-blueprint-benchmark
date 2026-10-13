import { useMemo } from 'react';
import {
  CENTRE_ACCESS,
} from '~app/domain/centreAccess';
import { restaurants } from '~app/domain/restaurants';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { useCentreSelectedChip } from '~app/hooks/useCentreSelectedChip';
import { useFamilyCentres } from './useFamilyCentres';
import { useOutingSelection } from './useOutingSelection';

import { ALL_CITIES, CITY_ORDER } from './outingOptions';

export function useOutingModel() {
  const theme = SERVICE_THEME.littleouting;
  /* 上次停在哪一頁、篩到哪個縣市。只讀一次；搜尋字串刻意不記，那是一次性的
     問句，不是「我家在哪」。分頁 id 對不上今天的 VIEWS 就當沒存過。 */
  const selection = useOutingSelection();
  const { view, pickedCity, query } = selection;
  const { centres, loadFailed, loading } = useFamilyCentres();

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

  return {
    ...selection, theme, centres, loadFailed, loading, source, cities, city,
    scrollerRef, selectedRef, visible, centresLoading, access,
  };
}

export type OutingModel = ReturnType<typeof useOutingModel>;
