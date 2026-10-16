/**
 * 一天裡的時刻是環狀的，不是一條數線。
 *
 * 23:50 和 00:10 相差 20 分鐘，但當成數字是 1430 和 10，平均會落在 12:00——
 * 一個沒有人在那個時間睡覺的答案，而且標準差大到任何規律性評分都會給 0 分。
 * 睡眠規律性本來就在算夜間就寢時間，那段時間必然跨過午夜，所以這不是邊界
 * 特例，而是這個計算的常態。
 *
 * 用方向統計（directional statistics）：把每個時刻映到單位圓上的角度，平均
 * 這些單位向量，再轉回時刻。平均向量的長度同時給出集中程度——向量越短代表
 * 越分散，這就是環狀標準差。
 */

const MINUTES_PER_DAY = 24 * 60;
const RADIANS_PER_MINUTE = (2 * Math.PI) / MINUTES_PER_DAY;

export interface CircularTimeStats {
  /** 環狀平均，0 到 1439 之間的當日分鐘數 */
  meanMinutes: number;
  /** 環狀標準差（分鐘）。完全一致是 0 */
  stdDevMinutes: number;
}

/**
 * 時刻分散到整個圓時，平均向量會趨近零，平均方向沒有意義。
 * 這時回報「最大可能的分散」而不是一個假的中心。
 */
const MAX_SPREAD_MINUTES = MINUTES_PER_DAY / 4;

/** 把 Date 轉成當日分鐘數（當地時區） */
export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** 當日分鐘數轉成 "HH:MM" */
export function formatMinutesOfDay(minutes: number): string {
  const rounded
    = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  const h = Math.floor(rounded / 60);
  const m = rounded % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function circularTimeStats(minutes: number[]): CircularTimeStats | null {
  if (minutes.length === 0) {
    return null;
  }

  let sumCos = 0;
  let sumSin = 0;

  for (const value of minutes) {
    const angle = value * RADIANS_PER_MINUTE;

    sumCos += Math.cos(angle);
    sumSin += Math.sin(angle);
  }

  const meanCos = sumCos / minutes.length;
  const meanSin = sumSin / minutes.length;
  const resultant = Math.hypot(meanCos, meanSin);

  // 時刻均勻散在整個圓上（例如 06:00 與 18:00 各一半）時沒有平均方向可言。
  if (resultant < 1e-9) {
    return { meanMinutes: 0, stdDevMinutes: MAX_SPREAD_MINUTES };
  }

  return circularSpread(meanSin, meanCos, resultant);
}

function circularSpread(meanSin: number, meanCos: number, resultant: number) {
  const meanAngle = Math.atan2(meanSin, meanCos);
  const normalised = (meanAngle + 2 * Math.PI) % (2 * Math.PI);

  // 環狀標準差：sqrt(-2 ln R)，單位是弧度。
  // 全部時刻相同時 resultant 會因浮點誤差落在 1 稍微之上，log 變正、開根號變
  // NaN。夾在 1 以下，讓「完全一致」得到 0 而不是 NaN。
  const stdDevRadians = Math.sqrt(-2 * Math.log(Math.min(resultant, 1)));

  return {
    meanMinutes: normalised / RADIANS_PER_MINUTE,
    stdDevMinutes: Math.min(stdDevRadians / RADIANS_PER_MINUTE, MAX_SPREAD_MINUTES),
  };
}
