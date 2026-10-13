import type { NursingRoom, RadarData, Venue } from '~app/domain/records';

async function fetchReference<T>(filename: string): Promise<T> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/${filename}.json`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const fetchNursingRooms = () =>
  fetchReference<NursingRoom[]>('nursingRooms');
export const fetchFamilyCentres = () =>
  fetchReference<Venue[]>('familyCentres');
export const fetchDiseaseRadar = () =>
  fetchReference<RadarData>('diseaseRadar');
