import { describe, expect, it } from 'vitest';
import type { ChildProfile } from '~app/family/domain/familyRecords/index';
import { entryPageForChild, serviceForStage, stageOfChild } from './stageEntry';

/**
 * 登入後原本一律跳 littlesteps/dashboard，只看「有沒有孩子」這個布林值。
 * LandingPage 對 isPregnancy 與 birthday 都是 0 處引用，所以只有孕期檔案的
 * 使用者會落在嬰兒儀表板上，兩歲孩子的家長會落在里程碑資料早就到頂的頁面。
 */

const monthsAgo = (n: number) => {
  const d = new Date();

  d.setMonth(d.getMonth() - n);
  d.setDate(d.getDate() - 1); // 避開剛好同一天造成的邊界抖動

  return d.toISOString().slice(0, 10);
};

const child = (over: Partial<ChildProfile> = {}): ChildProfile => ({
  id: 'c1',
  name: '小明',
  birthday: monthsAgo(3),
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: monthsAgo(3),
  createdBy: 'u1',
  members: { u1: true },
  ...over,
});

const pregnancy = (): ChildProfile =>
  child({
    isPregnancy: true,
    pregnancyData: {
      dueDate: '2027-01-01',
      lastPeriodDate: '2026-03-26',
      status: 'active',
    },
  } as Partial<ChildProfile>);

describe('stageOfChild', () => {
  it('孕期檔案就是孕期，不管 birthday 寫了什麼', () => {
    expect(stageOfChild(pregnancy())).toBe('pregnancy');
  });

  it('未滿一歲是嬰兒期', () => {
    expect(stageOfChild(child({ birthday: monthsAgo(0) }))).toBe('baby');
    expect(stageOfChild(child({ birthday: monthsAgo(11) }))).toBe('baby');
  });

  it('一歲到三歲是幼兒期', () => {
    expect(stageOfChild(child({ birthday: monthsAgo(12) }))).toBe('toddler');
    expect(stageOfChild(child({ birthday: monthsAgo(35) }))).toBe('toddler');
  });

  it('超過三歲是三歲以後', () => {
    expect(stageOfChild(child({ birthday: monthsAgo(37) }))).toBe('beyond');
  });

  it('沒有孩子就沒有階段', () => {
    expect(stageOfChild(undefined)).toBeUndefined();
  });
});

describe('entryPageForChild', () => {
  it('孕婦去 LittleBloom，不是嬰兒儀表板', () => {
    // 這就是原本的 bug。
    expect(entryPageForChild(pregnancy())).toBe('littlebloom');
  });

  it('嬰兒去 LittleSteps 儀表板', () => {
    expect(entryPageForChild(child({ birthday: monthsAgo(4) }))).toBe(
      'littlesteps/dashboard',
    );
  });

  it('幼兒去 LittleExplorer', () => {
    expect(entryPageForChild(child({ birthday: monthsAgo(20) }))).toBe(
      'littleexplorer',
    );
  });

  it('滿三歲之後回 LittleSteps：那裡還有疫苗到期提醒', () => {
    // 幼兒期的資料到 36 個月就停了，送過去只會看到畢業卡；而 32 劑疫苗裡
    // 有 3 劑排在 48-60 個月，儀表板的到期卡片還照顧得到。
    expect(entryPageForChild(child({ birthday: monthsAgo(40) }))).toBe(
      'littlesteps/dashboard',
    );
  });

  it('還沒有孩子時留在入口，不自動跳進任何服務', () => {
    // 跳進去只會看到一個空的頁面，而下一步其實是新增檔案。
    expect(entryPageForChild(undefined)).toBe('home');
  });
});

describe('serviceForStage', () => {
  it('每個階段都指得出一個服務', () => {
    expect(serviceForStage('pregnancy')).toBe('littlebloom');
    expect(serviceForStage('baby')).toBe('littlesteps');
    expect(serviceForStage('toddler')).toBe('littleexplorer');
    expect(serviceForStage('beyond')).toBe('littlesteps');
  });

  it('沒有階段就不標記——入口頁是公開的，訪客看到的要和以前一樣', () => {
    expect(serviceForStage(undefined)).toBeUndefined();
  });
});
