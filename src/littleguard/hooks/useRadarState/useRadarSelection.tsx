import { useMemo } from 'react';

import { useCentreSelectedChip } from '~app/platform/hooks/useCentreSelectedChip';

import { bandForChild } from '~app/littleguard/domain/ageBand';

import { freshnessOf } from '~app/littleguard/domain/radar';

import type { useRadarData } from './useRadarState';

/** 沒記到上次選的縣市時的起點；台北市是最多人一眼認得的那個。 */
const DEFAULT_COUNTY = '台北市';

/** 同理，沒記錄、也推不出孩子年齡時的年齡層起點。 */
const DEFAULT_AGE = '0~2';

export function useRadarSelection({
  data,
  stored,
  picked,
  pickedAge,
  currentChild,
}: ReturnType<typeof useRadarData>) {
  const counties = useMemo(() => (data ? Object.keys(data.counties) : []), [data]);

  // 上游哪天把「台北市」寫成「臺北市」，家長該看到的是別的縣市的板，不是一片
  // 「現在抓不到資料」——那個錯誤畫面救不了一個只是名字對不上的預設值。上次存
  // 的縣市走同一條路：對不上今天的資料就當沒存過。
  const county = chooseAvailableCounty(picked, counties);
  /*
    年齡層的優先順序：這次點的 > 孩子的生日 > 上次點的 > 預設。

    生日贏過上次點的，因為孩子的年齡是更好的答案，而且它自己會變；這次點的又
    贏過生日，因為那是家長剛剛的動作。上次存的一樣要對得上今天的資料——對不上
    的話 cells 會是 undefined，整頁會變成「現在抓不到資料」。

    點到已經選中的那一顆不算挑過：chooseAge 把 picked 收回 null，年齡層就繼續
    跟著孩子走。理由與代價寫在 VaccineTrackingPage.tsx 的同一段註解裡。
  */
  const bands = data?.ageBands ?? [];

  const storedAge
    = stored.guardAgeBand !== null && bands.includes(stored.guardAgeBand)

      ? stored.guardAgeBand

      : null;

  const derivedAge = bandForChild(currentChild, bands) ?? storedAge ?? DEFAULT_AGE;

  const age = pickedAge ?? derivedAge;

  const { scrollerRef, selectedRef } = useCentreSelectedChip(age);

  const freshness = data ? freshnessOf(data.weekEnd) : 'fresh';

  return {
    counties,

    county,
    bands,
    storedAge,
    derivedAge,
    age,
    scrollerRef,
    selectedRef,
    freshness,
  };
}

function chooseAvailableCounty(picked: string | null, counties: string[]) {
  const chosen = picked !== null && counties.includes(picked) ? picked : null;

  return (
    chosen
    ?? (counties.includes(DEFAULT_COUNTY) ? DEFAULT_COUNTY : (counties[0] ?? ''))
  );
}
