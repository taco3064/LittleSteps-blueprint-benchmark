import { describe, it, expect } from 'vitest';
import type { ChildProfile } from '../records';
import { isPregnancyProfile, resolvePregnancyChild } from './pregnancy';

/**
 * 回歸測試：家長已經有寶寶檔案，再新增孕期檔案之後，LittleBloom 一直說
 * 「還沒有孕期檔案」。
 *
 * 原因不在畫面而在認主：整個 LittleBloom 讀的是 currentChild，而
 * currentChildId 只在新增第一個孩子時才自動指過去。第二個檔案建好了，
 * 選取的仍是原本那個寶寶。
 */

const profile = (over: Partial<ChildProfile> = {}): ChildProfile => ({
  id: 'c1',
  name: '小豆',
  birthday: '2025-02-27',
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2025-02-27T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
  ...over,
});

const pregnancy = (over: Partial<ChildProfile> = {}): ChildProfile =>
  profile({
    id: 'p1',
    name: '寶寶',
    birthday: '2026-11-20',
    isPregnancy: true,
    pregnancyData: {
      childId: 'p1',
      dueDate: '2026-11-20',
      lastPeriodDate: '2026-02-13',
      status: 'active',
    },
    ...over,
  });

describe('resolvePregnancyChild', () => {
  it('已經有寶寶檔案時，新增的孕期檔案還是認得出來', () => {
    // 這就是回報的情境：選取的是寶寶，孕期檔案排在後面。
    const baby = profile();
    const bump = pregnancy();

    expect(resolvePregnancyChild([baby, bump], baby)).toBe(bump);
  });

  it('孕期檔案就是選取中的那一份時也一樣', () => {
    const bump = pregnancy();

    expect(resolvePregnancyChild([bump], bump)).toBe(bump);
  });

  it('完全沒有孕期資料時回 undefined，畫面才會顯示空狀態', () => {
    const baby = profile();

    expect(resolvePregnancyChild([baby], baby)).toBeUndefined();
    expect(resolvePregnancyChild([], null)).toBeUndefined();
  });

  it('孕期已封存且正是選取中的檔案時回它——那是剛生完，要看「已經出生」', () => {
    const born = pregnancy({
      isPregnancy: true,
      pregnancyData: {
        childId: 'p1',
        dueDate: '2026-11-20',
        lastPeriodDate: '2026-02-13',
        status: 'archived',
      },
    });

    expect(isPregnancyProfile(born)).toBe(false);
    expect(resolvePregnancyChild([born], born)).toBe(born);
  });

  it('進行中的孕期優先於已封存的', () => {
    // 生完一胎又懷第二胎的人，該看到的是現在這一胎。
    const born = pregnancy({
      id: 'p0',
      pregnancyData: {
        childId: 'p0',
        dueDate: '2025-01-01',
        lastPeriodDate: '2024-03-26',
        status: 'archived',
      },
    });

    const bump = pregnancy();

    expect(resolvePregnancyChild([born, bump], born)).toBe(bump);
  });
});
