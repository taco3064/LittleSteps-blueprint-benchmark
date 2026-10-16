import {
  circularTimeStats,
  formatMinutesOfDay,
} from '~app/family/domain/circularTime';

export /**
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
