export type ServiceId
  = | 'littlesteps'
    | 'littlebloom'
    | 'littleexplorer'
    | 'babyoasis'
    | 'littleouting'
    | 'littleguard';

export const SERVICE_ORDER: ServiceId[] = [
  'littlebloom',
  'littlesteps',
  'littleexplorer',
  'littleouting',
  'babyoasis',
  'littleguard',
];

export const SERVICE_CATALOGUE = {
  littlesteps: { name: 'LittleSteps', role: '寶寶成長' },
  littlebloom: { name: 'LittleBloom', role: '孕期陪伴' },
  littleexplorer: { name: 'LittleExplorer', role: '幼兒期陪伴' },
  babyoasis: { name: 'BabyOasis', role: '哺乳室地圖' },
  littleouting: { name: 'LittleOuting', role: '親子好去處' },
  littleguard: { name: 'LittleGuard', role: '疫情雷達' },
};
