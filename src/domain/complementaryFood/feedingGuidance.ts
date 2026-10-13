import { FoodPrinciple, FoodWarning, FeedingPrinciple } from '../records';

// 副食品添加三大原則
export const foodPrinciples: FoodPrinciple[] = [
  {
    id: 'early-start',
    title: '四個月就可以開始吃副食品',
    description: '把握4-9個月免疫耐受性黃金時期，及早接觸反而能降低過敏機率',
    icon: 'Calendar',
  },
  {
    id: 'no-delay',
    title: '父母有過敏體質也不需延後',
    description: '現代醫學已證實，太晚給副食品非但不能減少過敏，反而可能提高',
    icon: 'ShieldCheck',
  },
  {
    id: 'natural-foods',
    title: '一歲前除蜂蜜外都可嘗試',
    description: '什麼天然食物都可以添加，除非吃了產生過敏症狀。少量多樣化最重要',
    icon: 'Leaf',
  },
];

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

// 4x3 試敏法
export const allergyTestingMethod = {
  name: '4x3 試敏法',
  description: '早期接觸（4-9個月內）反而能建立免疫耐受性，降低未來過敏機率',
  steps: [
    {
      step: 1,
      title: '小量試3天',
      description: '第一天給一小口，觀察是否有紅疹、腹瀉、嘔吐',
    },
    {
      step: 2,
      title: '增量試3天',
      description: '若無反應，第二天增加份量，持續觀察',
    },
    {
      step: 3,
      title: '觀察3天',
      description: '停止新食材，觀察是否有延遲性過敏',
    },
  ],
  principle: '每次只試「一種」新食材，若發生過敏，記錄並暫停該食材1-2個月再試',
};

// 手指食物挑選3大原則
export const fingerFoodPrinciples = {
  title: '手指食物（BLW）挑選3大原則',
  ageRange: '7-8個月起',
  principles: [
    {
      name: '尺寸',
      description: '長度約為寶寶握緊拳頭後露出2-3公分（像粗薯條），方便抓握',
    },
    {
      name: '硬度',
      description: '父母用大拇指與食指能輕易壓碎的程度（如煮熟的紅蘿蔔）',
    },
    {
      name: '安全性',
      description:
        '絕對避開圓形（整顆葡萄）、硬殼（堅果）、黏性強（麻糬、蛋黃乾吃）的食物',
    },
  ],
};

// 常見副食品餵食法
export const feedingMethods = [
  {
    id: 'puree',
    name: '食物泥',
    description: '將食材打成泥狀，適合初期嘗試',
  },
  {
    id: 'traditional',
    name: '傳統泥粥漸進法',
    description: '從十倍粥開始，逐步增加濃稠度',
  },
  {
    id: 'blw',
    name: 'BLW（寶寶主導式離乳法）',
    description: '提供手指食物，讓寶寶自己抓取進食',
  },
  {
    id: 'follow-parents',
    name: '少量多樣化，跟著大人吃',
    description: '最推薦的方法，與家人同步用餐，培養良好飲食習慣',
  },
];

// 開始副食品的時機
export const startingSignals = [
  '寶寶滿四個月大',
  '寶寶會對大人食物睜大眼睛',
  '開始表現出對大人食物感興趣',
  '脖子能撐住、能坐穩',
  '出現咀嚼動作',
];

// 副食品添加基本原則
export const feedingPrinciples: FeedingPrinciple[] = [
  {
    title: '單一食材原則',
    description:
      '每次只能加一種新食材，至少試3~5天（72小時觀察期），若無過敏反應即可再試下一種',
  },
  {
    title: '奶為主食原則',
    description: '一歲前還是以奶為主食，10個月前盡量多喝奶，不要因為副食品而提早斷奶',
  },
  {
    title: '低敏優先原則',
    description:
      '只要是低敏食材一歲前都能試；高敏食材則依寶寶體質斟酌添加（高低敏僅為統計值，因人而異）',
  },
  {
    title: '添加植物油',
    description:
      '開始加菜後，可於副食品中滴入1~3滴植物油（如橄欖油、亞麻仁油等）幫助腸胃蠕動、預防便祕',
  },
];
