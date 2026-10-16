import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { toLocalDateKey } from '~app/platform/domain/calendar';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/**
 * 內容有沒有保存期限。
 *
 * 這個 app 的資料分三套不相容的引用慣例：
 *   1. 每筆都有 sourceUrl + verifiedOn，且有測試強制（親子餐廳、親子館）
 *   2. 每筆有 source 字串，但只有檔頭一個粗略的年月（幼兒照護任務、產檢）
 *   3. 只有檔頭註解加行內引用註解——不是 TypeScript 欄位，任何測試都看不到
 *      （三份 wiki、發展檢核、每月小提醒、長牙）
 *
 * 第三套是問題所在：註解式的日期沒有任何機制會過期。全 repo 掃過一遍，
 * 沒有任何一個測試在「日期太舊」時轉紅——現有的日期測試只擋造假與未來日期。
 *
 * 這組測試不去替沒查證過的資料補日期（那是造假），而是做兩件事：
 *   * 把目前沒有日期的檔案逐一列名，讓缺口看得見而不是感覺得到
 *   * 新的資料檔不准再加進那份名單，所以缺口只會縮不會長
 */

/**
 * 「查證關鍵字後面 60 字內出現一個 YYYY-MM-DD」才算有查證日期。
 *
 * 第一版只找關鍵字，兩個方向都錯：查核日期（查「核」不是查「證」）的三個檔案
 * 被誤判成沒有日期，而 outingChecklist / venueTags 只是在文章裡討論
 * 「為什麼不需要 verifiedOn」，卻因為出現了那個字被誤判成有日期。
 * 要的是日期本身，不是提到過這件事。
 */
// 關鍵字放寬到光是「查證」「查核」：primaryTeeth 寫的是「2026-08-27 查核」，
// 沒有「日期」二字。放寬沒有變鬆，因為下面仍然要求視窗裡真的有一個日期。
const KEYWORD = /查證|查核|verifiedOn|dateModified/g;
const ISO_DATE = /\d{4}-\d{2}-\d{2}/;

/** 回傳檔案裡所有查證日期；空陣列代表沒有。 */
function verificationDates(source: string): string[] {
  const found: string[] = [];

  for (const match of source.matchAll(KEYWORD)) {
    // 前後都看：primaryTeeth 寫成「（2026-08-27 查核」，日期在關鍵字前面，
    // 只往後找會漏掉。
    const window = source.slice(
      Math.max(0, match.index - 30),
      match.index + 60,
    );

    const date = window.match(ISO_DATE);

    if (date) {
      found.push(date[0]);
    }
  }

  return found;
}

/**
 * 目前沒有查證日期的資料檔。
 *
 * 每一筆都要有理由。理由不是「還沒做」，而是「為什麼今天可以沒有」。
 * 這份名單只能變短。
 */
const UNDATED: Record<string, string> = {
  'knowledge/domain/milestones/data.ts':
    '發展里程碑，需對照國健署兒童健康手冊逐條查證後再標日期。',
  'knowledge/domain/babyWiki/data.ts':
    '15 篇寶寶百科。另外兩份 wiki（littlebloom、littleexplorer）都有引用與日期，'
    + '這一份沒有，看起來是漏掉而不是決定。',
  'littlesteps/domain/sleep/data.ts':
    '睡眠時數建議來自 AAP／NSF，需逐項對照後標日期。',
  'littlesteps/domain/careGuides/data.ts':
    '每月照護重點，需對照國健署兒童健康手冊逐條查證後再標日期，同里程碑。',
  'littlesteps/domain/complementaryFood/data.ts':
    '副食品指引，需對照國健署嬰兒期營養手冊。',
  'littlebloom/domain/pregnancyGuides/data.ts':
    '孕期每週指南；repo 裡引用列表最長的一份，但沒有日期。',
  'littleouting/domain/outingChecklist/data.ts':
    '出門清單是通則整理，不是可查證的外部事實——檔內已說明。',
  'littleouting/domain/venueTags/data.ts':
    '標籤詞彙表本身沒有外部來源可查——它定義的是 UI 詞彙，不是可查證的事實。',
  'knowledge/domain/careTasks/data.ts':
    '檔頭有「2026-08 對照官方頁面」但沒有日；每筆有 source。',
  'knowledge/domain/prenatalCheckups/data.ts':
    '檔頭只有「2026-08 對照官方頁面」沒有日；每筆有 source，補一個日就能移出名單。',
};

/** Reference datasets live in domain unit data.ts files, including future units. */
function dataFiles(): string[] {
  const visit = (dir: string): string[] => readdirSync(dir).flatMap((entry) => {
    const file = join(dir, entry);

    if (statSync(file).isDirectory()) {
      return visit(file);
    }

    return entry === 'data.ts' ? [file] : [];
  });

  return readdirSync(SRC).flatMap((module) => {
    const domain = join(SRC, module, 'domain');

    return existsSync(domain) ? visit(domain) : [];
  });
}

function referenceSource(file: string): string {
  const unit = dirname(file);

  return readdirSync(unit)
    .filter((name) => name.endsWith('.ts') && !/\.(test|spec)\./.test(name))
    .map((name) => readFileSync(join(unit, name), 'utf8'))
    .join('\n');
}

describe('資料檔的查證日期', () => {
  const files = dataFiles();

  it('掃描範圍不是空的', () => {
    // 目錄列舉壞掉時，下面兩條規則會安靜地永遠通過。
    expect(files.length).toBeGreaterThanOrEqual(22);
  });

  it('沒有日期的檔案就是名單上那幾個，不能多', () => {
    const undated = files
      .filter(
        (file) => verificationDates(referenceSource(file)).length === 0,
      )
      .map((file) => relative(SRC, file));

    const unexpected = undated.filter((file) => !(file in UNDATED));

    expect(
      unexpected,
      '新的資料檔請附查證日期，或在 UNDATED 列名並寫下理由',
    ).toEqual([]);
  });

  it('名單上的檔案如果補了日期，就要從名單移除', () => {
    // 反向檢查：名單過期會讓上面那條規則越來越鬆。
    const stillUndated = Object.keys(UNDATED).filter((file) => {
      try {
        return (
          verificationDates(referenceSource(join(SRC, file))).length === 0
        );
      } catch {
        return false; // 檔案沒了，下面那條會抓到
      }
    });

    const fixed = Object.keys(UNDATED).filter(
      (file) => !stillUndated.includes(file),
    );

    expect(fixed, '這些檔案已經有日期了，請從 UNDATED 移除').toEqual([]);
  });

  it('每條例外都寫得出理由', () => {
    for (const [file, reason] of Object.entries(UNDATED)) {
      expect(reason.length, `${file} 的理由不能留空`).toBeGreaterThan(15);
    }
  });
});

describe('有日期的資料不能悄悄變舊', () => {
  /**
   * 上限訂 18 個月。
   *
   * 這些內容引用的是政府方案、費用、年齡門檻與疫苗時程——都會隨政策改，而且
   * 改了不會有人通知。18 個月不是醫學標準，是「一年一次年度校對，加半年緩衝」：
   * 抓太緊會讓測試在正常維護節奏裡一直紅，紅到最後大家把它關掉。
   */
  const MAX_AGE_MONTHS = 18;

  it('每個查證日期都在 18 個月內', () => {
    const cutoff = new Date();

    cutoff.setMonth(cutoff.getMonth() - MAX_AGE_MONTHS);
    const cutoffKey = toLocalDateKey(cutoff);

    const stale: string[] = [];

    for (const file of dataFiles()) {
      for (const date of verificationDates(referenceSource(file))) {
        if (date < cutoffKey) {
          stale.push(`${relative(SRC, file)}: ${date}`);
        }
      }
    }

    expect(stale, `超過 ${MAX_AGE_MONTHS} 個月沒重新查證`).toEqual([]);
  });
});
