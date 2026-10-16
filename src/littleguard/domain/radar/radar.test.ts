import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DISEASE_PART_OF } from '../diseases/index';
import type { RadarCell } from '../radarModels/index';
import {
  describeGeoRatio,
  describeVisits,
  FORBIDDEN_WORDS,
  formatRate,
  formatWeekRange,
  freshnessOf,
  GEO_THRESHOLDS,
  inSentence,
  RADAR_THRESHOLDS,
  STATUS_COPY,
  statusOf,
  summariseBoard,
} from './index';

const HERE = dirname(fileURLToPath(import.meta.url));

/** 只覆寫關心的欄位，其餘給一組「分母夠大、算得出比值」的預設。 */
function cell(overrides: Partial<RadarCell>): RadarCell {
  return {
    rate: 100,
    trendBase: 100,
    ratio: 1,
    geoRatio: 1,
    visits: 20,
    denom: 2000,
    reliability: 'ok',
    spark: [null, null, null, null, null, null, null, 100],
    ...overrides,
  };
}

describe('inSentence', () => {
  it('西文病名在中文句子裡前後留空白', () => {
    // 「這一週COVID-19比平常多」擠在一起，而全 repo 其他文案都是「WHO 的標準」
    // 這種寫法。
    expect(inSentence('COVID-19')).toBe(' COVID-19 ');
  });

  it('中文病名不加空白', () => {
    // 加了會變成「這一週類流感 比平常多」。
    expect(inSentence('類流感')).toBe('類流感');
  });

  it('只有貼著中文的那一側不加', () => {
    expect(inSentence('類流感、COVID-19')).toBe('類流感、COVID-19 ');
  });

  it('標點自己帶間距，不再加空白', () => {
    // 判準是「頭尾是不是拉丁字母或數字」，不是「是不是漢字」——否則全形括號
    // 結尾的病名會變成「…（EV71） 比平常多」。
    expect(inSentence('腸病毒（EV71）')).toBe('腸病毒（EV71）');
  });
});

describe('statusOf 的邊界', () => {
  // 邊界綁在 RADAR_THRESHOLDS 上，不再抄一份數字：門檻是實測百分位，資料一
  // 加就會變（加進 COVID-19 那次 P90 從 1.77 移到 1.9），而這三條要守的是
  // 「下界本身算在內」這個規則，不是那三個值。值本身由下面那條對著 JSON 比。
  it('P90 是「最近變多，多留意」的下界，且下界本身算在內', () => {
    expect(statusOf(cell({ ratio: RADAR_THRESHOLDS.p90 }))).toBe('risingStrong');
    expect(statusOf(cell({ ratio: RADAR_THRESHOLDS.p90 - 0.001 }))).toBe('rising');
  });

  it('P75 是「稍微變多」的下界', () => {
    expect(statusOf(cell({ ratio: RADAR_THRESHOLDS.p75 }))).toBe('rising');
    expect(statusOf(cell({ ratio: RADAR_THRESHOLDS.p75 - 0.001 }))).toBe('steady');
  });

  it('P25 是「跟平常差不多」的下界', () => {
    expect(statusOf(cell({ ratio: RADAR_THRESHOLDS.p25 }))).toBe('steady');
    expect(statusOf(cell({ ratio: RADAR_THRESHOLDS.p25 - 0.001 }))).toBe('falling');
  });
});

describe('statusOf 的基線為零', () => {
  it('前 8 週與本週都沒有個案 → 最近沒有個案', () => {
    expect(statusOf(cell({ rate: 0, trendBase: 0, ratio: null, visits: 0 }))).toBe(
      'none',
    );
  });

  it('前 8 週沒有、本週開始有 → 這週開始出現，而不是無限倍', () => {
    expect(statusOf(cell({ rate: 12, trendBase: 0, ratio: null, visits: 3 }))).toBe(
      'emerged',
    );
  });
});

describe('statusOf 的基線算不出來', () => {
  it('前 8 週有效點數不夠 → 還不夠資料比較，不能說成這週開始出現', () => {
    // 這一格可能一直都有個案，只是算不出比較基準，說「這週開始出現」是不實陳述。
    const withCases = cell({ rate: 12, trendBase: null, ratio: null, visits: 3 });

    expect(statusOf(withCases)).toBe('noBaseline');
    expect(statusOf(withCases)).not.toBe('emerged');

    // 本週也沒有個案時，同樣不能斷言「最近沒有個案」——我們並不知道。
    const withoutCases = cell({ rate: 0, trendBase: null, ratio: null, visits: 0 });

    expect(statusOf(withoutCases)).toBe('noBaseline');
    expect(statusOf(withoutCases)).not.toBe('none');
  });

  it('基線有效卻算不出比值 → 不謊稱跟平常差不多', () => {
    expect(statusOf(cell({ trendBase: 100, ratio: null }))).toBe('noBaseline');
  });
});

describe('statusOf 的樣本品質優先於比值', () => {
  it('分母 300–999 只標樣本偏小，不給狀態', () => {
    expect(statusOf(cell({ reliability: 'small', ratio: 3 }))).toBe('smallSample');
  });

  it('分母不足 300 是資料不足', () => {
    expect(
      statusOf(
        cell({ reliability: 'insufficient', rate: null, ratio: null, denom: 29 }),
      ),
    ).toBe('insufficient');
  });
});

describe('freshnessOf', () => {
  const weekEnd = '2026-08-29';

  it('14 天內是新的', () => {
    expect(freshnessOf(weekEnd, new Date('2026-09-12T00:00:00Z'))).toBe('fresh');
  });

  it('超過 14 天但不到 35 天是有點舊', () => {
    expect(freshnessOf(weekEnd, new Date('2026-09-13T00:00:00Z'))).toBe('stale');
    expect(freshnessOf(weekEnd, new Date('2026-10-03T00:00:00Z'))).toBe('stale');
  });

  it('超過 35 天要收起狀態', () => {
    expect(freshnessOf(weekEnd, new Date('2026-10-04T00:00:00Z'))).toBe('expired');
  });
});

/**
 * spec §6.1 第 3 條的禁用詞，逐字抄在測試這一側。
 *
 * 刻意不從 radar.ts 取用 FORBIDDEN_WORDS 來檢查文案：那是套套邏輯——實作只要
 * 把某個詞從清單裡刪掉、同時把它寫進 STATUS_COPY，測試照樣綠。真正要守的是
 * spec 的清單，所以由測試自己持有一份。
 */
const BANNED_IN_SPEC = [
  '警戒',
  '升溫',
  '爆發',
  '危險',
  '疫情嚴峻',
  '拉警報',
  '慎防',
] as const;

describe('語氣', () => {
  it('九個狀態的文案都不含 spec 的禁用詞', () => {
    for (const { label } of Object.values(STATUS_COPY)) {
      for (const word of BANNED_IN_SPEC) {
        expect(label).not.toContain(word);
      }
    }
  });

  it('FORBIDDEN_WORDS 這個對外契約涵蓋 spec 的七個詞', () => {
    for (const word of BANNED_IN_SPEC) {
      expect(FORBIDDEN_WORDS).toContain(word);
    }
  });

  it('沒有任何狀態用到 primary-dark——那是全 app 最強的文字色', () => {
    for (const { tone } of Object.values(STATUS_COPY)) {
      expect(tone).not.toContain('primary-dark');
    }
  });

  it('狀態文案不含箭頭與驚嘆號', () => {
    for (const { label } of Object.values(STATUS_COPY)) {
      expect(label).not.toMatch(/[↑↓→!！]/);
    }
  });
});

describe('formatRate', () => {
  it('沒有率的時候給破折號，不給 0', () => {
    expect(formatRate(null)).toBe('—');
  });

  it('保留一位小數並帶單位', () => {
    expect(formatRate(169)).toBe('169.0/萬');
  });
});

describe('formatWeekRange', () => {
  it('同年的疫情週給月/日，不給「第 34 週」', () => {
    expect(formatWeekRange('2026-08-23', '2026-08-29')).toBe('8/23–8/29');
  });

  it('跨年的週照樣只給月/日，不會冒出年份', () => {
    expect(formatWeekRange('2025-12-28', '2026-01-03')).toBe('12/28–1/3');
  });

  it('月與日都去掉補零——家長寫日期不寫 08/09', () => {
    expect(formatWeekRange('2026-01-04', '2026-01-10')).toBe('1/4–1/10');
    expect(formatWeekRange('2026-10-11', '2026-10-17')).toBe('10/11–10/17');
  });

  it('分隔符是 en dash（U+2013），不是 hyphen', () => {
    const range = formatWeekRange('2026-08-23', '2026-08-29');

    expect(range).toContain('\u2013');
    expect(range).not.toContain('-');
  });
});

describe('門檻常數', () => {
  it('與 spec §4.5 的百分位一致', () => {
    expect(RADAR_THRESHOLDS).toEqual({ p25: 0.74, p75: 1.29, p90: 1.9 });
  });
});

describe('門檻與 shipped 資料的校準', () => {
  it('程式碼常數沒有跟資料分布漂開', () => {
    // 動態 import 避開 vitest 的 happy-dom 環境對 node:fs 的限制順序問題。
    const data = JSON.parse(
      readFileSync(join(HERE, '../../../../public/data/diseaseRadar.json'), 'utf8'),
    );

    expect(
      Math.abs(data.calibration.trendP25 - RADAR_THRESHOLDS.p25),
    ).toBeLessThanOrEqual(0.05);

    expect(
      Math.abs(data.calibration.trendP75 - RADAR_THRESHOLDS.p75),
    ).toBeLessThanOrEqual(0.05);

    expect(
      Math.abs(data.calibration.trendP90 - RADAR_THRESHOLDS.p90),
    ).toBeLessThanOrEqual(0.05);
  });
});

describe('門檻常數（全國比較）', () => {
  it('與 spec §geoRatio 的實測百分位一致', () => {
    expect(GEO_THRESHOLDS).toEqual({ p25: 0.66, p75: 1.19 });
  });
});

describe('summariseBoard', () => {
  const board = (ratios: Record<string, number>) =>
    Object.entries(ratios).map(([disease, ratio]) => ({
      disease,
      cell: cell({ ratio }),
    }));

  it('沒有哪一列變多的時候把話說完整，不是留白', () => {
    // 「這禮拜沒事」也要講出來。只在有事時才出現的那一行，本身就是警示燈號。
    expect(
      summariseBoard(board({ 腸病毒: 0.4, 類流感: 1.0, 腹瀉: 1.1, 水痘: 0.9 })),
    ).toBe('這一週沒有哪一種比平常明顯多。');
  });

  it('有幾列變多就點名那幾列，其他一句話帶過', () => {
    expect(
      summariseBoard(board({ 腸病毒: 0.4, 類流感: 1.44, 腹瀉: 1.0, 水痘: 2.2 })),
    ).toBe('這一週類流感、水痘比平常多，其他沒有變多。');
  });

  it('每一列都在變多的時候不說「其他」——那個「其他」是空的', () => {
    expect(summariseBoard(board({ 腸病毒: 1.3, 類流感: 1.9 }))).toBe(
      '這一週腸病毒、類流感比平常多。',
    );
  });

  it('這週開始出現也算變多，算不出基線的不算', () => {
    // emerged 是「前 8 週真的一例都沒有，這週有了」，那是家長要知道的事；
    // noBaseline 只是我們算不出比較基準，說它變多是不實陳述。
    const rows = [
      { disease: '水痘', cell: cell({ rate: 12, trendBase: 0, ratio: null }) },
      { disease: '腹瀉', cell: cell({ trendBase: null, ratio: null }) },
    ];

    // 剩下那一列是「還不夠資料比較」，不是「沒事」，所以不替它做保證。
    expect(summariseBoard(rows)).toBe('這一週水痘比平常多。');
  });

  it('沒有列可以總結的時候也不編一句話', () => {
    expect(summariseBoard([])).toBe('這一週沒有哪一種比平常明顯多。');
  });

  it('一列都比不出來的時候承認比不出來，不替沒有的資料背書', () => {
    // 連江縣 0-2 歲整塊板都是「資料不足」。那一週給「沒有哪一種比平常明顯多」，
    // 等於用不存在的資料讓家長安心，而且跟板上四列直接打對台。
    const rows = [
      { disease: '腸病毒', cell: cell({ reliability: 'insufficient' }) },
      { disease: '類流感', cell: cell({ reliability: 'small' }) },
      { disease: '腹瀉', cell: cell({ trendBase: null, ratio: null }) },
    ];

    expect(summariseBoard(rows)).toBe(
      '這一週的資料還不夠，比不出這幾種病最近多還是少。',
    );
  });

  it('只要有一列比得出來，那句話就撐得起來', () => {
    const rows = [
      { disease: '腸病毒', cell: cell({ reliability: 'insufficient' }) },
      { disease: '類流感', cell: cell({ ratio: 1.0 }) },
    ];

    expect(summariseBoard(rows)).toBe('這一週沒有哪一種比平常明顯多。');
  });

  it('shipped 資料的每一塊板，總結都不含 spec 的禁用詞', () => {
    const data = JSON.parse(
      readFileSync(join(HERE, '../../../../public/data/diseaseRadar.json'), 'utf8'),
    );

    const rows: string[] = data.diseases.filter(
      (name: string) => !(name in DISEASE_PART_OF),
    );

    for (const county of Object.keys(data.counties)) {
      for (const age of data.ageBands as string[]) {
        const line = summariseBoard(
          rows.map((disease) => ({
            disease,
            cell: data.counties[county][age][disease],
          })),
        );

        for (const word of BANNED_IN_SPEC) {
          expect(line, `${county} ${age}`).not.toContain(word);
        }

        expect(line).not.toMatch(/[↑↓→!！]/);
      }
    }
  });
});

describe('describeVisits', () => {
  const args = { county: '台北市', age: '0~2', disease: '類流感' };

  it('先講人次，再講跟前 8 週的平常值差多少', () => {
    expect(
      describeVisits({ ...args, cell: cell({ visits: 413, ratio: 1.44 }) }),
    ).toBe('台北市 0-2 歲這一週有 413 次因類流感就診，比前 8 週的平常值多約 44%。');
  });

  it('比平常少也照實說，不只講變多的那一半', () => {
    expect(
      describeVisits({ ...args, cell: cell({ visits: 176, ratio: 0.64 }) }),
    ).toBe('台北市 0-2 歲這一週有 176 次因類流感就診，比前 8 週的平常值少約 36%。');
  });

  it('差距不到 5% 就說差不多，不把雜訊講成趨勢', () => {
    expect(
      describeVisits({ ...args, cell: cell({ visits: 389, ratio: 0.96 }) }),
    ).toBe('台北市 0-2 歲這一週有 389 次因類流感就診，跟前 8 週的平常值差不多。');
  });

  it('翻倍以上改講「幾倍」，不要家長自己把 165% 加回去', () => {
    // 2.65 在 double 裡略小於 2.65，所以 toFixed(1) 給 2.6 而不是 2.7。這是
    // 出貨資料真正會產生的字串（台北市 0-2 歲 COVID-19 這一週），不要「修」成
    // 四捨五入——句子開頭已經說了「大約是」。
    expect(
      describeVisits({
        ...args,
        disease: 'COVID-19',
        cell: cell({ visits: 71, ratio: 2.65 }),
      }),
    ).toBe(
      '台北市 0-2 歲這一週有 71 次因 COVID-19 就診，大約是前 8 週平常值的 2.6 倍。',
    );
  });

  it('剛好翻倍就開始講倍數，差一點還是講百分比', () => {
    // 兩種說法在這個點一樣清楚，所以邊界要寫死，否則同一格這週講倍數下週講 %。
    expect(
      describeVisits({ ...args, cell: cell({ visits: 40, ratio: 2 }) }),
    ).toContain('大約是前 8 週平常值的 2.0 倍');

    expect(
      describeVisits({ ...args, cell: cell({ visits: 40, ratio: 1.99 }) }),
    ).toContain('多約 99%');
  });

  it('比不出來的時候用板上同一套說法，不另外發明一組', () => {
    const reasons = [
      cell({ visits: 0, trendBase: null, ratio: null }),
      cell({ visits: 0, rate: 0, trendBase: 0, ratio: null }),
      cell({ visits: 3, rate: 12, trendBase: 0, ratio: null }),
    ].map((radarCell) => describeVisits({ ...args, cell: radarCell }));

    expect(reasons[0]).toContain(STATUS_COPY.noBaseline.label);
    expect(reasons[1]).toContain(STATUS_COPY.none.label);
    expect(reasons[2]).toContain(STATUS_COPY.emerged.label);
    reasons.forEach((sentence) => expect(sentence).not.toContain('%'));
  });

  it('年齡層講家長的說法，不講資料的鍵值', () => {
    const sentence = describeVisits({
      ...args,
      age: '7~12',
      cell: cell({ visits: 20 }),
    });

    expect(sentence).toContain('台北市 7-12 歲');
    expect(sentence).not.toContain('7~12');
  });
});

describe('describeGeoRatio', () => {
  it('P25 與 P75 兩個切點本身都算「差不多」', () => {
    // 邊界落在哪一邊要寫死，否則同一個 0.66 這週偏少、下週差不多。
    expect(describeGeoRatio(GEO_THRESHOLDS.p25)).toBe(
      '跟全國同一週相比，這裡差不多。',
    );

    expect(describeGeoRatio(GEO_THRESHOLDS.p75)).toBe(
      '跟全國同一週相比，這裡差不多。',
    );
  });

  it('低於 P25 說偏少，高於 P75 說偏多', () => {
    expect(describeGeoRatio(0.65)).toBe('跟全國同一週相比，這裡偏少。');
    expect(describeGeoRatio(1.2)).toBe('跟全國同一週相比，這裡偏多。');
  });

  it('算不出來就不給句子，不編一個', () => {
    expect(describeGeoRatio(null)).toBeNull();
  });
});
