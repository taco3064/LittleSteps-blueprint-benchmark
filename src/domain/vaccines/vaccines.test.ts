import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import type { VaccineSchedule } from '../records';
import { vaccineSchedules } from './vaccines';
import { toLocalDateKey } from '../dateHelpers';

/**
 * 明列同一支疫苗的所有劑次記錄。
 *
 * 成員用述詞而不是 id 前綴：前綴一樣不代表同一支疫苗，也不代表同一種產品。
 * `pneumococcal-15v-6m` 是另一支疫苗，`pneumococcal-highrisk-6m` 是常規時程
 * 之外另外增加的 1 劑；輪狀病毒的 2 劑型與 3 劑型是兩種產品，各有自己的劑數
 * 與最後期限。述詞說得出「哪些不算」，清單才不會被一列同前綴的新資料默默
 * 吸收。
 */
const VACCINE_FAMILIES: Record<
  string,
  { belongs: (id: string) => boolean; ids: string[] }
> = {
  日本腦炎: { belongs: (id) => id.startsWith('je-'), ids: ['je-15m', 'je-27m'] },
  A型肝炎: { belongs: (id) => id.startsWith('hepa-'), ids: ['hepa-12m', 'hepa-18m'] },
  '13價肺炎鏈球菌（公費常規時程）': {
    belongs: (id) =>
      id.startsWith('pneumococcal-')
      && id !== 'pneumococcal-15v-6m'
      && id !== 'pneumococcal-highrisk-6m',
    ids: ['pneumococcal-2m', 'pneumococcal-4m', 'pneumococcal-12m'],
  },
  '輪狀病毒（2劑型）': {
    belongs: (id) =>
      id.startsWith('rotavirus-') && !id.startsWith('rotavirus-3dose-'),
    ids: ['rotavirus-2m', 'rotavirus-4m'],
  },
  '輪狀病毒（3劑型）': {
    belongs: (id) => id.startsWith('rotavirus-3dose-'),
    ids: ['rotavirus-3dose-2m', 'rotavirus-3dose-4m', 'rotavirus-3dose-6m'],
  },
};

const byId = (id: string): VaccineSchedule | undefined =>
  vaccineSchedules.find((v) => v.id === id);

describe('vaccineSchedules 時程正確性', () => {
  describe.each(Object.entries(VACCINE_FAMILIES))('%s', (_name, { belongs, ids }) => {
    it('資料集中恰好只有這些劑次記錄', () => {
      const actual = vaccineSchedules
        .filter((v) => belongs(v.id))
        .map((v) => v.id)
        .sort();

      expect(actual).toEqual([...ids].sort());
    });

    it('所有劑次宣告相同的 doses 總數，且等於實際劑次數', () => {
      const records = ids.map((id) => byId(id));

      records.forEach((r, i) => expect(r, `缺少 ${ids[i]}`).toBeDefined());
      const declared = new Set(records.map((r) => r!.doses));

      expect(declared.size).toBe(1);
      expect([...declared][0]).toBe(ids.length);
    });

    it('currentDose 為連號 1..N，且 ageInMonths 隨劑次嚴格遞增', () => {
      const records = ids.map((id) => byId(id)!);

      expect(records.map((r) => r.currentDose)).toEqual(records.map((_, i) => i + 1));

      const ages = records.map((r) => r.ageInMonths!);

      for (let i = 1; i < ages.length; i++) {
        expect(ages[i]).toBeGreaterThan(ages[i - 1]);
      }
    });
  });

  it('日本腦炎採 15／27 個月的 2 劑活性減毒時程', () => {
    expect(byId('je-15m')!.ageInMonths).toBe(15);
    expect(byId('je-27m')!.ageInMonths).toBe(27);
    expect(byId('je-27m')!.name).toContain('第2劑');
  });

  it('A 型肝炎採 18／27 個月時程（114/1/1 起調整）', () => {
    expect(byId('hepa-12m')!.ageInMonths).toBe(18);
    expect(byId('hepa-12m')!.timing).toBe('出生滿18個月');
    expect(byId('hepa-18m')!.ageInMonths).toBe(27);
    expect(byId('hepa-18m')!.timing).toBe('出生滿27個月');
  });

  it('13 價肺炎鏈球菌的公費時程就是來源寫的 3 劑：2、4、12-15 個月', () => {
    // 疾管署：「全面推動嬰幼兒接種3劑PCV13，接種時程依序為出生滿2個月、
    // 4個月及12-15個月，如為高危險群對象，出生滿6個月時可增加接種1劑」。
    //
    // 這一條比對的是來源，不是資料自己前後一致：曾經有一列 24 個月的「第 4
    // 劑」標成公費，而且四列都寫 doses: 4——內部完全自洽，只是和官方時程不
    // 一樣。15 價是另一支自費疫苗，不屬於這個時程。
    const pcv13 = vaccineSchedules.filter(
      (v) =>
        v.id.startsWith('pneumococcal-')
        && v.id !== 'pneumococcal-15v-6m'
        && v.id !== 'pneumococcal-highrisk-6m',
    );

    expect(pcv13.map((v) => v.ageInMonths).sort((a, b) => a! - b!)).toEqual([
      2, 4, 12,
    ]);

    expect([...new Set(pcv13.map((v) => v.doses))]).toEqual([3]);
    expect([...new Set(pcv13.map((v) => v.funding))]).toEqual(['national']);
    // 常規那 3 劑對每一個孩子都成立，所以沒有一劑帶條件。
    expect(pcv13.every((v) => !v.eligibility)).toBe(true);
  });

  it('高危險群那一劑是另外增加的 1 劑，不是常規時程的第 4 劑', () => {
    // 來源同一句話的後半段：「如為高危險群對象，出生滿6個月時可增加接種1劑」。
    // 寫成 doses: 4 就等於宣稱常規時程有 4 劑，那是 #23 拔掉的那一列的錯法；
    // 沒有 eligibility 則會讓它變成每個孩子都欠的一劑，那是 #33 的錯法。
    const highRisk = byId('pneumococcal-highrisk-6m');

    expect(highRisk).toBeDefined();
    expect(highRisk!.funding).toBe('national');
    expect(highRisk!.ageInMonths).toBe(6);
    expect(highRisk!.doses).toBe(1);
    expect(highRisk!.currentDose).toBe(1);
    expect(highRisk!.eligibility).toContain('高危險群');
    // 逐字引用，不是改寫：這一句 2026-09-07 對照過疾管署 PCV13「疫苗簡介」頁
    // 「公費對象及接種時程」那一段（#73）。改寫過的條文會讓家長拿著一句官方
    // 頁面上找不到的話去問醫師。
    expect(highRisk!.eligibility).toContain('出生滿6個月時可增加接種1劑');

    // 認定的依據是 ICD code 參考表，不是這一段文字自己。
    expect(highRisk!.sourceUrl).toBe(
      'https://www.cdc.gov.tw/Category/Page/t-6cjd2WDeB6NdExzrQCVw',
    );
  });

  it('輪狀病毒 3 劑型有 6 個月那一劑，2 劑型沒有', () => {
    // 兩種劑型的最後期限不同（24 週對 32 週），壓成一列就說不出這件事。
    expect(byId('rotavirus-2m')!.doses).toBe(2);
    expect(byId('rotavirus-3dose-2m')!.doses).toBe(3);
    expect(byId('rotavirus-3dose-6m')!.ageInMonths).toBe(6);
  });
});

/**
 * 出處與查證日期。
 *
 * 這一份是疾管署的公費時程，會隨政策改，而且改了不會有人通知——檔案自己就
 * 記過 hepa 兩劑的時程從 12/18 個月改成 18/27 個月。沒有出處的一劑，下一個
 * 人沒有辦法判斷它是查過的還是抄來的；下面這幾條就是不讓那種劑次進來。
 */
describe('vaccineSchedules 的出處', () => {
  it('每一劑都有 https 的出處', () => {
    const missing = vaccineSchedules
      .filter((v) => !/^https:\/\/\S+$/.test(v.sourceUrl))
      .map((v) => `${v.id} ${v.name}`);

    expect(missing, '新增劑次請一併標出處，不要留空也不要編一個').toEqual([]);
  });

  it('有條件的劑次一定寫得出條件', () => {
    // nhi-conditional 與 local-varies 沒有條件就等於沒有意義：家長讀到
    // 「有條件給付」卻不知道是什麼條件，比直接寫自費更糟。
    const conditional = vaccineSchedules.filter(
      (v) => v.funding === 'nhi-conditional' || v.funding === 'local-varies',
    );

    expect(conditional.length).toBeGreaterThan(0);

    conditional.forEach((v) => {
      expect(v.eligibility?.trim(), `${v.id} 缺少 eligibility`).toBeTruthy();
    });
  });

  it('公費而帶條件的劑次，條件不能只是一句空話', () => {
    // 「公費，但只給名單上的孩子」是最容易寫錯的一種：條件含糊，讀到的家長
    // 會以為自己符合。所以要指得出認定的依據，也要說清楚不符合的孩子沒有欠
    // 一劑國家規定的疫苗——那正是把這種劑次排除在提醒之外的理由。
    const gated = vaccineSchedules.filter(
      (v) => v.funding === 'national' && v.eligibility,
    );

    expect(gated.length).toBeGreaterThan(0);

    gated.forEach((v) => {
      expect(
        v.eligibility!.length,
        `${v.id} 的條件太短，講不出誰符合`,
      ).toBeGreaterThan(20);

      expect(v.notes ?? '', `${v.id} 要說清楚不符合條件的孩子沒有漏打`).toContain(
        '沒有漏打',
      );
    });
  });

  it('沒有一劑宣稱的劑次大於自己的總劑數', () => {
    // 「第 4 劑／共 3 劑」這種列一定有一邊是編的。這一條是回歸防護：
    // 它擋的是下一次，不是這一次。
    const impossible = vaccineSchedules
      .filter((v) => (v.currentDose ?? 1) > v.doses)
      .map((v) => `${v.id} 第 ${v.currentDose} 劑／共 ${v.doses} 劑`);

    expect(impossible).toEqual([]);
  });

  it('檔頭的查證日期不是未來', () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), 'vaccines.ts'),
      'utf8',
    );

    const verifiedOn = source.match(/(\d{4}-\d{2}-\d{2})\s*查證/)?.[1];

    expect(verifiedOn, '檔頭要有「YYYY-MM-DD 查證」').toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(verifiedOn! <= new Date().toISOString().slice(0, 10)).toBe(true);
  });
});

describe('RSV 單株抗體的兩種產品', () => {
  const rsv = vaccineSchedules.filter((v) => v.id.startsWith('rsv-'));

  it('是兩列而不是一列，付費方式各自標明', () => {
    // 壓成一列「自費」時，早產兒的家長讀到的是兩萬多元的自付額，
    // 而其中一種對他們的孩子是有健保給付條件的。
    expect(rsv.map((v) => v.funding).sort()).toEqual([
      'nhi-conditional',
      'self-paid',
    ]);
  });

  it('有健保給付條件的那一列，把高風險條件講出來', () => {
    const reimbursed = rsv.find((v) => v.funding === 'nhi-conditional');

    expect(reimbursed).toBeDefined();

    for (const condition of ['1歲以下', '早產', '先天性心臟病', '慢性肺病']) {
      expect(reimbursed!.eligibility).toContain(condition);
    }
  });
});

/**
 * 已公告、但還沒生效的付費方式改變。
 *
 * 查證日期擋不住這一種錯：改變的日期是已知的，而且就落在保鮮期裡——檔案到
 * 那天都還算「新鮮」，funding 卻已經是錯的。標上日期，下面第一條會在那天之
 * 後轉紅，而不是等到有家長照著過期的付費方式做預算。
 */
describe('已公告的付費方式改變', () => {
  const announced = vaccineSchedules.filter((v) => v.fundingChangesOn);

  it('每個日期都還沒到——過了就代表 funding 停在舊的', () => {
    const today = toLocalDateKey(new Date());

    const passed = announced
      .filter((v) => v.fundingChangesOn! <= today)
      .map((v) => `${v.id} ${v.name}：${v.fundingChangesOn} 起的付費方式已經改了`);

    expect(
      passed,
      '改變日已過，請更新這幾列的 funding 並移除 fundingChangesOn',
    ).toEqual([]);
  });

  it('公告的出處跟著劑次走，不是只留在註解裡', () => {
    // #10 立的規矩：一個宣稱要跟得到它的出處。這幾列最強的宣稱是「以後會改成
    // 公費」，而 sourceUrl 指的是疾管署的產品頁——那一頁根本沒提這件事。所以
    // 公告的網址必須另外出現在家長讀得到的欄位裡。
    announced.forEach((v) => {
      const shown = `${v.notes ?? ''} ${v.eligibility ?? ''}`;

      const urls = (shown.match(/https:\/\/\S+/g) ?? []).filter(
        (u) => u !== v.sourceUrl,
      );

      expect(urls, `${v.id} 的付費方式改變沒有附上公告出處`).not.toEqual([]);
    });
  });

  it('日期寫成 YYYY-MM-DD，否則上面那條比不出大小', () => {
    announced.forEach((v) => {
      expect(v.fundingChangesOn, `${v.id} 的 fundingChangesOn 格式不對`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
    });
  });

  it('輪狀病毒的公費化日期寫在資料裡，不是只寫在註解裡', () => {
    // 幼兒百科早就告訴家長 2027 年 1 月 1 日改公費，疫苗頁卻只寫自費。
    // 兩份資料講同一件事就要一起過期，而不是各自過期。
    const rotavirus = vaccineSchedules.filter((v) => v.id.startsWith('rotavirus-'));

    expect(rotavirus.length).toBeGreaterThan(0);

    rotavirus.forEach((v) => {
      expect(v.fundingChangesOn, `${v.id} 少了公費化日期`).toBe('2027-01-01');
    });
  });
});
