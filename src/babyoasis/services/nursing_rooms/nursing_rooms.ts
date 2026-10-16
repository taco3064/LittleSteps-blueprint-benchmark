import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms';

export function nursing_rooms() {
  return fetch(`${import.meta.env.BASE_URL}data/nursingRooms.json`).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json() as Promise<NursingRoom[]>;
  });
}
