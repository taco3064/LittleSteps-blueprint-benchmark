import type { BabyWikiArticle } from '../records';
export const entryNasalCongestion: BabyWikiArticle
  // ── 發燒與感冒 ──
  = {
    id: 'nasal-congestion',
    title: '鼻塞處理',
    summary: '嬰兒鼻腔狹窄，鼻塞是常見困擾，影響喝奶與睡眠品質。',
    category: 'fever',
    causes: [
      '上呼吸道感染（感冒）導致鼻黏膜腫脹',
      '空氣乾燥使鼻腔分泌物變乾結塊',
      '過敏原（塵蟎、花粉）刺激鼻腔黏膜',
    ],
    solutions: [
      {
        step: '生理食鹽水滴鼻',
        detail: '用嬰兒專用生理食鹽水各滴 1-2 滴到鼻孔，軟化鼻屎後再清理。',
      },
      {
        step: '吸鼻器清理',
        detail: '使用嬰兒吸鼻器輕柔吸出鼻涕，每次使用前後要清潔消毒。',
      },
      {
        step: '提高濕度',
        detail: '在房間使用加濕器，維持濕度 50-60%，減少鼻腔乾燥。',
      },
      {
        step: '墊高頭部',
        detail: '睡覺時可在床墊下方墊高（非枕頭），讓頭部稍微抬高幫助呼吸。',
      },
    ],
    warningSignals: [
      '呼吸急促或出現喘鳴聲',
      '嘴唇或指甲發紫（缺氧徵兆）',
      '鼻涕持續黃綠色超過 10 天',
      '伴隨高燒超過 38.5°C',
    ],
    relatedArticleIds: ['fever-assessment', 'enterovirus'],
    icon: 'Wind',
  };
export const entryFeverAssessment: BabyWikiArticle = {
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
};
export const entryEnterovirus: BabyWikiArticle = {
  id: 'enterovirus',
  title: '腸病毒注意事項',
  summary: '台灣每年 4-9 月為腸病毒流行期，5 歲以下幼兒為重症高危險群，需特別留意。',
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
};
