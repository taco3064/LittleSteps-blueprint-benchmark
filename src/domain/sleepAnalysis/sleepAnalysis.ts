import { DailyLog, SleepData } from '../records';
import { circularTimeStats, formatMinutesOfDay, minutesOfDay } from '../circularTime';
import { toLocalDateKey } from '../dateHelpers';
import { getSleepRequirementForAge } from '../sleep';

// 睡眠統計介面
export interface SleepStats {
  totalDuration: number; // 總睡眠時長（分鐘）
  /** 每日平均睡眠時長（分鐘）。分母是有記錄的天數，不是時段長度。 */
  dailyAverage: number;
  sleepCount: number; // 睡眠次數
  averageDuration: number; // 平均每次睡眠時長（分鐘）
  nightSleep: number; // 夜間睡眠時長（分鐘）
  daytimeNaps: number; // 白天小睡時長（分鐘）
  nightSleepCount: number; // 夜間睡眠次數
  napCount: number; // 白天小睡次數
  daysInPeriod: number; // 時段長度：今日 1、本週 7、本月 30
  /**
   * 這個時段裡真的有睡眠記錄的天數。
   *
   * 每日平均一律除這個數。除以時段長度的話，只記了一晚的家長會看到
   * 「每天平均睡 1.7 小時」，而建議值是 13-15 小時——那不是孩子的狀況，
   * 是 29 天沒記錄被當成 29 天沒睡。
   */
  daysWithRecords: number;
}

// 睡眠規律性介面
export interface SleepRegularity {
  bedtimeRegularity: number; // 0-100 分數，越高越規律
  wakeTimeRegularity: number; // 0-100 分數，越高越規律
  /** 夜間就寢的平均時刻；只記過小睡時沒有這個數字 */
  averageBedtime?: string;
  /** 夜間睡醒的平均時刻；只記過小睡時沒有這個數字 */
  averageWakeTime?: string;
}

// 睡眠建議介面
export interface SleepAdvice {
  category: 'good' | 'attention' | 'improve';
  title: string;
  description: string;
  suggestions: string[];
}

/**
 * 判斷是否為夜間睡眠（18:00-06:00 之間開始）
 */
export function isNightSleep(startTime: string): boolean {
  const hour = new Date(startTime).getHours();

  return hour >= 18 || hour < 6;
}

/**
 * 解析小時範圍字串（如 "13-15 小時" -> {min: 13, max: 15}）
 */
export function parseHourRange(hourString: string): { min: number; max: number } {
  const match = hourString.match(/(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)/);

  if (match) {
    return {
      min: parseFloat(match[1]),
      max: parseFloat(match[2]),
    };
  }

  // 如果是單一數字（如 "11 小時"）
  const singleMatch = hourString.match(/(\d+(?:\.\d+)?)/);

  if (singleMatch) {
    const value = parseFloat(singleMatch[1]);

    return { min: value, max: value };
  }

  return { min: 0, max: 0 };
}

/**
 * 篩選指定時段的日誌
 */
function filterLogsByPeriod(
  logs: DailyLog[],
  period: 'today' | 'week' | 'month',
): DailyLog[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return logs.filter((log) => {
    const logDate = new Date(log.timestamp);

    switch (period) {
      case 'today':
        return logDate >= today;

      case 'week': {
        const weekAgo = new Date(today);

        weekAgo.setDate(weekAgo.getDate() - 7);

        return logDate >= weekAgo;
      }

      case 'month': {
        const monthAgo = new Date(today);

        monthAgo.setMonth(monthAgo.getMonth() - 1);

        return logDate >= monthAgo;
      }

      default:
        return true;
    }
  });
}

/**
 * 計算睡眠統計
 */
export function calculateSleepStats(
  logs: DailyLog[],
  period: 'today' | 'week' | 'month',
): SleepStats {
  const sleepLogs = filterLogsByPeriod(
    logs.filter((log) => log.type === 'sleep'),
    period,
  );

  // 只計算已完成的睡眠（有 endTime 和 duration）
  const completedSleeps = sleepLogs.filter((log) => {
    const data = log.data as SleepData;

    return data.endTime && data.duration;
  });

  // 時段長度只是「這一頁看的是幾天」，不能當平均的分母。
  let daysInPeriod = 1;

  if (period === 'week') {
    daysInPeriod = 7;
  } else if (period === 'month') {
    daysInPeriod = 30;
  }

  // 真正有睡眠記錄的日曆日。跨夜的睡眠歸在入睡那天，與報表其他地方一致。
  const daysWithRecords = new Set(
    completedSleeps.map((log) => toLocalDateKey(log.timestamp)),
  ).size;

  const { totalDuration, nightSleep, daytimeNaps, nightSleepCount, napCount }
    = aggregateSleepDurations(completedSleeps);

  const sleepCount = completedSleeps.length;
  const averageDuration = sleepCount > 0 ? totalDuration / sleepCount : 0;
  const dailyAverage = daysWithRecords > 0 ? totalDuration / daysWithRecords : 0;

  return {
    totalDuration,
    dailyAverage,
    sleepCount,
    averageDuration,
    nightSleep,
    daytimeNaps,
    nightSleepCount,
    napCount,
    daysInPeriod,
    daysWithRecords,
  };
}

/**
 * 計算時間的平均值與標準差（用於規律性評分）
 */
/**
 * 一組時刻的平均與規律性評分。
 *
 * 時刻是環狀的，所以平均與標準差都交給 circularTimeStats——夜間就寢時間必然
 * 跨過午夜，用線性平均會把 23:50 與 00:10 算成中午。
 *
 * 評分曲線：標準差 0 是 100 分、30 分鐘約 75 分、1 小時 50 分、2 小時以上 0 分。
 */
function calculateTimeStats(times: number[]): { time?: string; score: number } {
  const stats = circularTimeStats(times);

  if (!stats) {
    return { score: 0 };
  }

  const stdDevHours = stats.stdDevMinutes / 60;
  const score = Math.max(0, Math.min(100, 100 - (stdDevHours / 2) * 100));

  return { time: formatMinutesOfDay(stats.meanMinutes), score: Math.round(score) };
}

/**
 * 計算睡眠規律性
 */
export function calculateSleepRegularity(logs: DailyLog[]): SleepRegularity {
  const sleepLogs = logs.filter((log) => log.type === 'sleep');

  // 只取最近 7 天的記錄
  const weekLogs = filterLogsByPeriod(sleepLogs, 'week');

  const completedSleeps = weekLogs.filter((log) => {
    const data = log.data as SleepData;

    return data.endTime && data.duration;
  });

  // 只算夜間睡眠。小睡混進來的話，早上 09:30 的小睡和晚上 20:00 的就寢會被
  // 平均成 14:45，而每個這個年紀的孩子都在小睡——那個數字對每一位使用者都是錯的。
  const nightSleeps = completedSleeps.filter((log) =>
    isNightSleep((log.data as SleepData).startTime),
  );

  const bedtimes: number[] = [];
  const wakeTimes: number[] = [];

  nightSleeps.forEach((log) => {
    const data = log.data as SleepData;

    bedtimes.push(minutesOfDay(new Date(data.startTime)));
    wakeTimes.push(minutesOfDay(new Date(data.endTime!)));
  });

  const bedtimeStats = calculateTimeStats(bedtimes);
  const wakeTimeStats = calculateTimeStats(wakeTimes);

  return {
    bedtimeRegularity: bedtimeStats.score,
    wakeTimeRegularity: wakeTimeStats.score,
    averageBedtime: bedtimeStats.time,
    averageWakeTime: wakeTimeStats.time,
  };
}

/**
 * 少於這麼多天有記錄，就不對「每天平均睡多久」下判斷。
 *
 * 一晚是那一晚的事：孩子昨天睡 10 小時不代表他每天睡 10 小時，更不代表
 * 「不足 3 小時」。同理，今日分頁在中午看到的總時數是半天，不是一天。
 */
const MIN_DAYS_FOR_DURATION_ADVICE = 3;

/**
 * 生成睡眠建議
 */
export function generateSleepAdvice(
  stats: SleepStats,
  ageInMonths: number,
): SleepAdvice[] {
  // 一筆記錄都沒有就沒有建議。原本會拿 0 小時去對照建議值，然後宣告
  // 「睡眠時間不足，不足約 13 小時」——對一個今天還沒開始記的家長。
  if (stats.daysWithRecords === 0) {
    return [];
  }

  const advice: SleepAdvice[] = [];

  advice.push(...durationAdvice(stats, ageInMonths));

  // 2. 夜間 vs 白天比例評估
  if (stats.totalDuration > 0) {
    const nightRatio = stats.nightSleep / stats.totalDuration;

    if (ageInMonths >= 3 && nightRatio < 0.65) {
      advice.push({
        category: 'attention',
        title: '夜間睡眠比例偏低',
        description: `目前夜間睡眠佔 ${(nightRatio * 100).toFixed(0)}%，建議 3 個月以上的寶寶夜間睡眠應佔總睡眠時間的 65-75%。`,
        suggestions: [
          '白天小睡不宜過長，避免影響夜間睡眠',
          '下午 4 點後避免小睡',
          '建立固定的睡前儀式，幫助寶寶區分晝夜',
          '白天增加活動量與光照，強化晝夜節律',
        ],
      });
    }
  }

  // 3. 睡眠次數評估（每日平均次數，分母同樣是有記錄的天數）
  const dailySleepCount = stats.sleepCount / stats.daysWithRecords;

  if (ageInMonths >= 6 && dailySleepCount > 5) {
    advice.push({
      category: 'attention',
      title: '睡眠次數較多',
      description: `平均每天睡 ${dailySleepCount.toFixed(1)} 次。6 個月以上的寶寶通常一天睡 3-4 次（夜間長睡 + 2-3 次小睡）。`,
      suggestions: [
        '嘗試延長每次睡眠時長，減少睡醒頻率',
        '白天小睡時間可稍微拉長間隔',
        '夜間睡眠盡量不打斷，培養連續睡眠能力',
        '檢查是否有頻繁醒來的原因（飢餓、不適、環境）',
      ],
    });
  }

  // 4. 平均睡眠時長評估
  if (stats.averageDuration > 0 && stats.averageDuration < 60) {
    advice.push({
      category: 'attention',
      title: '單次睡眠時間較短',
      description: `平均每次睡眠僅 ${Math.round(stats.averageDuration)} 分鐘，建議延長單次睡眠時長。`,
      suggestions: [
        '確保睡眠環境舒適，減少干擾',
        '觀察是否有淺眠易醒的問題',
        '建立穩定的睡眠儀式，幫助深度睡眠',
      ],
    });
  }

  return advice;
}

function aggregateSleepDurations(completedSleeps: DailyLog[]) {
  let totalDuration = 0;
  let nightSleep = 0;
  let daytimeNaps = 0;
  let nightSleepCount = 0;
  let napCount = 0;

  completedSleeps.forEach((log) => {
    const data = log.data as SleepData;
    const duration = data.duration || 0;

    totalDuration += duration;

    if (isNightSleep(data.startTime)) {
      nightSleep += duration;
      nightSleepCount++;
    } else {
      daytimeNaps += duration;
      napCount++;
    }
  });

  return { totalDuration, nightSleep, daytimeNaps, nightSleepCount, napCount };
}

function durationAdvice(stats: SleepStats, ageInMonths: number): SleepAdvice[] {
  const advice: SleepAdvice[] = [];
  const recommendation = getSleepRequirementForAge(ageInMonths);

  const { min: minHours, max: maxHours } = parseHourRange(recommendation.totalHours);
  const actualHours = stats.dailyAverage / 60; // 使用每日平均

  // 1. 每日平均睡眠時長評估。天數不夠就整段跳過，下面的比例、次數、單次
  //    時長仍然是單日也成立的觀察。
  if (stats.daysWithRecords >= MIN_DAYS_FOR_DURATION_ADVICE) {
    if (actualHours >= minHours && actualHours <= maxHours) {
      advice.push({
        category: 'good',
        title: '睡眠時長充足',
        description: `寶寶每天平均睡 ${actualHours.toFixed(1)} 小時，符合 ${ageInMonths} 個月大寶寶的建議範圍（${minHours}-${maxHours} 小時）。`,
        suggestions: ['繼續維持目前的作息安排'],
      });
    } else if (actualHours < minHours) {
      const deficit = minHours - actualHours;

      advice.push({
        category: 'improve',
        title: '睡眠時間不足',
        description: `寶寶每天平均睡 ${actualHours.toFixed(1)} 小時，少於建議的 ${minHours}-${maxHours} 小時（不足約 ${deficit.toFixed(1)} 小時）。`,
        suggestions: [
          '提早 30 分鐘開始睡前儀式',
          '確保睡眠環境安靜、黑暗、舒適',
          '觀察寶寶的睏倦訊號（揉眼睛、打哈欠），及時安撫入睡',
          '檢查是否有干擾睡眠的因素（噪音、光線、溫度）',
        ],
      });
    } else {
      const excess = actualHours - maxHours;

      advice.push({
        category: 'attention',
        title: '睡眠時間較多',
        description: `寶寶每天平均睡 ${actualHours.toFixed(1)} 小時，超過建議的 ${maxHours} 小時（多約 ${excess.toFixed(1)} 小時）。`,
        suggestions: [
          '如果寶寶清醒時精神良好，無需過度擔心',
          '注意是否有生病或發育高峰期',
          '若持續過度嗜睡，建議諮詢醫師',
        ],
      });
    }
  }

  return advice;
}
