import { useEffect, useState } from 'react';

import { useOptionalChildStore } from '~app/family/hooks/useChildStoreContext';

import { readPreferences } from '~app/portal/services/preferences';

import type { RadarData } from '~app/littleguard/domain/radarModels';

import { disease_radar } from '~app/littleguard/services/disease_radar';

import { useRadarBoard } from './useRadarBoard';

import { useRadarSelection } from './useRadarSelection';

export function useRadarData() {
  const [data, setData] = useState<RadarData | null>(null);

  const [failed, setFailed] = useState(false);

  // 上次選的縣市與年齡層。只讀一次：讀完之後，畫面上的選擇才是唯一的真相。
  const [stored] = useState(readPreferences);

  const [picked, setPicked] = useState<string | null>(stored.guardCounty);

  const [pickedAge, setPickedAge] = useState<string | null>(null);

  const [open, setOpen] = useState<string | null>(null);

  const currentChild = useOptionalChildStore()?.currentChild;

  useEffect(() => {
    disease_radar()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  return {
    data,
    setData,
    failed,
    setFailed,
    stored,
    picked,
    setPicked,
    pickedAge,
    setPickedAge,
    open,
    setOpen,
    currentChild,
  };
}

export function useRadarState() {
  const stage1 = useRadarData();
  const stage2 = useRadarSelection({ ...stage1 });
  const stage3 = useRadarBoard({ ...stage1, ...stage2 });

  return { ...stage1, ...stage2, ...stage3 };
}
