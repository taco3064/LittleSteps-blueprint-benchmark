import { useMemo, useState } from 'react';
import { calculateAge } from '~app/domain/dateHelpers';
import { readPreferences, savePreferences } from '~app/domain/preferences';
import { isPregnancyProfile } from '~app/domain/pregnancy';
import type { ChildProfile, RadarData } from '~app/domain/records';
import { useOptionalChildStore } from '~app/hooks/useChildStoreContext';

const DEFAULT_COUNTY = '台北市';

const DEFAULT_AGE = '0~2';

const AGE_BAND_RANGE = /^(\d+)~(\d+)$/;

function bandForChild(
  child: ChildProfile | undefined,
  bands: readonly string[],
): string | null {
  if (!child || isPregnancyProfile(child)) {
    return null;
  }

  const years = Math.floor(calculateAge(child.birthday) / 12);

  return (
    bands.find((band) => {
      const range = AGE_BAND_RANGE.exec(band);

      return (
        range !== null && years >= Number(range[1]) && years <= Number(range[2])
      );
    }) ?? null
  );
}

export function useRadarSelection(data: RadarData | null) {
  const [stored] = useState(readPreferences);
  const [picked, setPicked] = useState<string | null>(stored.guardCounty);
  const [pickedAge, setPickedAge] = useState<string | null>(null);

  const currentChild = useOptionalChildStore()?.currentChild;

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

  const chooseCounty = (next: string) => {
    setPicked(next);
    savePreferences({ guardCounty: next });
  };

  const chooseAge = (next: string) => {
    // 只有 picked 收回 null，偏好照樣記下來：那是家長剛剛的動作，本來就該記得。
    setPickedAge(next === derivedAge ? null : next);
    savePreferences({ guardAgeBand: next });
  };

  return {
    stored,
    picked,
    setPicked,
    pickedAge,
    setPickedAge,
    currentChild,
    counties,
    county,
    bands,
    storedAge,
    derivedAge,
    age,
    chooseCounty,
    chooseAge,
  };
}

function chooseAvailableCounty(picked: string | null, counties: string[]) {
  const chosen = picked !== null && counties.includes(picked) ? picked : null;

  return chosen
    ?? (counties.includes(DEFAULT_COUNTY) ? DEFAULT_COUNTY : (counties[0] ?? ''));
}
