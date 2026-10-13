import type { VenueKind } from '~app/domain/records';

/** 縣市排序：六都在前，其餘依館數多寡，離島最後——和家長心裡的順序一致。 */
export const CITY_ORDER = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '澎湖縣',
  '金門縣',
  '連江縣',
];

/**
 * 一次最多畫幾張卡。全部縣市有 247 處，全畫出來手機會卡，而且家長也不會
 * 一路滑到底——超過就提示縮小範圍，比無限長的清單有用。
 */
export const MAX_RENDERED = 30;

export type View = VenueKind | 'checklist';

export const VIEWS: { id: View; label: string }[] = [
  { id: 'centre', label: '親子館' },
  { id: 'restaurant', label: '親子餐廳' },
  { id: 'checklist', label: '出發前' },
];

/** 縣市籌碼裡的「全部縣市」。 */
export const ALL_CITIES = 'all';
