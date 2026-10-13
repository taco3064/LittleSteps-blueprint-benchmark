import type { BabyWikiArticle } from '../records';
export const entryDroolRash: BabyWikiArticle
  // ── 皮膚問題 ──
  = {
    id: 'drool-rash',
    title: '口水疹',
    summary: '寶寶流口水導致嘴巴周圍皮膚紅疹，常見於 3-6 個月大量分泌口水的時期。',
    category: 'skin',
    causes: [
      '口水中的消化酵素長時間刺激皮膚',
      '長牙期口水分泌增加，皮膚長期處於潮濕狀態',
      '頻繁擦拭導致皮膚屏障受損',
    ],
    solutions: [
      {
        step: '保持乾燥',
        detail: '使用柔軟紗布巾輕輕沾乾（非擦拭）口水，減少摩擦刺激。',
      },
      {
        step: '塗抹保護層',
        detail: '在嘴巴周圍塗上凡士林或含氧化鋅的護膚膏，形成防水屏障。',
      },
      {
        step: '使用圍兜',
        detail: '替寶寶戴上吸水力好的圍兜，減少口水接觸皮膚的時間。',
      },
      { step: '溫和清潔', detail: '每日用溫水輕洗患處，避免使用含香精的清潔產品。' },
    ],
    warningSignals: [
      '皮膚出現水泡、流膿或破皮感染跡象',
      '紅疹範圍持續擴大且未改善超過一週',
      '寶寶因疼痛而拒絕進食',
    ],
    relatedArticleIds: ['teething', 'atopic-dermatitis'],
    icon: 'Droplets',
  };
export const entryDiaperRash: BabyWikiArticle = {
  id: 'diaper-rash',
  title: '尿布疹',
  summary: '寶寶臀部、腹股溝出現紅疹或破皮，是嬰兒最常見的皮膚問題之一。',
  category: 'skin',
  causes: [
    '尿液與糞便中的刺激物質長時間接觸皮膚',
    '尿布包覆導致悶熱潮濕，皮膚無法透氣',
    '更換副食品後糞便成分改變，增加刺激性',
  ],
  solutions: [
    { step: '勤換尿布', detail: '每 2-3 小時檢查並更換一次，大便後立即更換。' },
    {
      step: '溫水清洗',
      detail: '每次換尿布時用溫水沖洗臀部，避免使用含酒精的濕紙巾。',
    },
    {
      step: '充分晾乾',
      detail: '清洗後讓臀部完全自然風乾，再包上新尿布。每天安排「光屁股時間」。',
    },
    {
      step: '塗抹護臀膏',
      detail: '使用含氧化鋅的護臀膏或凡士林，形成隔離保護層。',
    },
    { step: '選擇適合尿布', detail: '選擇透氣性好、吸收力強的尿布，避免包太緊。' },
  ],
  warningSignals: [
    '紅疹出現水泡、膿瘡或出血',
    '紅疹擴散到尿布區域以外',
    '使用護臀膏三天仍未改善',
    '寶寶出現發燒症狀',
  ],
  relatedArticleIds: ['drool-rash', 'atopic-dermatitis'],
  icon: 'Baby',
};
export const entryAtopicDermatitis: BabyWikiArticle = {
  id: 'atopic-dermatitis',
  title: '異位性皮膚炎',
  summary:
    '反覆發作的慢性皮膚過敏症狀，皮膚乾燥、搔癢、紅疹，好發於臉頰與四肢關節處。',
  category: 'skin',
  causes: [
    '遺傳體質（父母有過敏史則風險較高）',
    '皮膚屏障功能不全，水分容易散失',
    '環境過敏原（塵蟎、花粉）或食物過敏誘發',
  ],
  solutions: [
    {
      step: '加強保濕',
      detail: '每日至少塗抹 2-3 次無香精保濕乳液，洗澡後 3 分鐘內擦最佳。',
    },
    {
      step: '溫和洗澡',
      detail: '水溫控制在 37°C 以下，使用低敏沐浴乳，洗澡時間不超過 10 分鐘。',
    },
    {
      step: '避免刺激物',
      detail: '穿著純棉衣物，避免羊毛或合成纖維。使用無香精洗衣精。',
    },
    {
      step: '環境控管',
      detail: '保持室溫 24-26°C、濕度 50-60%，定期清潔避免塵蟎。',
    },
    {
      step: '遵醫囑用藥',
      detail: '急性期依醫師指示使用外用類固醇藥膏，切勿自行停藥或增減劑量。',
    },
  ],
  warningSignals: [
    '皮膚大面積滲液、結痂或感染',
    '搔癢嚴重影響寶寶睡眠與進食',
    '反覆發作無法控制，需評估過敏原',
  ],
  relatedArticleIds: ['drool-rash', 'diaper-rash'],
  icon: 'Shield',
};
export const entryRoseola: BabyWikiArticle = {
  id: 'roseola',
  title: '玫瑰疹',
  summary: '好發於 6 個月至 2 歲嬰幼兒，先高燒 3-5 天，退燒後全身出現粉紅色斑丘疹。',
  category: 'skin',
  causes: [
    '人類疱疹病毒第 6 型（HHV-6）感染',
    '經由飛沫或接觸傳染，潛伏期約 5-15 天',
    '多數嬰幼兒在 2 歲前會感染過一次',
  ],
  solutions: [
    {
      step: '退燒處理',
      detail: '體溫超過 38.5°C 可使用醫師開立的退燒藥，並補充水分。',
    },
    {
      step: '觀察精神狀態',
      detail: '高燒期間觀察寶寶活動力與食慾，精神好則不需過度擔心。',
    },
    {
      step: '皮膚護理',
      detail: '出疹後不需特別處理，疹子通常 1-3 天內自行消退且不留疤。',
    },
    { step: '居家休養', detail: '發燒期間讓寶寶充分休息，穿著寬鬆透氣衣物。' },
  ],
  warningSignals: [
    '高燒超過 40°C 或持續超過 5 天',
    '出現熱性痙攣（抽搐）',
    '寶寶精神萎靡、持續哭鬧不安',
    '退燒後皮疹持續超過一週',
  ],
  relatedArticleIds: ['fever-assessment', 'enterovirus'],
  icon: 'Flower2',
};
