import type { Venue } from '~app/littleouting/domain/venueModels';

export function family_centres() {
  return fetch(`${import.meta.env.BASE_URL}data/familyCentres.json`).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json() as Promise<Venue[]>;
  });
}
