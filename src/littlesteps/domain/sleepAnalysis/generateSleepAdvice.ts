import { getSleepRequirementForAge } from '../sleep';
import { MIN_DAYS_FOR_DURATION_ADVICE } from './MIN_DAYS_FOR_DURATION_ADVICE';
import { SleepAdvice } from './SleepAdvice';
import { SleepStats } from './SleepStats';
import { parseHourRange } from './parseHourRange';

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

  appendDurationAdvice(advice, stats, ageInMonths);

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

function appendDurationAdvice(
  advice: SleepAdvice[],
  stats: SleepStats,
  ageInMonths: number,
) {
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
}
