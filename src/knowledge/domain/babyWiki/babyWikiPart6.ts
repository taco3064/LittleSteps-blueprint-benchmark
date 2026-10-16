import type { BabyWikiArticle } from '../referenceModels';
export const babyWikiPart6: BabyWikiArticle[] = [
  {
    id: 'colic',
    title: '腸絞痛',
    summary:
      '好發於 2 週至 4 個月大的嬰兒，每天固定時段（多在傍晚）持續哭鬧超過 3 小時。',
    category: 'digestive',
    causes: [
      '腸道神經系統發育未成熟，腸道蠕動不規律',
      '喝奶時吞入過多空氣，造成脹氣不適',
      '對配方奶蛋白質或母乳中某些成分敏感',
    ],
    solutions: [
      {
        step: '飛機抱姿勢',
        detail: '讓寶寶趴在前臂上（飛機抱），腹部受壓有助排氣。',
      },
      {
        step: '順時針腹部按摩',
        detail: '以肚臍為中心，用指腹順時針輕輕畫圓按摩，幫助腸道蠕動。',
      },
      { step: '充分拍嗝', detail: '每次餵奶中途與餵完後都要拍嗝，減少腹脹。' },
      {
        step: '白噪音安撫',
        detail: '使用吹風機聲、流水聲等白噪音，模擬子宮內環境安撫寶寶。',
      },
      {
        step: '注意奶瓶選擇',
        detail: '使用防脹氣奶瓶，確保奶嘴孔大小合適，減少吞入空氣。',
      },
    ],
    warningSignals: [
      '伴隨嘔吐、腹瀉、血便等症狀',
      '哭鬧時腹部明顯鼓脹且僵硬',
      '超過 4 個月仍未改善',
      '體重增長停滯',
    ],
    relatedArticleIds: ['constipation', 'nursing-strike'],
    icon: 'Frown',
  },
  {
    id: 'constipation',
    title: '便秘',
    summary: '寶寶排便困難、大便乾硬，排便時會用力哭鬧，常見於開始添加副食品後。',
    category: 'digestive',
    causes: [
      '副食品添加初期膳食纖維攝取不足',
      '水分攝取不夠，尤其是開始吃副食品後',
      '配方奶中的鐵質可能使大便較硬',
    ],
    solutions: [
      {
        step: '增加水分',
        detail: '開始吃副食品後，餐間額外補充適量開水（每日約 30-60ml）。',
      },
      {
        step: '高纖食物',
        detail: '在副食品中加入黑棗泥、梨子泥、地瓜泥等富含纖維的食材。',
      },
      {
        step: '腹部按摩',
        detail: '每日在寶寶腹部做順時針按摩，每次 5-10 分鐘，促進腸胃蠕動。',
      },
      {
        step: '被動運動',
        detail: '讓寶寶仰躺，握住雙腳做踩腳踏車的動作，幫助腸道排氣。',
      },
    ],
    warningSignals: [
      '大便帶血或黏液',
      '超過 5 天未排便且腹脹明顯',
      '寶寶因排便疼痛而持續哭鬧不安',
      '伴隨嘔吐或食慾明顯下降',
    ],
    relatedArticleIds: ['colic', 'nursing-strike'],
    icon: 'Gauge',
  },
  {
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
  },
];
