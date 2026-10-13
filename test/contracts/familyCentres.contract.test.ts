import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Venue, VenueTag } from '../../src/domain/records';
import { toLocalDateKey } from '../../src/domain/dateHelpers';
import { CENTRE_ACCESS } from '../../src/domain/centreAccess';

/**
 * public/data/familyCentres.json 由 scripts/buildFamilyCentres.cjs 從社家署
 * 《全國親子館(托育資源中心)名冊(115.06)》與臺北市育兒友善園開放資料產生。
 *
 * 這些測試守的是「重跑管線後資料仍然對得上官方數字」。名冊的縣市欄位用
 * rowspan 合併，跨頁還會重複，只要承接邏輯壞掉就會整批算到隔壁縣市——那種
 * 錯誤在畫面上看起來完全正常，只有數字對不上才抓得到，所以逐縣市釘住館數。
 */
const venues: Venue[] = JSON.parse(
  readFileSync(join(__dirname, '../../public/data/familyCentres.json'), 'utf8'),
);

const centres = venues.filter((venue) => venue.id.startsWith('centre-'));
const youyuan = venues.filter((venue) => venue.id.startsWith('youyuan-'));

/** 名冊自己公布的各縣市館數。 */
const EXPECTED_BY_CITY: Record<string, number> = {
  新北市: 63,
  臺北市: 13,
  桃園市: 24,
  臺中市: 26,
  高雄市: 24,
  宜蘭縣: 14,
  臺南市: 13,
  彰化縣: 10,
  基隆市: 7,
  雲林縣: 6,
  屏東縣: 5,
  臺東縣: 4,
  花蓮縣: 4,
  苗栗縣: 3,
  新竹市: 3,
  金門縣: 3,
  南投縣: 3,
  新竹縣: 2,
  嘉義縣: 2,
  嘉義市: 2,
  連江縣: 2,
  澎湖縣: 1,
};

/**
 * 用 Record<VenueTag, true> 而不是手寫陣列：少列一個標籤 TypeScript 就編不過，
 * 所以這份清單不可能和 VenueTag 走鐘。
 */
const LEGAL_TAGS: Record<VenueTag, true> = {
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
};

/** 托育資源中心這個方案本身就保證的四件事，每一館都該有。 */
const PROGRAMME_TAGS: VenueTag[] = [
  'free',
  'guardianRequired',
  'indoor',
  'toyLending',
];

/** 這份資料唯一允許出現的標籤。其餘設施沒有來源，不能出現。 */
const ALLOWED_TAGS: Partial<Record<VenueTag, true>> = {
  free: true,
  guardianRequired: true,
  indoor: true,
  toyLending: true,
  needsBooking: true,
};

describe('全國親子館資料', () => {
  it('全國名冊剛好 234 筆，育兒友善園不併入', () => {
    expect(centres.length).toBe(234);
    expect(centres.length + youyuan.length).toBe(venues.length);
  });

  it('每個縣市的館數都對上名冊公布的數字', () => {
    const byCity: Record<string, number> = {};

    centres.forEach((venue) => {
      byCity[venue.city] = (byCity[venue.city] || 0) + 1;
    });

    expect(byCity).toEqual(EXPECTED_BY_CITY);
  });

  it('id 不重複', () => {
    expect(new Set(venues.map((venue) => venue.id)).size).toBe(venues.length);
  });

  it('沒有同名同址的重複記錄', () => {
    const keys = venues.map((venue) => `${venue.name}@${venue.address}`);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('必填欄位都有值', () => {
    const incomplete = venues.filter(
      (venue) =>
        !venue.name ||
        !venue.city ||
        !venue.district ||
        !venue.address ||
        !venue.sourceUrl ||
        !venue.verifiedOn ||
        venue.tags.length === 0,
    );

    expect(incomplete.map((venue) => venue.id)).toEqual([]);
  });

  it('kind 一律是 centre', () => {
    expect([...new Set(venues.map((venue) => venue.kind))]).toEqual(['centre']);
  });

  it('每個標籤都是合法的 VenueTag', () => {
    const illegal = venues.flatMap((venue) =>
      venue.tags
        .filter((tag) => !(tag in LEGAL_TAGS))
        .map((tag) => `${venue.id}: ${tag}`),
    );

    expect(illegal).toEqual([]);
  });

  it('verifiedOn 是可解析、不在未來的 YYYY-MM-DD', () => {
    // 本地時區的今天。台灣是 UTC+8，用 toISOString() 取日期會在 08:00 前得到
    // 前一天，讓「今天剛查證」的資料被誤判成未來日期。
    const today = toLocalDateKey();

    const bad = venues.filter(
      (venue) =>
        !/^\d{4}-\d{2}-\d{2}$/.test(venue.verifiedOn) ||
        // 回填一次才抓得到 2026-02-31 這種形式正確但不存在的日期。
        new Date(venue.verifiedOn).toISOString().slice(0, 10) !== venue.verifiedOn ||
        venue.verifiedOn > today,
    );

    expect(bad.map((venue) => `${venue.id} ${venue.verifiedOn}`)).toEqual([]);
  });

  it('sourceUrl 都是官方網址', () => {
    const offsite = venues.filter(
      (venue) =>
        !/^https:\/\/(www\.sfaa\.gov\.tw|data\.taipei)\//.test(venue.sourceUrl),
    );

    expect(offsite.map((venue) => `${venue.id} ${venue.sourceUrl}`)).toEqual([]);
  });

  it('地址能自己指認位置：至少含縣市或行政區', () => {
    // 欄位錯位（縣市跑到地址、行政區跑到名稱）時這裡會爆。
    const orphan = venues.filter(
      (venue) =>
        !venue.address.includes(venue.city) &&
        !venue.address.includes(venue.district),
    );

    expect(
      orphan.map(
        (venue) => `${venue.id} ${venue.city}/${venue.district} ${venue.address}`,
      ),
    ).toEqual([]);
  });

  it('行政區是鄉鎮市區，不是縣市名', () => {
    const bad = venues.filter(
      (venue) => !/[區鄉鎮市]$/.test(venue.district) || venue.district === venue.city,
    );

    expect(bad.map((venue) => `${venue.id} ${venue.district}`)).toEqual([]);
  });

  it('電話沒有空白，可直接接 tel: 連結', () => {
    const malformed = venues.filter((venue) => venue.phone && /\s/.test(venue.phone));

    expect(malformed.map((venue) => `${venue.id} ${venue.phone}`)).toEqual([]);
  });

  it('年齡一律是 0-6 歲，不假造月齡精度', () => {
    const bad = venues.filter(
      (venue) =>
        !venue.ageYears || venue.ageYears[0] !== 0 || venue.ageYears[1] !== 6,
    );

    expect(bad.map((venue) => venue.id)).toEqual([]);
  });

  it('親子館一律免費、須家長陪同、室內、有教玩具借閱', () => {
    const bad = centres.filter(
      (venue) => !PROGRAMME_TAGS.every((tag) => venue.tags.includes(tag)),
    );

    expect(bad.map((venue) => venue.id)).toEqual([]);
  });

  it('沒有逐館編造的設施標籤', () => {
    // 用白名單而非黑名單：VenueTag 之後新增項目時，也不會有新標籤偷偷混進資料。
    const bad = venues.flatMap((venue) =>
      venue.tags
        .filter((tag) => !(tag in ALLOWED_TAGS))
        .map((tag) => `${venue.id}: ${tag}`),
    );

    expect(bad).toEqual([]);
  });

  it('needsBooking 只出現在 centreAccess 查證到預約報名制的縣市', () => {
    const tagged = [
      ...new Set(
        venues.filter((v) => v.tags.includes('needsBooking')).map((v) => v.city),
      ),
    ];

    const declared = Object.keys(CENTRE_ACCESS).filter((city) =>
      CENTRE_ACCESS[city].booking.value.startsWith('預約報名制'),
    );

    expect(tagged.sort()).toEqual(declared.sort());
    expect(tagged.length).toBeGreaterThan(0);
  });

  it('centreAccess 提到的每個縣市都真的有場館', () => {
    const cities = new Set(venues.map((venue) => venue.city));

    Object.keys(CENTRE_ACCESS).forEach((city) => expect(cities).toContain(city));
  });

  it('育兒友善園自成一類：只在臺北市、有說明、沒有教玩具借閱', () => {
    expect(youyuan.length).toBe(13);

    youyuan.forEach((venue) => {
      expect(venue.city).toBe('臺北市');
      expect(venue.notes).toContain('育兒友善園，非親子館');
      expect(venue.tags).not.toContain('toyLending');
    });
  });
});
