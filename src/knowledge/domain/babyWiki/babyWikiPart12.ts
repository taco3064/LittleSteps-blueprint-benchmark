import type { BabyWikiArticle } from '../referenceModels';
export const babyWikiPart12: BabyWikiArticle[] = [
  {
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
  },
  {
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
  },
  {
    id: 'sids-prevention',
    title: '嬰兒猝死症預防',
    summary:
      '嬰兒猝死症（SIDS）是 1 歲以下嬰兒的主要死因之一，可透過安全睡眠環境大幅降低風險。',
    category: 'sleep',
    causes: [
      '嬰兒腦幹呼吸中樞發育未成熟',
      '趴睡或不當睡眠環境增加窒息風險',
      '早產、低出生體重嬰兒風險較高',
    ],
    solutions: [
      {
        step: '仰睡為主',
        detail: '每次睡覺（包含午睡）都讓寶寶仰睡。會翻身後仍以仰睡放下。',
      },
      {
        step: '堅固平坦床面',
        detail: '使用符合安全標準的嬰兒床，床墊需堅固且貼合床框。',
      },
      { step: '淨空睡眠區', detail: '床上不放枕頭、棉被、填充玩偶、防撞墊等軟物。' },
      {
        step: '同室不同床',
        detail: '與父母同房但各自睡在獨立的嬰兒床中，至少至 6 個月大。',
      },
      { step: '適當溫度', detail: '室溫維持 22-26°C，穿著防踢被或睡袋取代蓋被子。' },
    ],
    warningSignals: [
      '寶寶趴睡後無法自行翻回仰躺',
      '發現寶寶呼吸暫停或臉色發紫',
      '使用非嬰兒專用的睡眠空間（如成人床、沙發）',
    ],
    relatedArticleIds: ['rolling-safety'],
    icon: 'ShieldCheck',
  },
];
