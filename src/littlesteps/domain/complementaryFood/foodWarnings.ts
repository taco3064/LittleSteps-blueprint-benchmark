import { FoodWarning } from '~app/knowledge/domain/referenceModels';

// 專業提醒與禁忌
export const foodWarnings: FoodWarning[] = [
  {
    id: 'honey',
    title: '1歲前嚴禁蜂蜜',
    description: '含有肉毒桿菌孢子，可能對嬰兒造成致命威脅',
    icon: 'AlertOctagon',
    severity: 'danger',
  },
  {
    id: 'choking-hazards',
    title: '避開窒息風險食物',
    description: '整顆葡萄、硬堅果、麻糬等黏性強或圓形硬物絕對禁止',
    icon: 'AlertTriangle',
    severity: 'danger',
  },
  {
    id: 'no-seasoning',
    title: '不額外加鹽糖',
    description: '寶寶腎臟尚未發育完全，且要培養天然口味，避免未來挑食或重口味',
    icon: 'XCircle',
    severity: 'warning',
  },
  {
    id: 'iron-supplement',
    title: '補鐵是關鍵',
    description: '6個月後母乳鐵質不足，應優先提供蛋黃、紅肉、豬肝泥或強化鐵質的米精',
    icon: 'Droplet',
    severity: 'info',
  },
  {
    id: 'water',
    title: '水分補充',
    description:
      '開始副食品後可給予少量飲水（一次30-50ml），主要是為了漱口與習慣味道',
    icon: 'Droplets',
    severity: 'info',
  },
];
