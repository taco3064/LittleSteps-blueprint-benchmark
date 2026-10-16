import type { RadarData } from '~app/littleguard/domain/radarModels';

export function disease_radar() {
  return fetch(`${import.meta.env.BASE_URL}data/diseaseRadar.json`).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json() as Promise<RadarData>;
  });
}
