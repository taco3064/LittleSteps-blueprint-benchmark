import { describe, expect, it } from 'vitest';
import type { ChildProfile } from '../../../family/domain/familyRecords/index';
import { monthRangeForChild, vaccineMonthForChild } from './ageDefaults';

/**
 * 里程碑與疫苗兩頁原本都從 0 個月起跑，因為它們沒拿到孩子的資料。這組測試
 * 釘住「起點跟著孩子的月齡走」，因為這是家長每次進來都會遇到的第一件事。
 */

/** 造一個剛好 `months` 個月大的孩子。用當天日期回推，避免測試隨時間過期。 */
const childAged = (
  months: number,
  overrides: Partial<ChildProfile> = {},
): ChildProfile => {
  const birth = new Date();

  birth.setMonth(birth.getMonth() - months);

  return {
    id: 'c1',
    name: '小豆',
    birthday: birth.toISOString().slice(0, 10),
    milestoneProgress: {},
    vaccineProgress: {},
    createdAt: new Date().toISOString(),
    createdBy: 'u1',
    members: { u1: true },
    ...overrides,
  };
};

const VACCINE_MONTHS = [0, 1, 2, 4, 5, 6, 12, 15, 18, 24, 27, 48, 60];

describe('monthRangeForChild', () => {
  it.each([
    [0, '0-2'],
    [2, '0-2'],
    [3, '3-4'],
    [6, '5-6'],
    [8, '7-9'],
    [11, '10-12'],
  ])('%i 個月大落在 %s 這一段', (months, expected) => {
    expect(monthRangeForChild(childAged(months))).toBe(expected);
  });

  it('超過 12 個月留在最後一段，而不是掉回 0-2', () => {
    // 里程碑資料只到 12 個月。滿一歲之後把家長丟回出生那一段最沒有道理。
    expect(monthRangeForChild(childAged(18))).toBe('10-12');
  });

  it('沒有孩子時回最前面', () => {
    expect(monthRangeForChild(null)).toBe('0-2');
    expect(monthRangeForChild(undefined)).toBe('0-2');
  });

  it('孕期檔案回最前面——還沒出生，沒有月齡可算', () => {
    const pregnancy = childAged(0, {
      isPregnancy: true,
      pregnancyData: {
        childId: 'c1',
        dueDate: '2026-12-01',
        lastPeriodDate: '2026-02-24',
        status: 'active',
      },
    });

    expect(monthRangeForChild(pregnancy)).toBe('0-2');
  });

  it('早產寶寶用矯正年齡挑區間', () => {
    // 32 週出生、實際 8 個月大：發育進度該對照 6 個月那一段。
    expect(monthRangeForChild(childAged(8, { gestationalAgeWeeks: 32 }))).toBe(
      '5-6',
    );
  });

  it('足月寶寶填了週數也不會被矯正', () => {
    expect(monthRangeForChild(childAged(8, { gestationalAgeWeeks: 39 }))).toBe(
      '7-9',
    );
  });
});

describe('vaccineMonthForChild', () => {
  it('挑已經到期的最後一個分組，不是最接近的', () => {
    // 家長最常做的是補登剛打完的那一劑，那一劑必然已經到期。
    expect(vaccineMonthForChild(childAged(8), VACCINE_MONTHS)).toBe(6);
    expect(vaccineMonthForChild(childAged(13), VACCINE_MONTHS)).toBe(12);
  });

  it('分組日期剛好等於月齡時算已到期', () => {
    expect(vaccineMonthForChild(childAged(12), VACCINE_MONTHS)).toBe(12);
  });

  it('新生兒落在 0 個月', () => {
    expect(vaccineMonthForChild(childAged(0), VACCINE_MONTHS)).toBe(0);
  });

  it('超過最後一個分組時停在最後一個', () => {
    expect(vaccineMonthForChild(childAged(72), VACCINE_MONTHS)).toBe(60);
  });

  it('沒有孩子或孕期檔案時顯示全部', () => {
    expect(vaccineMonthForChild(null, VACCINE_MONTHS)).toBe('all');

    const pregnancy = childAged(0, {
      isPregnancy: true,
      pregnancyData: {
        childId: 'c1',
        dueDate: '2026-12-01',
        lastPeriodDate: '2026-02-24',
        status: 'active',
      },
    });

    expect(vaccineMonthForChild(pregnancy, VACCINE_MONTHS)).toBe('all');
  });

  it('沒有任何分組時顯示全部，而不是回傳 undefined', () => {
    expect(vaccineMonthForChild(childAged(8), [])).toBe('all');
  });

  // 這一條與 monthRangeForChild 的早產測試是一對：同一份檔案裡兩個函式刻意
  // 用不同的年齡。公費疫苗時程依出生日期排定，早產兒不例外。
  it('早產寶寶的疫苗分組不矯正，照實際月齡走', () => {
    expect(
      vaccineMonthForChild(
        childAged(8, { gestationalAgeWeeks: 32 }),
        VACCINE_MONTHS,
      ),
    ).toBe(6);

    expect(
      vaccineMonthForChild(
        childAged(13, { gestationalAgeWeeks: 30 }),
        VACCINE_MONTHS,
      ),
    ).toBe(12);
  });
});
