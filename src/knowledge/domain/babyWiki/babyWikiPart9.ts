import type { BabyWikiArticle } from '../referenceModels';
export const babyWikiPart9: BabyWikiArticle[] = [
  {
    id: 'fever-assessment',
    title: '發燒判斷',
    summary: '了解嬰幼兒發燒的正確量測方式、處理原則與何時需要就醫。',
    category: 'fever',
    causes: [
      '病毒或細菌感染（最常見原因）',
      '預防接種後的正常免疫反應',
      '穿太多衣物或環境過於悶熱',
    ],
    solutions: [
      {
        step: '正確量體溫',
        detail:
          '使用耳溫槍或肛溫計。耳溫 ≥ 38°C、肛溫 ≥ 38°C 即為發燒。腋溫需加 0.5°C。',
      },
      {
        step: '物理降溫',
        detail: '減少衣物、開冷氣維持室溫 24-26°C、用溫水擦拭身體散熱。',
      },
      {
        step: '適時用退燒藥',
        detail: '體溫超過 38.5°C 且寶寶不舒服時，依體重給予醫師開立的退燒藥。',
      },
      {
        step: '補充水分',
        detail: '發燒時水分流失增加，頻繁少量哺乳或補充電解質液。',
      },
      {
        step: '持續觀察記錄',
        detail: '每 4 小時量一次體溫並記錄，觀察精神活力與進食狀況。',
      },
    ],
    warningSignals: [
      '3 個月以下嬰兒發燒超過 38°C（需立即就醫）',
      '高燒超過 41°C 或持續超過 48 小時',
      '出現熱性痙攣（抽搐、眼睛上翻）',
      '精神萎靡、持續嗜睡、無法喚醒',
    ],
    relatedArticleIds: ['roseola', 'enterovirus', 'nasal-congestion'],
    icon: 'Thermometer',
  },
  {
    id: 'enterovirus',
    title: '腸病毒注意事項',
    summary:
      '台灣每年 4-9 月為腸病毒流行期，5 歲以下幼兒為重症高危險群，需特別留意。',
    category: 'fever',
    causes: [
      '腸病毒經由糞口、飛沫或接觸傳染',
      '潛伏期 3-5 天，發病前後均具傳染力',
      '台灣高溫潮濕氣候有利病毒存活與傳播',
    ],
    solutions: [
      {
        step: '勤洗手',
        detail: '外出返家、飯前飯後、換尿布後，以肥皂搓洗至少 20 秒。',
      },
      {
        step: '環境消毒',
        detail: '使用稀釋漂白水（500ppm）擦拭門把、玩具等常接觸物品。',
      },
      {
        step: '注意飲食衛生',
        detail: '食物充分加熱、飲水煮沸。避免與他人共用餐具。',
      },
      {
        step: '避免群聚',
        detail: '流行期間減少出入人多擁擠的場所，避免接觸生病的兒童。',
      },
      { step: '居家觀察', detail: '感染後在家休息，觀察是否出現重症前兆。' },
    ],
    warningSignals: [
      '持續嘔吐、嗜睡、意識不清',
      '肌躍型抽搐（類似受到驚嚇的突發性全身肌肉收縮動作）',
      '持續發燒、活動力下降、手腳無力',
      '呼吸急促、心跳加速、臉色蒼白',
    ],
    relatedArticleIds: ['fever-assessment', 'roseola'],
    icon: 'Bug',
  },
  {
    id: 'rolling-safety',
    title: '翻身安全',
    summary: '寶寶約 3-5 個月學會翻身，需注意居家安全防護，避免墜落意外。',
    category: 'motor',
    causes: [
      '寶寶肌肉力量發展到可以翻身的階段',
      '翻身是大動作發展的重要里程碑',
      '好奇心驅使寶寶嘗試改變身體姿勢',
    ],
    solutions: [
      {
        step: '床鋪防護',
        detail: '在床邊加裝安全護欄，或讓寶寶睡在地墊上的嬰兒床中。',
      },
      {
        step: '不離開視線',
        detail: '在換尿布台、沙發等高處時，一隻手要隨時扶著寶寶。',
      },
      {
        step: '移除危險物品',
        detail: '確保翻身範圍內沒有軟墊、枕頭、塑膠袋等窒息危險物。',
      },
      {
        step: '練習安全空間',
        detail: '在地墊上提供安全的翻身練習空間，鼓勵發展但確保安全。',
      },
    ],
    warningSignals: [
      '7 個月以上仍完全無法翻身（建議評估發展）',
      '翻身後頭部受到撞擊，出現嘔吐或嗜睡',
      '只能往單側翻身，可能有肌肉張力問題',
    ],
    relatedArticleIds: ['crawling-safety', 'sids-prevention'],
    icon: 'RotateCcw',
  },
];
