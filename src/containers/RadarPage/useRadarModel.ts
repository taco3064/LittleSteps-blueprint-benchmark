import { useMemo, useState } from 'react';
import { DISEASE_PART_OF } from '~app/domain/diseases';
import {
  freshnessOf,
} from '~app/domain/radar';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { useCentreSelectedChip } from '~app/hooks/useCentreSelectedChip';
import { useRadarData } from './useRadarData';
import { useRadarSelection } from './useRadarSelection';

export function useRadarModel() {
  const theme = SERVICE_THEME.littleguard;
  const { data, failed } = useRadarData();
  // 上次選的縣市與年齡層。只讀一次：讀完之後，畫面上的選擇才是唯一的真相。
  const [open, setOpen] = useState<string | null>(null);

  const selection = useRadarSelection(data);
  const { county, age } = selection;
  const { scrollerRef, selectedRef } = useCentreSelectedChip(age);

  const freshness = data ? freshnessOf(data.weekEnd) : 'fresh';
  const cells = data?.counties[county]?.[age];

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

  return {
    ...selection, theme, data, failed, open, setOpen,
    scrollerRef, selectedRef, freshness, cells, board,
  };
}

export type RadarModel = ReturnType<typeof useRadarModel>;
