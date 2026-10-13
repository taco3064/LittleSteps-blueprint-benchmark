import { describe, it, expect } from 'vitest';
import { toLocalDateKey } from '../dateHelpers';
import {
  CENTRE_ACCESS,
  CENTRE_ACCESS_UNVERIFIED,
  CENTRE_DATA_ATTRIBUTION,
  AccessRule,
} from './centreAccess';

/**
 * centreAccess.ts 是這條資料線裡最容易悄悄腐爛的地方：規則是人工查證寫進來的，
 * 而「把某縣市的規則複製過去改個名字」在畫面上完全看不出來，家長卻會照著錯的
 * 規則出門。所以這裡守的不是「有沒有值」，而是「每一條都還連著它的官方出處，
 * 而且沒有人拿沒查證的東西當事實」。
 */

const RULE_FIELDS = ['fee', 'ageLimit', 'booking', 'residency'] as const;

const entries = Object.entries(CENTRE_ACCESS);

const allRules: { city: string; field: string; rule: AccessRule }[] = entries.flatMap(
  ([city, access]) =>
    RULE_FIELDS.map((field) => ({ city, field, rule: access[field] })),
);

/**
 * 允許當來源的網域。這個白名單存在的理由是擋部落格與媽媽社團——那些會過期，
 * 而且會互相抄。
 *
 * 要列 gov.taipei 是因為臺北市政府用自己的 .taipei gTLD（dosw.gov.taipei），
 * 不在 gov.tw 底下，只比對 gov.tw 會把臺北市的官方頁面判成外部網站。
 * 政府網域之外只開放 family.safe.org.tw：那是靖娟基金會，桃園市親子館的
 * 受委辦單位，入館須知只公布在它的館頁上。
 */
const OFFICIAL_HOSTS
  = /^https:\/\/([a-z0-9-]+\.)*(gov\.tw|gov\.taipei|family\.safe\.org\.tw)\//;

describe('各縣市親子館入館規則', () => {
  it('只收錄查證過的縣市，而且鍵值與 city 欄位一致', () => {
    expect(Object.keys(CENTRE_ACCESS)).toEqual([
      '臺北市',
      '新北市',
      '桃園市',
      '臺中市',
    ]);

    entries.forEach(([city, access]) => expect(access.city).toBe(city));
  });

  it('每一條規則都有非空的說明', () => {
    const empty = allRules.filter(({ rule }) => !rule.value.trim());

    expect(empty.map((r) => `${r.city}.${r.field}`)).toEqual([]);
  });

  it('每一條規則的來源都是官方網址', () => {
    const offsite = allRules.filter(
      ({ rule }) => !OFFICIAL_HOSTS.test(rule.sourceUrl),
    );

    expect(offsite.map((r) => `${r.city}.${r.field} ${r.rule.sourceUrl}`)).toEqual(
      [],
    );
  });

  it('每一條規則的 verifiedOn 是可解析、不在未來的 YYYY-MM-DD', () => {
    // 本地時區的今天。台灣是 UTC+8，用 toISOString() 取日期會在 08:00 前得到
    // 前一天，讓「今天剛查證」的規則被誤判成未來日期。
    const today = toLocalDateKey();

    const bad = allRules.filter(
      ({ rule }) =>
        !/^\d{4}-\d{2}-\d{2}$/.test(rule.verifiedOn)
        || new Date(rule.verifiedOn).toISOString().slice(0, 10) !== rule.verifiedOn
        || rule.verifiedOn > today,
    );

    expect(bad.map((r) => `${r.city}.${r.field} ${r.rule.verifiedOn}`)).toEqual([]);
  });

  it('沒有人拿「尚未查證」的字串當作已查證的規則', () => {
    // 缺規則就整個縣市不要收錄，不要留一條寫著 fallback 的假規則。
    const faked = allRules.filter(({ rule }) =>
      rule.value.includes(CENTRE_ACCESS_UNVERIFIED),
    );

    expect(faked.map((r) => `${r.city}.${r.field}`)).toEqual([]);
  });

  it('未查證的縣市回傳 undefined，不會拿別縣市的規則頂替', () => {
    expect(CENTRE_ACCESS['雲林縣']).toBeUndefined();
    expect(CENTRE_ACCESS_UNVERIFIED).toMatch(/尚未查證/);
    expect(CENTRE_ACCESS_UNVERIFIED).toMatch(/各館公告/);
  });

  it('查不到明文的規則要說出來，不能寫成「沒有限制」', () => {
    // 新北市的官方報名須知通篇沒提戶籍。留白會被讀成「不限戶籍」，那是推論。
    expect(CENTRE_ACCESS['新北市'].residency.value).toMatch(/未見|未經確認|尚未查證/);
    // 反過來，桃園與臺中是明文寫出不限戶籍的，必須看得出差別。
    expect(CENTRE_ACCESS['桃園市'].residency.value).toMatch(/不限戶籍/);
    expect(CENTRE_ACCESS['臺中市'].residency.value).toMatch(/不限戶籍/);
  });

  it('收費規則不會把「部分收費」寫成免費', () => {
    // 新北遊戲空間免費但主題活動每場 100 元，這個差別是家長最容易踩到的坑。
    const ntpc = CENTRE_ACCESS['新北市'].fee.value;

    expect(ntpc).toMatch(/免費/);
    expect(ntpc).toMatch(/100\s*元/);
  });

  it('needsBooking 的判準只有新北市成立', () => {
    // familyCentres 的標籤是照 booking.value 開頭是不是「預約報名制」決定的，
    // 改動措辭會連帶改變場館標籤，所以這個字串是契約而不是文案。
    const mandatory = Object.keys(CENTRE_ACCESS).filter((city) =>
      CENTRE_ACCESS[city].booking.value.startsWith('預約報名制'),
    );

    expect(mandatory).toEqual(['新北市']);
  });

  it('可現場排隊的縣市要講清楚不預約也能去', () => {
    expect(CENTRE_ACCESS['桃園市'].booking.value).toMatch(/不預約也能去/);
    expect(CENTRE_ACCESS['臺中市'].booking.value).toMatch(/不預約也能去/);
  });

  it('來源標示把授權條件講齊，缺一段就等於沒取得授權', () => {
    // 政府資料開放授權條款第 1 版要求標示「資料提供機關」與「來源」，
    // 未依格式標示視為自始未取得授權，所以這四段都不能被文案精簡掉。
    expect(CENTRE_DATA_ATTRIBUTION).toContain('衛生福利部社會及家庭署');
    expect(CENTRE_DATA_ATTRIBUTION).toContain('臺北市政府社會局');
    expect(CENTRE_DATA_ATTRIBUTION).toContain('政府資料開放授權條款第 1 版');
    expect(CENTRE_DATA_ATTRIBUTION).toMatch(/查證日期 \d{4}-\d{2}-\d{2}/);
  });
});
