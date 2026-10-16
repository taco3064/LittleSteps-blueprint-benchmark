import {
  GeneralSafetyItem,
  MonthlyCareGuide,
} from '~app/knowledge/domain/referenceModels';

// 全階段重點注意事項
export const generalSafetyItems: GeneralSafetyItem[] = [
  {
    id: 'safety-sleep',
    title: '睡眠安全',
    description: '仰睡，床鋪無鬆軟枕頭被褥，同室不同床',
    icon: 'Moon',
  },
  {
    id: 'safety-feeding',
    title: '飲食習慣',
    description: '6個月後逐步添加副食品，培養自主進食',
    icon: 'UtensilsCrossed',
  },
  {
    id: 'safety-oral',
    title: '口腔清潔',
    description: '即使沒長牙，餵奶後也可用紗布清潔口腔',
    icon: 'Sparkles',
  },
  {
    id: 'safety-vaccine',
    title: '疫苗接種',
    description: '按時接種預防針，滿5個月可接種卡介苗',
    icon: 'Syringe',
  },
  {
    id: 'safety-home',
    title: '居家安全',
    description: '移除危險物品，保護會爬會走的寶寶',
    icon: 'ShieldCheck',
  },
  {
    id: 'safety-bonding',
    title: '親密互動',
    description: '每天說話、唱歌，增加安全感',
    icon: 'Heart',
  },
];

// 按月齡分組的照顧重點
export const monthlyCareGuides: MonthlyCareGuide[] = [
  // 第 1-3 個月：生理適應與感官啟蒙
  {
    month: 1,
    title: '臍帶與皮膚護理',
    category: 'physiological',
    highlights: [
      '臍帶脫落前保持乾燥（洗澡後用 95% 酒精消毒乾燥）',
      '新生兒脫皮是正常的，不需過度擦乳液',
      '一週洗澡 2-3 次即可',
    ],
  },
  {
    month: 2,
    title: '排氣與情緒安撫',
    category: 'physiological',
    highlights: [
      '進入「腸絞痛」高發期，餵奶後務必拍嗝',
      '每天做 2-3 次排氣操（空中腳踏車）',
      '此時開始會社會性微笑，多給予眼神交流',
    ],
  },
  {
    month: 3,
    title: '抬頭與感官發展',
    category: 'physiological',
    highlights: [
      '練習 Tummy Time（趴睡抬頭），每天數次、每次 1-2 分鐘',
      '加強頸部肌肉發展',
      '白天拉開窗簾、晚上關燈，建立晝夜節律',
    ],
  },

  // 第 4-6 個月：飲食轉型與翻身安全
  {
    month: 4,
    title: '副食品與口水疹',
    category: 'feeding',
    highlights: [
      '準備開始餵副食品（從十倍粥或果菜泥開始）',
      '唾腺發育旺盛，需勤換圍兜',
      '用「按壓」方式擦乾口水，避免口水疹',
    ],
  },
  {
    month: 5,
    title: '翻身安全警訊',
    category: 'safety',
    highlights: [
      '寶寶隨時會翻身，絕不可單獨留在尿布台或沙發上',
      '若開始長牙，會因牙齦癢愛咬東西',
      '需準備乾淨的固齒器',
    ],
  },
  {
    month: 6,
    title: '口腔清潔與坐姿',
    category: 'feeding',
    highlights: [
      '正式進入副食品規律期（一天 1-2 次）',
      '開始練習坐姿，周圍需墊軟墊',
      '早晚用紗布巾擦拭牙齦與新牙',
    ],
  },

  // 第 7-9 個月：空間安全與分離焦慮
  {
    month: 7,
    title: '爬行啟動與飲水',
    category: 'safety',
    highlights: [
      '寶寶開始會蠕動爬行，地板清潔要徹底',
      '副食品量增加後，可開始練習用水杯喝水',
      '預防便秘',
    ],
  },
  {
    month: 8,
    title: '居家環境大安檢',
    category: 'safety',
    highlights: [
      '寶寶活動力激增，需加裝插座保護蓋',
      '收好地板上的細小物體（如硬幣、鈕扣）',
      '避免誤食窒息',
    ],
  },
  {
    month: 9,
    title: '分離焦慮與安撫',
    category: 'physiological',
    highlights: [
      '寶寶變得很黏人、怕生，離開前要溫柔告知（不要偷溜）',
      '建立固定的睡前儀式（洗澡→說故事→睡覺）',
      '增加安全感',
    ],
  },

  // 第 10-12 個月：精細動作與步態
  {
    month: 10,
    title: '手指食物與咀嚼',
    category: 'feeding',
    highlights: [
      '提供手指食物（如煮軟的紅蘿蔔條、香蕉切片）',
      '訓練手眼協調與咀嚼能力',
      '應減少奶量，增加固體食物比例',
    ],
  },
  {
    month: 11,
    title: '扶站與撞擊防護',
    category: 'safety',
    highlights: [
      '寶寶會扶著家具站立或橫移',
      '家中的尖銳桌角必須貼上防撞條',
      '撤走可能被扯落的桌巾',
    ],
  },
  {
    month: 12,
    title: '作息調整與轉奶',
    category: 'feeding',
    highlights: [
      '滿週歲後，飲食應改為「正餐為主、奶為輔」（早晚奶）',
      '可開始練習拿湯匙',
      '嘗試與大人共餐（去油去鹽）',
    ],
  },
];

// 照顧類別標籤
export const careCategories = [
  { value: 'all', label: '全部', icon: 'Grid3x3' },
  { value: 'physiological', label: '生理護理', icon: 'Activity' },
  { value: 'feeding', label: '餵養細節', icon: 'Apple' },
  { value: 'safety', label: '環境安全', icon: 'ShieldAlert' },
];
