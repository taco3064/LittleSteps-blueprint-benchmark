import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';
import {
  formatDate,
  parseLocalDate,
  toLocalDateKey,
} from '~app/platform/domain/calendar';

const CRLF = '\r\n';

/** RFC 5545 §3.1：一列最多 75 個 octet，不含收尾的 CRLF。 */
const MAX_OCTETS = 75;

/** RFC 5545 §3.3.11 文字跳脫。反斜線必須最先處理。 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** YYYY-MM-DD → YYYYMMDD */
function toIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/** 從 code point 算 UTF-8 位元組數，不必為每個字配一個 Uint8Array。 */
function utf8Length(codePoint: number): number {
  if (codePoint < 0x80) {
    return 1;
  }

  if (codePoint < 0x800) {
    return 2;
  }

  if (codePoint < 0x10000) {
    return 3;
  }

  return 4;
}

/**
 * RFC 5545 §3.1 行折疊：超長的列拆開，續行以一個空白開頭。
 *
 * 以 octet 計而非字元數——中文一個字 3 bytes，繁體中文的 DESCRIPTION 動輒
 * 超過 90 bytes，嚴格的解析器會整列丟掉。切點必須落在字元邊界，切在 UTF-8
 * 中間會產生亂碼，所以逐 code point 累加而不是切 byte 陣列。
 */
function foldLine(line: string): string {
  const segments: string[] = [];
  let segment = '';
  let octets = 0;
  let budget = MAX_OCTETS;

  for (const char of line) {
    const size = utf8Length(char.codePointAt(0) as number);

    if (octets + size > budget) {
      segments.push(segment);
      segment = '';
      octets = 0;
      // 續行的前導空白也計入 75 octet。
      budget = MAX_OCTETS - 1;
    }

    segment += char;
    octets += size;
  }

  segments.push(segment);

  return segments.join(`${CRLF} `);
}

/** RFC 5545 §3.3.5 UTC date-time：YYYYMMDDTHHMMSSZ。 */
function toIcsTimestamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** 全天事件的 DTEND 為 exclusive，需為隔日。 */
function nextDay(isoDate: string): string {
  const date = parseLocalDate(isoDate);

  date.setDate(date.getDate() + 1);

  return toLocalDateKey(date);
}

/**
 * 一則全天行程。
 *
 * 行事曆不認識「幼兒照護任務」或「疫苗劑次」，只認識日期、標題與內文。各服務
 * 把自己的資料攤成這個形狀，RFC 5545 的折行、跳脫與 VALARM 就只有一份實作——
 * 這個檔案從 littleexplorer 搬到 common 的理由也在這裡。
 */
export interface CalendarEvent {
  /** 全域唯一且穩定：同一件事重複匯出應該覆蓋，而不是多出一筆。 */
  uid: string;
  /** YYYY-MM-DD，全天事件的起始日。 */
  date: string;
  title: string;
  details: string;
}

function buildEvent(event: CalendarEvent, dtstamp: string): string[] {
  return [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    // RFC 5545 §3.6.1 要求 VEVENT 必須有 DTSTAMP；少了它，嚴格的匯入端
    // （Outlook、部分 CalDAV 伺服器）會整個檔案拒收。
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(event.date)}`,
    `DTEND;VALUE=DATE:${toIcsDate(nextDay(event.date))}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.details)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    // 提前 7 天，不是前一天：這些行程都得先跟診所約時間，前一天才知道
    // 已經來不及了。
    'TRIGGER:-P7D',
    `DESCRIPTION:${escapeText(event.title)}`,
    'END:VALARM',
    'END:VEVENT',
  ];
}

/**
 * 序列化為 RFC 5545 行事曆。全天事件，各附提前 7 天的顯示提醒。
 *
 * `now` 只為了 DTSTAMP，注入以利測試。
 */
export function buildCalendar(
  events: CalendarEvent[],
  prodId: string,
  now: Date = new Date(),
): string {
  const dtstamp = toIcsTimestamp(now);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    ...events.flatMap((event) => buildEvent(event, dtstamp)),
    'END:VCALENDAR',
  ];

  return lines.map(foldLine).join(CRLF) + CRLF;
}

const CARE_PRODID = '-//LittleExplorer//幼兒照護時程//ZH-TW';

/** 一筆照護任務攤成行事曆行程。ICS 與 Google 連結共用，兩邊的文字才會一致。 */
function careEvent(task: ResolvedCareTask, childName: string): CalendarEvent {
  return {
    uid: `${task.template.id}-${toIcsDate(task.dueDate)}@littleexplorer`,
    date: task.dueDate,
    title: `${childName}：${task.template.title}`,
    // 家長讀的是行事曆內文，不是資料庫欄位：日期照 app 其他地方的寫法。
    details: `${task.template.description}\n可執行區間至 ${formatDate(task.windowEnd)}\n資料來源：${task.template.source}`,
  };
}

/** 將未完成的照護任務序列化為 RFC 5545 行事曆。 */
export function buildIcs(
  tasks: ResolvedCareTask[],
  childName: string,
  now: Date = new Date(),
): string {
  return buildCalendar(
    // 做完的任務不必再塞進行事曆。
    tasks
      .filter((task) => task.status !== 'done')
      .map((task) => careEvent(task, childName)),
    CARE_PRODID,
    now,
  );
}

/** 單筆任務的 Google 日曆快速加入連結。 */
export function buildGoogleCalendarUrl(
  task: ResolvedCareTask,
  childName: string,
): string {
  const event = careEvent(task, childName);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.details,
    dates: `${toIcsDate(event.date)}/${toIcsDate(nextDay(event.date))}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
