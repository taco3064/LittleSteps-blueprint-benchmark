import { describe, it, expect } from 'vitest';
import type { VenueTag } from '../records';
import { toLocalDateKey } from '../dateHelpers';
import { restaurants } from './restaurants';
import { venueTagLabels, VENUE_TAG_GROUPS } from '../venueTags';

/**
 * 親子餐廳是這個服務裡唯一人工維護的資料，沒有上游管線可以重跑，所以測試守的是
 * 「這 12 筆仍然是可以帶著孩子出門用的資料」：欄位齊全、查證日期看得見、標籤在
 * 詞彙表內。任何一筆缺 sourceUrl 或 verifiedOn，就等於回到「憑印象寫」的狀態。
 *
 * ALL_VENUE_TAGS 用 satisfies Record<VenueTag, true> 列舉：VenueTag 之後增刪成員時
 * 這裡會直接編譯失敗，而不是安靜地漏測一個標籤。
 */
const ALL_VENUE_TAGS = Object.keys({
  free: true,
  needsBooking: true,
  walkInQueue: true,
  guardianRequired: true,
  diaperTable: true,
  nursingRoom: true,
  highChair: true,
  kidsTableware: true,
  playArea: true,
  toyLending: true,
  parking: true,
  nearMetro: true,
  strollerAccess: true,
  indoor: true,
  outdoor: true,
  privateRoom: true,
  socksRequired: true,
} satisfies Record<VenueTag, true>) as VenueTag[];

describe('venueTagLabels', () => {
  it('每個 VenueTag 都有標籤，且沒有多出來的鍵', () => {
    expect(Object.keys(venueTagLabels).sort()).toEqual([...ALL_VENUE_TAGS].sort());
  });

  it('每個標籤都是非空的中文字串', () => {
    Object.entries(venueTagLabels).forEach(([tag, label]) => {
      expect(label.length, tag).toBeGreaterThan(0);
      expect(label.trim(), tag).toBe(label);
    });
  });
});

describe('VENUE_TAG_GROUPS', () => {
  it('恰好切分全部標籤，不重複也不遺漏', () => {
    const grouped = VENUE_TAG_GROUPS.flatMap((group) => group.tags);

    expect(new Set(grouped).size, '同一個標籤出現在多個分組').toBe(grouped.length);
    expect([...grouped].sort()).toEqual([...ALL_VENUE_TAGS].sort());
  });

  it('每個分組都有名稱且至少一個標籤', () => {
    VENUE_TAG_GROUPS.forEach((group) => {
      expect(group.label.length).toBeGreaterThan(0);
      expect(group.tags.length, group.label).toBeGreaterThan(0);
    });
  });
});

describe('親子餐廳樣本', () => {
  it('12 筆，且 id 不重複', () => {
    expect(restaurants).toHaveLength(12);
    const ids = restaurants.map((venue) => venue.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('維持樣本規模，沒有被當成名錄擴充', () => {
    // 沒有官方資料集、也沒有管線可重跑，人工清單一大就開始腐壞
    // （WooHoo 遊戲屋 2020 年結束營業，2018 年的推薦文至今仍在搜尋結果裡）。
    // 要超過這個量，先寫一條有來源的管線，不要繼續手工加。
    expect(restaurants.length).toBeLessThanOrEqual(30);
  });

  it('每筆都是 restaurant', () => {
    restaurants.forEach((venue) => expect(venue.kind, venue.id).toBe('restaurant'));
  });

  it('名稱、縣市、行政區、地址、來源網址都不是空的', () => {
    const incomplete = restaurants.filter(
      (venue) =>
        !venue.name.trim()
        || !venue.city.trim()
        || !venue.district.trim()
        || !venue.address.trim()
        || !venue.sourceUrl.trim(),
    );

    expect(incomplete.map((venue) => venue.id)).toEqual([]);
  });

  it('地址開頭的縣市與 city 一致，且含 district', () => {
    const mismatched = restaurants.filter(
      (venue) =>
        !venue.address.startsWith(venue.city)
        || !venue.address.includes(venue.district),
    );

    expect(mismatched.map((venue) => `${venue.id}: ${venue.address}`)).toEqual([]);
  });

  it('sourceUrl 是 https 網址', () => {
    const bad = restaurants.filter(
      (venue) => !venue.sourceUrl.startsWith('https://'),
    );

    expect(bad.map((venue) => venue.id)).toEqual([]);
  });

  it('verifiedOn 是 YYYY-MM-DD，且是真實且非未來的日期', () => {
    // 本地時區的今天。台灣是 UTC+8，用 toISOString() 取日期會在 08:00 前得到前一天，
    // 讓「今天剛查證」的資料被誤判成未來日期。
    const today = toLocalDateKey();

    restaurants.forEach((venue) => {
      expect(venue.verifiedOn, venue.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      expect(new Date(venue.verifiedOn).toISOString().slice(0, 10), venue.id).toBe(
        venue.verifiedOn,
      );

      expect(venue.verifiedOn <= today, `${venue.id} 的查證日期在未來`).toBe(true);
    });
  });

  it('每個標籤都是合法的 VenueTag，且同一筆不重複', () => {
    restaurants.forEach((venue) => {
      venue.tags.forEach((tag) =>
        expect(ALL_VENUE_TAGS, `${venue.id} 的 ${tag}`).toContain(tag),
      );

      expect(new Set(venue.tags).size, `${venue.id} 有重複標籤`).toBe(
        venue.tags.length,
      );
    });
  });

  it('餐廳不會帶 free：免費入場是親子館的性質', () => {
    const free = restaurants.filter((venue) => venue.tags.includes('free'));

    expect(free.map((venue) => venue.id)).toEqual([]);
  });

  it('minSpend 有值時必須是正數', () => {
    restaurants.forEach((venue) => {
      if (venue.minSpend === undefined) {
        return;
      }

      expect(Number.isFinite(venue.minSpend), venue.id).toBe(true);
      expect(venue.minSpend, venue.id).toBeGreaterThan(0);
    });
  });

  it('ageYears 有值時是遞增的歲數區間', () => {
    restaurants.forEach((venue) => {
      if (!venue.ageYears) {
        return;
      }

      const [from, to] = venue.ageYears;

      expect(from, venue.id).toBeGreaterThanOrEqual(0);
      expect(from, venue.id).toBeLessThanOrEqual(to);
      expect(to, venue.id).toBeLessThanOrEqual(18);
    });
  });

  it('電話缺漏時維持 undefined，有值時不含空白，可直接用於 tel:', () => {
    restaurants.forEach((venue) => {
      expect(venue.phone, `${venue.id} 用空字串代替 undefined`).not.toBe('');

      if (venue.phone) {
        expect(/\s/.test(venue.phone), `${venue.id}: ${venue.phone}`).toBe(false);
      }
    });
  });

  it('bookingUrl 有值時是 https 網址', () => {
    restaurants.forEach((venue) => {
      if (!venue.bookingUrl) {
        return;
      }

      expect(venue.bookingUrl.startsWith('https://'), venue.id).toBe(true);
    });
  });

  it('沒有同名同址的重複記錄', () => {
    const keys = restaurants.map((venue) => `${venue.name}@${venue.address}`);

    expect(new Set(keys).size).toBe(keys.length);
  });
});
