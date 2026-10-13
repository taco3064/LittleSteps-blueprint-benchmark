import { useEffect, useState } from 'react';
import type { RadarData } from '~app/domain/records';
import { fetchDiseaseRadar } from '~app/services/reference_data';

export function useRadarData() {
  const [data, setData] = useState<RadarData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchDiseaseRadar()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  return { data, failed };
}
