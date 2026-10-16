// 睡眠時間參考表
export interface SleepRequirement {
  id: string;
  ageRange: string;
  /** 區段起始月齡（含） */
  minMonths: number;
  /** 區段結束月齡（不含） */
  maxMonths: number;
  totalHours: string;
  daytimeHours: string;
  nighttimeHours: string;
  characteristics: string;
}

export const sleepRequirements: SleepRequirement[] = [
  {
    id: 'sleep-0-1m',
    ageRange: '0-1 個月',
    minMonths: 0,
    maxMonths: 1,
    totalHours: '16-17 小時',
    daytimeHours: '約 8 小時',
    nighttimeHours: '8-9 小時',
    characteristics: '睡眠極為零碎，無日夜概念',
  },
  {
    id: 'sleep-1-3m',
    ageRange: '1-3 個月',
    minMonths: 1,
    maxMonths: 3,
    totalHours: '15-16 小時',
    daytimeHours: '4-7 小時',
    nighttimeHours: '8-10 小時',
    characteristics: '6週後生理時鐘開始發展，開始分日夜',
  },
  {
    id: 'sleep-3-6m',
    ageRange: '3-6 個月',
    minMonths: 3,
    maxMonths: 6,
    totalHours: '13-15 小時',
    daytimeHours: '4-5 小時',
    nighttimeHours: '9-10 小時',
    characteristics: '褪黑激素穩定，3個月後有機會開始睡過夜',
  },
  {
    id: 'sleep-6-12m',
    ageRange: '6-12 個月',
    minMonths: 6,
    maxMonths: 12,
    totalHours: '13-14 小時',
    daytimeHours: '3 小時 (2次)',
    nighttimeHours: '10-11 小時',
    characteristics: '6個月後夜奶非必須，小睡次數減少',
  },
  {
    id: 'sleep-12-18m',
    ageRange: '1-1.5 歲',
    minMonths: 12,
    maxMonths: 18,
    totalHours: '13-14 小時',
    daytimeHours: '2-3 小時',
    nighttimeHours: '11 小時',
    characteristics: '睡眠更集中於夜間，小睡可能減至 1-2 次',
  },
  {
    id: 'sleep-18-24m',
    ageRange: '1.5-2 歲',
    minMonths: 18,
    maxMonths: 24,
    totalHours: '12-13 小時',
    daytimeHours: '1.5-2 小時',
    nighttimeHours: '11 小時',
    characteristics: '注意活動量，養成早睡早起習慣',
  },
  // 2-3 歲時數來源（非由 1.5-2 歲區段外推）：
  // - 衛生福利部嬰幼兒睡眠時數建議：1-3 歲每日 11-14 小時
  //   （臺師大張鑑如「幼兒發展調查資料庫」2024 年發布時引述，並據此建議 1-3 歲
  //     幼兒 21:30 前就寢、不宜超過 22:00）
  // - American Academy of Sleep Medicine 2016 共識聲明
  //   （J Clin Sleep Med 2016;12(6):785-786）：幼兒 1-2 歲 11-14 小時、
  //   學齡前 3-5 歲 10-13 小時，時數含夜眠與日間小睡；中國醫藥大學附設醫院
  //   兒少發展暨心智行為科衛教單張（HE-50122，2025/4/29）採同一組數字。
  // - 日間／夜間分配依《0-6 歲好眠全指南》（好夢心理治療所 吳家碩臨床心理師）
  //   【2-4 歲・午睡固定期】：大多已不需上午小睡，午睡建議下午 3 點前結束。
  {
    id: 'sleep-24-36m',
    ageRange: '2-3 歲',
    minMonths: 24,
    maxMonths: 36,
    totalHours: '11-14 小時',
    daytimeHours: '1-2 小時 (1次午睡)',
    nighttimeHours: '10-12 小時',
    characteristics: '午睡固定 1 次，建議下午 3 點前結束，避免影響夜眠',
  },
];

/**
 * 依月齡取得對應的睡眠需求區段。
 *
 * 以月齡區間比對，而非用陣列索引取值（先前 sleepAnalysis 與 trendCalculator
 * 各自寫死 sleepRequirements[0]…[5]）。索引寫法與資料順序耦合：只要插入或
 * 重排任何一段，索引就會靜默指向錯誤的年齡層——新增「2-3 歲」後 [5] 仍是
 * 1.5-2 歲即為一例。改以區間比對後，往後增修區段只需改這份資料。
 *
 * 超出兩端的月齡夾到最年幼／最年長的區段。
 */
export function getSleepRequirementForAge(ageMonths: number): SleepRequirement {
  const band = sleepRequirements.find(
    (candidate) =>
      ageMonths >= candidate.minMonths && ageMonths < candidate.maxMonths,
  );

  if (band) {
    return band;
  }

  return ageMonths < sleepRequirements[0].minMonths
    ? sleepRequirements[0]
    : sleepRequirements[sleepRequirements.length - 1];
}

// 睡眠知識
export interface SleepKnowledge {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

export const sleepKnowledge: SleepKnowledge[] = [
  {
    id: 'why-sleep',
    title: '為什麼寶寶睡這麼久？',
    icon: 'Moon',
    content: [
      '快速發育：大腦與身體在睡眠中進行神經連結與修復',
      '代謝率高：能量消耗快，需要頻繁睡眠恢復',
      '週期不成熟：0-3個月寶寶約 50% 時間處於淺層睡眠（快速動眼期），易醒',
    ],
  },
  {
    id: 'sleep-signals',
    title: '辨識寶寶的訊號',
    icon: 'Eye',
    content: [
      '睡眠暗號（應開始哄睡）：動作變慢、吸吮減弱、打哈欠、雙眼無神',
      '疲累訊號（過度疲勞）：抓臉、揉眼睛、易怒、崩潰大哭（此時皮質醇升高，反而更難入睡）',
      '自我安撫：睡前頻繁搖頭、吸手指是常見的自我放鬆機制',
    ],
  },
  {
    id: 'day-night',
    title: '建立日夜區隔',
    icon: 'Sun',
    content: [
      '白天：窗簾拉開保持明亮、多互動遊戲、不需刻意安靜',
      '晚上：燈光調暗、音量降低、低強度回應（避免開燈或過度逗弄）',
    ],
  },
];

// 睡眠安全守則
export interface SleepSafetyRule {
  id: string;
  title: string;
  description: string;
  type: 'do' | 'dont';
}

export const sleepSafetyRules: SleepSafetyRule[] = [
  {
    id: 'safety-same-room',
    title: '同室不同床',
    description: '寶寶應睡在自己的嬰兒床上，但與大人同室觀察',
    type: 'do',
  },
  {
    id: 'safety-back-sleep',
    title: '仰睡最安全',
    description: '避免趴睡或側睡，以免擠壓下巴引發呼吸困難',
    type: 'do',
  },
  {
    id: 'safety-no-pillow',
    title: '不要使用枕頭',
    description: '2歲以下不建議使用枕頭',
    type: 'dont',
  },
  {
    id: 'safety-no-blanket',
    title: '不要放棉被',
    description: '改用防踢被或包巾',
    type: 'dont',
  },
  {
    id: 'safety-no-toys',
    title: '不要放填充玩具或布偶',
    description: '避免窒息風險',
    type: 'dont',
  },
  {
    id: 'safety-no-bumper',
    title: '不要使用床圍',
    description: '可能阻礙通風或造成窒息',
    type: 'dont',
  },
  {
    id: 'safety-no-soft',
    title: '不要在軟質表面睡覺',
    description: '床墊需平坦且紮實',
    type: 'dont',
  },
  {
    id: 'safety-temperature',
    title: '環境溫度控制',
    description: '建議維持在 24°C 左右，通風良好，避免過熱導致熱疹',
    type: 'do',
  },
];

// 睡眠儀式步驟
export interface SleepRitualStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export const sleepRitualSteps: SleepRitualStep[] = [
  {
    id: 'ritual-bath',
    title: '洗澡',
    description: '放鬆肌肉，作為儀式開頭',
    icon: 'Bath',
    order: 1,
  },
  {
    id: 'ritual-change',
    title: '換衣/尿布',
    description: '穿上乾淨舒適的睡衣與乾爽尿布',
    icon: 'Baby',
    order: 2,
  },
  {
    id: 'ritual-read',
    title: '看書/聽音樂',
    description: '低強度的互動',
    icon: 'BookOpen',
    order: 3,
  },
  {
    id: 'ritual-cuddle',
    title: '親吻/擁抱',
    description: '給予安全感，關燈準備入睡',
    icon: 'Heart',
    order: 4,
  },
];

// 睡眠訓練技巧
export interface SleepTrainingMethod {
  id: string;
  title: string;
  description: string;
  steps: string[];
  icon: string;
}

export const sleepTrainingMethods: SleepTrainingMethod[] = [
  {
    id: 'method-ferber',
    title: '漸進式延遲法 (Ferber Method)',
    description:
      '當寶寶哭鬧時，分別在 3、5、10 分鐘後進入房內安撫，但非必要不抱起，逐漸拉長安撫間隔',
    steps: [
      '寶寶開始哭鬧時，等待 3 分鐘後進房安撫',
      '第二次哭鬧等待 5 分鐘',
      '之後每次都等待 10 分鐘',
      '進房時僅輕拍安撫，避免抱起',
      '逐漸拉長安撫間隔時間',
    ],
    icon: 'Timer',
  },
  {
    id: 'method-pickup',
    title: '放下法 (Pick Up, Put Down)',
    description:
      '當寶寶哭得厲害時抱起安撫，一旦情緒緩和即放回床上，讓其學習在床上入睡',
    steps: [
      '當寶寶大哭時抱起安撫',
      '情緒緩和後立即放回床上',
      '重複此過程直到寶寶入睡',
      '逐漸減少抱起的頻率',
      '培養寶寶自行入睡的能力',
    ],
    icon: 'Users',
  },
  {
    id: 'method-4r',
    title: '4R 儀式',
    description: '建立固定且一致的睡前儀式，幫助寶寶放鬆並準備入睡',
    steps: [
      'Resources (安撫資源)：準備安撫巾、小被被等',
      'Reduce Stimulate (減少刺激)：降低環境光線與聲音',
      'Rest Activities (靜態活動)：進行輕柔的睡前活動',
      'Ritualized (固定一致)：每天固定時間與順序',
    ],
    icon: 'Repeat',
  },
];

// 訓練建議與提醒
export const trainingTips = {
  timing: {
    title: '建議時機',
    content: '通常建議 4-6 個月大後開始進行睡眠訓練',
  },
  consistency: {
    title: '一致性很重要',
    content: '所有照顧者（父母、長輩）必須採用相同的模式與標準，避免讓寶寶混淆',
  },
  patience: {
    title: '界線與耐心',
    content: '寶寶抗拒時需堅定立場，但也要尊重孩子的獨特氣質，不強求立即見效',
  },
};
