import { useState } from 'react';
import { readPreferences, savePreferences } from '~app/domain/preferences';

import { ALL_CITIES, VIEWS, type View } from './outingOptions';

export function useOutingSelection() {
  const [stored] = useState(readPreferences);

  const [view, setView] = useState<View>(
    () => VIEWS.find((entry) => entry.id === stored.outingTab)?.id ?? 'centre',
  );

  const [pickedCity, setPickedCity] = useState<string>(
    stored.outingCity ?? ALL_CITIES,
  );

  const [query, setQuery] = useState('');

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
    view, pickedCity, query, setQuery, chooseView, chooseCity,
  };
}
