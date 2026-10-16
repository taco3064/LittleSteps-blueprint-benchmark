import { describe, it, expect } from 'vitest';
import type { ResolvedCareTask } from '../../../knowledge/domain/referenceModels/index';
import { buildGoogleCalendarUrl, buildIcs } from './index';

const task = (overrides: Partial<ResolvedCareTask> = {}): ResolvedCareTask => ({
  template: {
    id: 'health-check-18m',
    kind: 'health-check',
    title: '兒童預防保健第 5 次',
    description: '1 歲 6 個月至未滿 2 歲，攜帶健保卡與兒童健康手冊',
    dueMonth: 18,
    fromMonth: 18,
    toMonth: 24,
    source: '國民健康署',
  },
  dueDate: '2025-07-15',
  windowEnd: '2026-01-15',
  status: 'upcoming',
  daysUntilDue: 100,
  ...overrides,
});

const CRLF = '\r\n';

/**
 * RFC 5545 §3.1 解折之後的 VEVENT DESCRIPTION（VALARM 的那一列排在它後面）。
 * 折行之後任何一段內文都可能被 CRLF + 空白切開，所以斷言要對解折的結果做。
 */
const descriptionOf = (ics: string) =>
  ics
    .replace(/\r\n /g, '')
    .split(CRLF)
    .find((line) => line.startsWith('DESCRIPTION:'))!;

describe('buildIcs', () => {
  it('產生完整的 VCALENDAR 外框', () => {
    const ics = buildIcs([task()], '小樹');

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('VERSION:2.0');
  });

  it('每個任務產生一個全天 VEVENT', () => {
    const ics = buildIcs([task()], '小樹');

    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;VALUE=DATE:20250715');
    // 全天事件的 DTEND 為隔日（exclusive）
    expect(ics).toContain('DTEND;VALUE=DATE:20250716');
  });

  it('標題含孩子名字', () => {
    expect(buildIcs([task()], '小樹')).toContain('小樹');
  });

  it('附提前 7 天的 VALARM', () => {
    const ics = buildIcs([task()], '小樹');

    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-P7D');
    expect(ics).toContain('END:VALARM');
  });

  it('排除已完成的任務', () => {
    const ics = buildIcs(
      [task({ status: 'done', completedDate: '2025-08-01' })],
      '小樹',
    );

    expect(ics).not.toContain('BEGIN:VEVENT');
  });

  it('依 RFC 5545 跳脫反斜線、分號、逗號與換行', () => {
    const ics = buildIcs(
      [
        task({
          template: {
            ...task().template,
            title: 'a\\b;c,d',
            description: 'line1\nline2',
          },
        }),
      ],
      '小樹',
    );

    expect(ics).toContain('a\\\\b\\;c\\,d');
    expect(ics).toContain('line1\\nline2');
  });

  it('每一列以 CRLF 結尾', () => {
    const ics = buildIcs([task()], '小樹');
    const bareNewlines = ics.split('\n').filter((line) => !line.endsWith('\r'));

    // 只有結尾的空字串不以 \r 收尾
    expect(bareNewlines).toEqual(['']);
  });

  it('UID 具唯一性且穩定', () => {
    const first = buildIcs([task()], '小樹');
    const second = buildIcs([task()], '小樹');
    const uidOf = (ics: string) => ics.match(/UID:(.+)\r\n/)![1];

    expect(uidOf(first)).toBe(uidOf(second));
    expect(uidOf(first)).toContain('health-check-18m');
  });

  it('每個 VEVENT 都有 DTSTAMP——RFC 5545 §3.6.1 是必填欄位', () => {
    // 少了它，Outlook 與部分 CalDAV 伺服器會整個檔案拒收。
    const ics = buildIcs([task()], '小樹', new Date(Date.UTC(2026, 8, 1, 3, 4, 5)));

    expect(ics).toContain('DTSTAMP:20260901T030405Z');
  });

  it('超過 75 octet 的中文說明折行，解折後內容一字不差', () => {
    // 繁體中文一個字 3 bytes，照護說明動輒 90 bytes 以上；不折行的話
    // 嚴格的解析器會整列丟掉，家長匯進去就是一則沒有說明的行程。
    const description
      = '滿 1 歲半要帶健保卡與兒童健康手冊到院所做兒童預防保健服務。'.repeat(3);

    const ics = buildIcs(
      [task({ template: { ...task().template, description } })],
      '小樹',
    );

    expect(ics).toContain(`${CRLF} `);
    const encoder = new TextEncoder();

    for (const line of ics.split(CRLF)) {
      expect(encoder.encode(line).length, line).toBeLessThanOrEqual(75);
    }

    expect(descriptionOf(ics)).toContain(description);
  });

  it('說明裡的日期用家長讀得懂的寫法，不是原始日期字串', () => {
    const description = descriptionOf(buildIcs([task()], '小樹'));

    expect(description).toContain('可執行區間至 2026年1月15日');
    expect(description).not.toContain('2026-01-15');
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('產生帶 TEMPLATE action 與全天日期區間的連結', () => {
    const url = new URL(buildGoogleCalendarUrl(task(), '小樹'));

    expect(url.origin + url.pathname).toBe(
      'https://calendar.google.com/calendar/render',
    );

    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('dates')).toBe('20250715/20250716');
  });

  it('標題與說明經過 URL 編碼', () => {
    const url = new URL(buildGoogleCalendarUrl(task(), '小樹'));

    expect(url.searchParams.get('text')).toContain('小樹');
    expect(url.searchParams.get('details')).toContain('國民健康署');
  });
});
