import { describe, expect, it } from 'vitest';
import type { VenueKind } from '../venueModels/index';
import { outingChecklist } from './index';

/**
 * 清單本身不會過期，所以測試守的不是內容新舊，而是它仍然「可渲染、可篩選」：
 * id 不重複（UI 用它當 key 與勾選狀態的鍵）、appliesTo 合法（篩錯會讓某一分頁
 * 整片空白）、每項都真的有 why（why 是這份清單存在的理由，空著就只剩待辦事項）。
 */
const ALL_VENUE_KINDS = Object.keys({
  centre: true,
  restaurant: true,
} satisfies Record<VenueKind, true>) as VenueKind[];

describe('outingChecklist', () => {
  it('項目數維持在可讀完的長度，且 id 不重複', () => {
    // 太短漏掉主要失敗模式，太長家長不會讀完；出門前的清單只有幾十秒的注意力。
    expect(outingChecklist.length).toBeGreaterThanOrEqual(8);
    expect(outingChecklist.length).toBeLessThanOrEqual(12);
    const ids = outingChecklist.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每項都有問題與理由，且理由是單句（不含換行）', () => {
    outingChecklist.forEach((item) => {
      expect(item.question.trim().length, item.id).toBeGreaterThan(0);
      expect(item.why.trim().length, item.id).toBeGreaterThan(0);
      expect(item.why.includes('\n'), `${item.id} 的 why 應該是一句話`).toBe(false);
    });
  });

  it('appliesTo 是 both，或是不重複的合法 VenueKind 陣列', () => {
    outingChecklist.forEach((item) => {
      if (item.appliesTo === 'both') {
        return;
      }

      expect(Array.isArray(item.appliesTo), item.id).toBe(true);

      expect(
        item.appliesTo.length,
        `${item.id} 的 appliesTo 是空陣列`,
      ).toBeGreaterThan(0);

      expect(new Set(item.appliesTo).size, `${item.id} 的 appliesTo 有重複`).toBe(
        item.appliesTo.length,
      );

      item.appliesTo.forEach((kind) =>
        expect(ALL_VENUE_KINDS, `${item.id} 的 ${kind}`).toContain(kind),
      );
    });
  });

  it('用 both 表示兩者皆適用，不用列出全部 kind', () => {
    // ['centre','restaurant'] 與 'both' 意思相同，兩種寫法並存會讓篩選邏輯分岔。
    const redundant = outingChecklist.filter(
      (item) =>
        item.appliesTo !== 'both'
        && item.appliesTo.length === ALL_VENUE_KINDS.length,
    );

    expect(redundant.map((item) => item.id)).toEqual([]);
  });

  it('每種場館類型都篩得到項目，不會出現空清單', () => {
    ALL_VENUE_KINDS.forEach((kind) => {
      const applicable = outingChecklist.filter(
        (item) => item.appliesTo === 'both' || item.appliesTo.includes(kind),
      );

      expect(applicable.length, `${kind} 沒有任何適用項目`).toBeGreaterThan(0);
    });
  });

  it('訂位確認排在第一項', () => {
    // 順序是照「多常搞砸一趟行程」排的，訂位是抱怨量最大的一類，不該被重排掉。
    expect(outingChecklist[0].id).toBe('booking-confirmed');
  });
});
