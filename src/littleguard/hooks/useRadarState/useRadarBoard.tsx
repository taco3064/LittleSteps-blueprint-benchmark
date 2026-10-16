import { useMemo } from 'react';

import { savePreferences } from '~app/portal/services/preferences';

import { DISEASE_PART_OF } from '~app/littleguard/domain/diseases';

import type { useRadarSelection } from './useRadarSelection';
import type { useRadarData } from './useRadarState';

export function useRadarBoard({
  data,
  setPicked,
  setPickedAge,
  county,
  derivedAge,
  age,
}: ReturnType<typeof useRadarData> & ReturnType<typeof useRadarSelection>) {
  const cells = data?.counties[county]?.[age];

  /**
   * 板上有哪幾列由資料自己決定：上游把腸病毒與它的兩種表現各給一支 CSV，三列
   * 並排等於把同一批就診人次數了三次，所以「是別人的一部分」的那幾種不自成一
   * 列，改掛在自己那一列底下。這裡不寫死名單——上游哪天多一種病，它自己就會
   * 出現在板上。
   */
  const board = useMemo(() => {
    if (!data || !cells) {
      return [];
    }

    return data.diseases
      .filter((disease) => !(disease in DISEASE_PART_OF))
      .map((disease) => ({
        disease,
        cell: cells[disease],
        parts: data.diseases
          .filter((part) => DISEASE_PART_OF[part] === disease)
          .map((part) => ({ disease: part, cell: cells[part] })),
      }));
  }, [data, cells]);

  /*
    選了就記起來，下次打開直接停在這裡——這一頁是每週的習慣，兩顆籌碼一年要點
    五十二次。只記家長自己點的：從生日推出來的年齡層是孩子的資料，不進裝置。
  */
  const chooseCounty = (next: string) => {
    setPicked(next);
    savePreferences({ guardCounty: next });
  };

  const chooseAge = (next: string) => {
    // 只有 picked 收回 null，偏好照樣記下來：那是家長剛剛的動作，本來就該記得。
    setPickedAge(next === derivedAge ? null : next);
    savePreferences({ guardAgeBand: next });
  };

  return { cells, board, chooseCounty, chooseAge };
}
