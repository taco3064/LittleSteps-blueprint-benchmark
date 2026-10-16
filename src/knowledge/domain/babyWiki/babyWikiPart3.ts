import type { BabyWikiArticle } from '../referenceModels';
export const babyWikiPart3: BabyWikiArticle[] = [
  {
    id: 'roseola',
    title: '玫瑰疹',
    summary:
      '好發於 6 個月至 2 歲嬰幼兒，先高燒 3-5 天，退燒後全身出現粉紅色斑丘疹。',
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
  },
  {
    id: 'teething',
    title: '長牙不適',
    summary:
      '寶寶約 4-10 個月開始長牙，可能出現牙齦腫脹、流口水增加、情緒不安等症狀。',
    category: 'oral',
    causes: [
      '牙齒穿破牙齦時造成的壓力與不適感',
      '長牙過程中牙齦充血腫脹，刺激神經末梢',
      '口水分泌增加但吞嚥能力尚未成熟',
    ],
    solutions: [
      {
        step: '冰涼固齒器',
        detail: '將固齒器放入冰箱冷藏（非冷凍），冰涼感可舒緩牙齦腫脹。',
      },
      { step: '清潔紗布按摩', detail: '用乾淨濕紗布輕輕按摩寶寶牙齦，減輕不適感。' },
      {
        step: '提供咬食物品',
        detail: '給予適齡的磨牙餅乾或冰涼的蔬菜棒（如紅蘿蔔條）讓寶寶啃咬。',
      },
      {
        step: '轉移注意力',
        detail: '用遊戲、音樂等方式分散寶寶對牙齦不適的注意力。',
      },
    ],
    warningSignals: [
      '發燒超過 38.5°C 持續超過 24 小時（可能非長牙引起）',
      '牙齦嚴重紅腫、化膿或出血不止',
      '寶寶完全拒絕進食超過一天',
    ],
    relatedArticleIds: ['drool-rash', 'nursing-strike'],
    icon: 'Smile',
  },
  {
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
  },
];
