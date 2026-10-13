import type { BabyWikiArticle } from '../records';
export const entryNursingStrike: BabyWikiArticle
  // ── 腸胃與排便 ──
  = {
    id: 'nursing-strike',
    title: '厭奶期',
    summary: '寶寶突然對奶量明顯減少或拒絕喝奶，常見於 3-4 個月與 6-8 個月。',
    category: 'digestive',
    causes: [
      '生理性厭奶：寶寶開始對環境好奇，注意力分散不專心喝奶',
      '長牙、鵝口瘡等口腔不適導致喝奶疼痛',
      '副食品添加後味覺改變，對單調奶味興趣下降',
    ],
    solutions: [
      {
        step: '營造安靜環境',
        detail: '在安靜、光線柔和的環境中餵奶，減少外界干擾。',
      },
      { step: '少量多餐', detail: '不強迫寶寶一次喝完，改為少量多次餵食。' },
      {
        step: '調整餵食時機',
        detail: '在寶寶半睡半醒或剛睡醒時餵奶，此時較不抗拒。',
      },
      {
        step: '耐心等待',
        detail: '生理性厭奶通常持續 1-4 週會自然恢復，不需過度焦慮。',
      },
    ],
    warningSignals: [
      '體重持續下降或生長曲線明顯偏離',
      '尿量明顯減少（一天少於 6 次濕尿布）',
      '厭奶超過一個月且精神活力下降',
    ],
    relatedArticleIds: ['teething', 'colic'],
    icon: 'MilkOff',
  };
export const entryColic: BabyWikiArticle = {
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
};
export const entryConstipation: BabyWikiArticle = {
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
};
