import type { BabyWikiArticle } from '../records';
export const entryTeething: BabyWikiArticle
  // ── 口腔與長牙 ──
  = {
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
  };
