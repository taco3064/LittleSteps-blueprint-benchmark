import type { BabyWikiArticle } from '../records';
export const entrySidsPrevention: BabyWikiArticle
  // ── 睡眠問題 ──
  = {
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
  };
