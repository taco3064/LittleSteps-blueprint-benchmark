/**
 * 日期時間工具函數
 * 用於快速日誌功能的日期處理
 */

/**
 * 計算月齡。
 *
 * 以日為準：尚未過當月生日時不計入該月，因此 1/31 出生的孩子在 2/1
 * 是 0 個月而非 1 個月。LittleExplorer 的年齡段判定與 careSchedule 的
 * 到期日計算都依賴這個精度。
 */
export function calculateAge(birthday: string): number {
  const birth = new Date(birthday);
  const now = new Date();

  let months
    = (now.getFullYear() - birth.getFullYear()) * 12
      + (now.getMonth() - birth.getMonth());

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

/** Naegele 法則：預產期為末次月經第一天起算 280 天。 */
export const GESTATION_DAYS = 280;

/**
 * 以「本地時區」解析日期。
 *
 * 純日期字串（YYYY-MM-DD）不能直接丟給 `new Date()`：那會被當成 UTC 午夜，
 * 在 UTC 以西的時區會整整差一天。錨在中午 12 點，連日光節約時間的 ±1 小時
 * 位移都吃得下，日期不會跳。帶時間的完整 ISO 字串本來就有時區資訊，原樣交給
 * Date 解析即可。
 */
/**
 * 把日期字串解析成「本地時區的那一天中午」。
 *
 * 中午而不是午夜：日光節約或時區偏移把午夜推前推後幾小時，日期就會跳到
 * 前一天或後一天；從中午起算，任何 ±12 小時內的偏移都還落在同一個日曆日。
 *
 * 匯出的原因是它被抄過三次（prenatalSchedule、careSchedule、icsExport），
 * 而那三份都是 `iso.split('-').map(Number)`，遇到完整 ISO 時間戳會產出
 * Invalid Date，也認不得單位數月份。同一個概念留一份實作就好。
 */
export function parseLocalDate(value: string): Date {
  const pureDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);

  if (!pureDate) {
    return new Date(value);
  }

  return new Date(
    Number(pureDate[1]),
    Number(pureDate[2]) - 1,
    Number(pureDate[3]),
    12,
  );
}

function shiftDays(isoDate: string, days: number): string {
  const date = parseLocalDate(isoDate);

  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/** 由末次月經第一天推預產期。 */
export function dueDateFromLmp(lastPeriodDate: string): string {
  return shiftDays(lastPeriodDate, GESTATION_DAYS);
}

/** 由預產期回推末次月經第一天。與 dueDateFromLmp 互為反函式。 */
export function lmpFromDueDate(dueDate: string): string {
  return shiftDays(dueDate, -GESTATION_DAYS);
}

/**
 * 取本地時區的日曆日期（YYYY-MM-DD）。
 *
 * 不要用 `toISOString().split('T')[0]`：那是 UTC 日期。台灣是 UTC+8，
 * 凌晨 0 點到 8 點之間會得到「前一天」——而半夜餵奶、換尿布與睡眠紀錄
 * 正是這個 app 的使用高峰，那些紀錄會被歸到錯誤的日期。
 *
 * 傳入已是 YYYY-MM-DD 的字串時原樣採用：再繞一次 Date 會以 UTC 午夜解析，
 * 在 UTC 以西的時區反而位移一天。
 */
export function toLocalDateKey(value: Date | string = new Date()): string {
  // 只有「純日期」字串走這條捷徑。錨住結尾很關鍵：完整 ISO 時間戳
  // （2026-06-14T23:00:00Z）若也命中，就會直接回傳它的 UTC 日期部分，
  // 等於完全沒有換算到本地時區。
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = typeof value === 'string' ? new Date(value) : value;

  // 無效輸入寧可炸掉也不要靜靜產出 "NaN-NaN-NaN" 當成日期鍵寫進資料庫。
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`無法解析的日期：${String(value)}`);
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * 判斷兩個日期是否在同一天（依本地時區）
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return toLocalDateKey(date1) === toLocalDateKey(date2);
}

/**
 * 計算時間差（分鐘）
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  return Math.floor((end - start) / (1000 * 60));
}

/**
 * 格式化日期顯示（2026年6月15日）。
 *
 * 全 app 唯一的日期顯示入口：家長看到的永遠是中文日期，畫面上不該出現
 * 2026-06-15 這種給機器讀的格式。
 */
export function formatDate(value?: string | Date | null): string {
  if (!value) {
    return '';
  }

  const date = typeof value === 'string' ? parseLocalDate(value) : value;

  // 壞資料寧可留白，也不要在畫面上印出 Invalid Date 嚇到家長。
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化時間顯示（HH:MM）
 */
export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * 格式化時長顯示
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}小時${mins}分鐘`;
  } else if (hours > 0) {
    return `${hours}小時`;
  } else {
    return `${mins}分鐘`;
  }
}

/**
 * 取得當前時間的 ISO 字串（用於 datetime-local input）
 * 格式: YYYY-MM-DDTHH:mm
 */
export function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * 將 datetime-local 格式轉換為 ISO 字串
 */
export function dateTimeLocalToISO(dateTimeLocal: string): string {
  return new Date(dateTimeLocal).toISOString();
}

/**
 * ISO 字串轉回 datetime-local 的格式，也就是 dateTimeLocalToISO 的反函式。
 *
 * 存起來的是 UTC，input 讀的是本地時間，所以不能拿 ISO 字串前 16 個字元充數：
 * 那是 UTC 的時鐘讀數，貼進 datetime-local 就被當成本地時間。在台灣（UTC+8）
 * 晚上 9 點記的那一餐，打開編輯表單顯示的是下午 1 點；家長就算一個字都沒改
 * 按下更新，dateTimeLocalToISO 也會把那個 13:00 當成本地時間送回去，紀錄就
 * 往前跳 8 小時。錯兩次，而且兩次都不會有任何提示。
 */
export function isoToDateTimeLocal(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`無法解析的時間：${iso}`);
  }

  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * 在 YYYY-MM-DD 上加指定月數。
 * 目標月份沒有該日時（例：1/31 + 1 個月、2/29 + 12 個月）退回當月最後一日，
 * 而非 JS Date 預設的溢位到下個月。
 */
export function addMonths(isoDate: string, months: number): string {
  const source = parseLocalDate(isoDate);
  const targetDay = source.getDate();
  const result = new Date(source);

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const daysInTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();

  result.setDate(Math.min(targetDay, daysInTargetMonth));

  return toLocalDateKey(result);
}
