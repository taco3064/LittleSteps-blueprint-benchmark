import { toLocalDateKey } from '~app/platform/domain/calendar';
import { changedFields } from '~app/platform/domain/firebaseData';
import {
  DailyLog,
  DailyLogPatch,
  DailySummary,
  DiaperData,
  FeedingData,
  SleepData,
} from '~app/family/domain/familyRecords';

/**
 * 按時間倒序排序日誌（最新的在前）
 */
export function sortLogsByTime(logs: DailyLog[]): DailyLog[] {
  return [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

/**
 * 篩選指定日期的日誌
 */
export function filterLogsByDate(logs: DailyLog[], date: string): DailyLog[] {
  return logs.filter((log) => {
    const logDate = toLocalDateKey(log.timestamp);

    return logDate === date;
  });
}

/**
 * 獲取今日的日誌
 */
export function getTodayLogs(logs: DailyLog[]): DailyLog[] {
  const today = toLocalDateKey();

  return filterLogsByDate(logs, today);
}

/**
 * 獲取最近 N 天的日誌
 */
export function getRecentLogs(logs: DailyLog[], days: number): DailyLog[] {
  const cutoffDate = new Date();

  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffTime = cutoffDate.getTime();

  return logs.filter((log) => new Date(log.timestamp).getTime() >= cutoffTime);
}

/**
 * 計算睡眠時長（分鐘）
 */
export function calculateSleepDuration(sleepData: SleepData): number | undefined {
  if (!sleepData.endTime) {
    return undefined; // Still sleeping
  }

  const startTime = new Date(sleepData.startTime).getTime();
  const endTime = new Date(sleepData.endTime).getTime();

  return Math.round((endTime - startTime) / (1000 * 60)); // Convert to minutes
}

/**
 * 睡眠沒有結束時間就是「還在睡」。超過這個時數幾乎一定是忘了按「醒了」，
 * 不是真的睡了十幾個小時——這種紀錄不能算進任何統計：它會讓那一天看起來
 * 「有記睡眠」卻只有 0 分鐘，把平均往下拉，而畫面上完全看不出原因。
 */
export const STALE_OPEN_SLEEP_MINUTES = 14 * 60;

/** 還沒填結束時間的睡眠。 */
export function isOpenSleep(log: DailyLog): boolean {
  return log.type === 'sleep' && !(log.data as SleepData).endTime;
}

/** 從入睡到現在經過幾分鐘。時間壞掉或落在未來時回 0，不回負數。 */
export function openSleepElapsedMinutes(
  sleepData: SleepData,
  now: Date = new Date(),
): number {
  const startTime = new Date(sleepData.startTime).getTime();

  if (Number.isNaN(startTime)) {
    return 0;
  }

  return Math.max(0, Math.floor((now.getTime() - startTime) / (1000 * 60)));
}

/** 開著超過 STALE_OPEN_SLEEP_MINUTES 的睡眠：需要補結束時間，不列入統計。 */
export function isStaleOpenSleep(log: DailyLog, now: Date = new Date()): boolean {
  return (
    isOpenSleep(log)
    && openSleepElapsedMinutes(log.data as SleepData, now) > STALE_OPEN_SLEEP_MINUTES
  );
}

/**
 * 這個孩子目前還沒結束的那一段睡眠。
 *
 * 同時只該有一段，取最新的一筆：舊資料若留下兩筆沒關的睡眠，家長要能先關掉
 * 剛剛那一段，而不是被卡在一筆三天前忘記按的紀錄上。
 */
export function findOpenSleep(logs: DailyLog[]): DailyLog | null {
  let open: DailyLog | null = null;

  for (const log of logs) {
    if (!isOpenSleep(log)) {
      continue;
    }

    if (
      !open
      || new Date(log.timestamp).getTime() > new Date(open.timestamp).getTime()
    ) {
      open = log;
    }
  }

  return open;
}

/**
 * 擠奶紀錄。
 *
 * 它跟其他六個 feedingType 差在一件事：那六個是寶寶喝下去的，擠奶是擠出來的。
 * 「今天餵了幾次」「今天喝了幾 ml」的每一個加總都必須跳過它——不然一位全擠奶
 * 的母親每天六次瓶餵加六次擠奶，會被算成十二餐、兩倍奶量，而這份數字會被
 * 拿去給小兒科醫師看。
 */
export function isPumpingLog(log: DailyLog): boolean {
  return (
    log.type === 'feeding' && (log.data as FeedingData).feedingType === 'pumping'
  );
}

/** 真的餵進寶寶嘴裡的那些紀錄。 */
export function isIntakeFeedingLog(log: DailyLog): boolean {
  return (
    log.type === 'feeding' && (log.data as FeedingData).feedingType !== 'pumping'
  );
}

/**
 * 這個孩子最近一筆某類型的紀錄，用來預填表單。
 *
 * 記憶跟著孩子走，不跟著帳號：兩個孩子的家長常常一個喝配方奶、一個親餵，
 * 用帳號記住上一次只會讓兩張表都填錯。這裡的 `logs` 本來就是單一孩子的，
 * 所以「按孩子分」是免費的——真正要避免的是把它搬到 localStorage 去。
 */
export function findLastLog(
  logs: DailyLog[],
  matches: (log: DailyLog) => boolean,
): DailyLog | null {
  let latest: DailyLog | null = null;

  for (const log of logs) {
    if (!matches(log)) {
      continue;
    }

    if (
      !latest
      || new Date(log.timestamp).getTime() > new Date(latest.timestamp).getTime()
    ) {
      latest = log;
    }
  }

  return latest;
}

/**
 * 一次編輯真正改到的欄位。
 *
 * 表單送回來的是整筆紀錄，但整筆寫回去就會把另一位照顧者同時改的欄位一起
 * 蓋掉——他改的是我沒有動到的欄位，我卻連著我開啟表單當下讀到的舊值一起
 * 送上去。這裡比對的是「我打開表單時看到的那一版」與「我送出的那一版」，
 * 中間別人做了什麼都不在這兩者裡面，自然也就不會被覆蓋。
 *
 * 被清空的欄位要寫 null 而不是略過：略過的話舊值留在資料庫裡，家長把備註
 * 刪掉之後它會原封不動地回來。
 */
export function dailyLogChanges(
  before: DailyLog,
  next: Omit<DailyLog, 'id'>,
): DailyLogPatch {
  const patch: DailyLogPatch = {};

  if (next.type !== before.type) {
    patch.type = next.type;
  }

  if (next.timestamp !== before.timestamp) {
    patch.timestamp = next.timestamp;
  }

  // cast：changedFields 是結構性比對，回傳的是三種 data 形狀裡的哪一種，只有
  // 呼叫端知道。型別在 DailyLogPatch 那邊守住，這裡是唯一一個逃生口。
  const data = changedFields(before.data, next.data);

  if (Object.keys(data).length > 0) {
    patch.data = data as DailyLogPatch['data'];
  }

  return patch;
}

/**
 * 計算指定日期的每日摘要統計
 */
export function calculateDailySummary(
  logs: DailyLog[],
  date?: string,
  now: Date = new Date(),
): DailySummary {
  const targetDate = date || toLocalDateKey();
  const dailyLogs = filterLogsByDate(logs, targetDate);

  const summary: DailySummary = {
    date: targetDate,
    feedingCount: 0,
    totalFeedingAmount: 0,
    sleepCount: 0,
    totalSleepDuration: 0,
    diaperCount: 0,
    poopCount: 0,
    peeCount: 0,
  };

  dailyLogs.forEach((log) => {
    switch (log.type) {
      case 'feeding': {
        // 擠奶是產出，不是這一天的一餐，也不是喝進去的量。
        if (isPumpingLog(log)) {
          break;
        }

        summary.feedingCount++;
        summary.totalFeedingAmount += (log.data as FeedingData).amount || 0;

        break;
      }

      case 'sleep': {
        // 忘了按「醒了」的紀錄不是一段睡眠，是一個待補的欄位。
        if (isStaleOpenSleep(log, now)) {
          break;
        }

        summary.sleepCount++;
        const sleepData = log.data as SleepData;

        const duration
          = sleepData.duration || calculateSleepDuration(sleepData) || 0;

        summary.totalSleepDuration += duration;

        break;
      }

      case 'diaper': {
        addDiaperSummary(summary, log.data as DiaperData);

        break;
      }
    }
  });

  return summary;
}

/**
 * 格式化時間顯示（HH:MM）
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);

  return date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * 格式化日期顯示（2026年6月15日）與時長顯示。
 * Single canonical implementations live in dateHelpers; re-exported here so the
 * whole app formats dates and durations consistently.
 */
export { formatDate, formatDuration } from '~app/platform/domain/calendar';

/**
 * 記錄表單上的四個 enum：一張表寫死顯示順序，清單從表的 key 推出來。
 *
 * 清單不另外手寫，是因為手寫的那一份只保證「裡面的值都合法」，不保證「一個都
 * 沒漏」——型別檢查不會告訴你新增的餵奶類型沒出現在選單裡，而家長會在表單上
 * 找不到它，編輯舊紀錄時還會被改成第一個選項。`Record` 反過來是漏一個就編不
 * 過，物件字面值的 key 順序又剛好就是選單要的順序。
 */
const FEEDING_TYPE_LABEL: Record<FeedingData['feedingType'], string> = {
  breast_left: '母乳（左）',
  breast_right: '母乳（右）',
  breast_both: '母乳（兩邊）',
  breast_milk_bottle: '母乳（瓶餵）',
  formula: '配方奶',
  solid: '副食品',
  pumping: '擠奶',
};

/**
 * 擠奶記在哪一邊。跟 feedingType 是兩個欄位：一個說這是什麼奶，一個說擠的是
 * 哪一側，所以「母乳（左）」和「左側」不是同一份標籤。
 */
const FEEDING_SIDE_LABEL: Record<NonNullable<FeedingData['side']>, string> = {
  left: '左側',
  right: '右側',
  both: '兩側',
};

const DIAPER_TYPE_LABEL: Record<DiaperData['type'], string> = {
  pee: '小便',
  poop: '大便',
  both: '大小便',
};

const CONSISTENCY_LABEL: Record<NonNullable<DiaperData['consistency']>, string> = {
  normal: '正常',
  soft: '稀',
  hard: '硬',
};

export const FEEDING_TYPES = Object.keys(
  FEEDING_TYPE_LABEL,
) as FeedingData['feedingType'][];
export const FEEDING_SIDES = Object.keys(FEEDING_SIDE_LABEL) as NonNullable<
  FeedingData['side']
>[];
export const DIAPER_TYPES = Object.keys(DIAPER_TYPE_LABEL) as DiaperData['type'][];
export const CONSISTENCIES = Object.keys(CONSISTENCY_LABEL) as NonNullable<
  DiaperData['consistency']
>[];

/**
 * 獲取餵奶類型的中文顯示名稱
 */
export function getFeedingTypeLabel(type: FeedingData['feedingType']): string {
  return FEEDING_TYPE_LABEL[type];
}

/** 獲取擠奶側別的中文顯示名稱 */
export function getFeedingSideLabel(side: NonNullable<FeedingData['side']>): string {
  return FEEDING_SIDE_LABEL[side];
}

/**
 * 獲取尿布類型的中文顯示名稱
 */
export function getDiaperTypeLabel(type: DiaperData['type']): string {
  return DIAPER_TYPE_LABEL[type];
}

/**
 * 獲取大便性狀的中文顯示名稱
 */
export function getConsistencyLabel(
  consistency?: DiaperData['consistency'],
): string {
  if (!consistency) {
    return '';
  }

  return CONSISTENCY_LABEL[consistency];
}

/**
 * 把「這是什麼」跟「內容是什麼」接成一句，例如「餵奶 · 配方奶 120 ml」。
 *
 * 內容那一段本來就可能自己帶括號——`母乳（瓶餵）` 是這份對照表裡正確的寫法——
 * 所以接的人不能再用一對括號包住它：那會拼成「餵奶（母乳（瓶餵） 120 ml）」，
 * 一句話裡兩層全形括號，在 320px 的一排 chip 上讀起來是一團符號。中點是時間軸
 * 細節本來就在用的分隔符，接得起來，也永遠不會巢狀。
 *
 * 內容是空的（沒填奶量也沒填時長的擠奶）就只剩標題，不留一對空括號。
 *
 * 放在這裡而不是放在那張卡裡，是因為下一個要拼標籤的畫面該直接拿到這條規則。
 */
export function composeLogLabel(title: string, detail: string): string {
  return detail ? `${title} · ${detail}` : title;
}

function addDiaperSummary(summary: DailySummary, diaperData: DiaperData) {
  summary.diaperCount++;

  if (diaperData.type === 'poop' || diaperData.type === 'both') {
    summary.poopCount++;
  }

  if (diaperData.type === 'pee' || diaperData.type === 'both') {
    summary.peeCount++;
  }
}
