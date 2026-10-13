import type { BabyWikiArticle } from '../records';
export const entryRollingSafety: BabyWikiArticle
  // ── 動作發展 ──
  = {
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
  };
export const entryCrawlingSafety: BabyWikiArticle = {
  id: 'crawling-safety',
  title: '爬行安全',
  summary: '寶寶約 7-10 個月開始爬行，活動範圍大增，居家安全防護需全面升級。',
  category: 'motor',
  causes: [
    '上肢與核心肌群發展成熟，足以支撐爬行動作',
    '寶寶強烈的探索慾望驅動移動需求',
    '從匍匐前進到手膝爬行是漸進的發展過程',
  ],
  solutions: [
    {
      step: '插座保護',
      detail: '所有低處插座加裝安全蓋，電線收納固定避免寶寶拉扯。',
    },
    { step: '尖角防護', detail: '桌角、櫃角貼上防撞角或防撞條，降低碰傷風險。' },
    {
      step: '門檔安全門',
      detail: '在樓梯口、廚房門口安裝安全門，限制寶寶活動範圍。',
    },
    {
      step: '地面清潔',
      detail: '保持地面清潔無小物件，避免寶寶撿拾異物放入口中。',
    },
    {
      step: '鎖定櫥櫃',
      detail: '低矮櫥櫃安裝兒童安全鎖，特別是放有清潔劑、藥品的櫃子。',
    },
  ],
  warningSignals: [
    '10 個月以上完全無爬行跡象（建議發展評估）',
    '爬行姿勢異常（如只用單側手腳）',
    '寶寶誤食異物出現嗆咳或嘔吐',
  ],
  relatedArticleIds: ['rolling-safety', 'walking-safety'],
  icon: 'Snail',
};
export const entryWalkingSafety: BabyWikiArticle = {
  id: 'walking-safety',
  title: '學步注意事項',
  summary: '寶寶約 10-18 個月開始學走路，跌倒頻繁是正常現象，但需做好安全防護。',
  category: 'motor',
  causes: [
    '下肢肌力與平衡感發展至可嘗試站立行走',
    '每個寶寶發展速度不同，10-18 個月學會走路都算正常',
    '學步初期重心不穩，跌倒是學習過程的一部分',
  ],
  solutions: [
    {
      step: '赤腳學步',
      detail: '在安全的室內環境讓寶寶赤腳學步，有助腳底感覺發展與抓地力。',
    },
    {
      step: '避免學步車',
      detail:
        '台灣兒科醫學會建議不使用學步車（螃蟹車），可能造成意外且影響正常發展。',
    },
    {
      step: '適當輔助',
      detail: '可扶著家具邊緣練習站立與側行，或牽著寶寶雙手引導前行。',
    },
    {
      step: '選擇合適鞋子',
      detail: '外出時穿著軟底、防滑的學步鞋，室內盡量赤腳或穿防滑襪。',
    },
  ],
  warningSignals: [
    '18 個月仍完全無法獨立站立（建議發展評估）',
    '走路時持續踮腳尖',
    '跌倒後出現嘔吐、嗜睡等頭部受傷徵兆',
  ],
  relatedArticleIds: ['crawling-safety', 'rolling-safety'],
  icon: 'Footprints',
};
