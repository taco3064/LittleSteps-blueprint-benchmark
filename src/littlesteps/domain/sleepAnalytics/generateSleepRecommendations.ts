import type {
  DailyLog,
  SleepAnalytics,
  SleepRecommendation,
} from '~app/family/domain/familyRecords';

/**
 * Generate sleep recommendations based on analytics
 */
export function generateSleepRecommendations(
  _logs: DailyLog[],
  analytics: SleepAnalytics,
): SleepRecommendation[] {
  const recommendations: SleepRecommendation[] = [];

  appendQualityRecommendations(recommendations, analytics);

  // Night wakings
  if (analytics.nightWakingsTotal > 5) {
    recommendations.push({
      id: 'too-many-wakings',
      type: 'warning',
      title: '夜醒次數較多',
      message: `寶寶在過去 24 小時內夜醒了 ${analytics.nightWakingsTotal} 次。可能原因：飢餓、尿布濕、太冷/太熱、分離焦慮等。`,
      icon: 'AlertCircle',
    });
  } else if (analytics.nightWakingsTotal === 0 && analytics.sleepCount > 0) {
    recommendations.push({
      id: 'no-wakings',
      type: 'positive',
      title: '一覺到天亮',
      message: '寶寶昨天完全沒有夜醒，睡眠品質極佳！',
      icon: 'Heart',
    });
  }

  // Routine score
  if (analytics.routineScore >= 75) {
    recommendations.push({
      id: 'good-routine',
      type: 'positive',
      title: '作息規律穩定',
      message: `寶寶的睡眠時間很規律（規律性 ${analytics.routineScore}%），這有助於培養良好的睡眠習慣。`,
      icon: 'Clock',
    });
  } else if (analytics.routineScore < 50) {
    recommendations.push({
      id: 'poor-routine',
      type: 'suggestion',
      title: '建議建立固定作息',
      message:
        '寶寶的睡眠時間不太規律。試著每天在相同時間進行睡前儀式（洗澡、按摩、唱搖籃曲），幫助建立生理時鐘。',
      icon: 'Calendar',
    });
  }

  // Total sleep duration
  if (analytics.totalSleepDuration < 600) {
    // < 10 hours
    recommendations.push({
      id: 'insufficient-sleep',
      type: 'warning',
      title: '睡眠時間不足',
      message: `寶寶過去 24 小時只睡了 ${Math.floor(analytics.totalSleepDuration / 60)} 小時 ${analytics.totalSleepDuration % 60} 分鐘。新生兒需要 14-17 小時，6個月大約 12-15 小時。`,
      icon: 'Clock',
    });
  }

  // If no recommendations, give a general positive message
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'keep-tracking',
      type: 'suggestion',
      title: '繼續記錄',
      message: '持續記錄寶寶的睡眠數據，可以幫助您了解寶寶的作息模式並做出調整。',
      icon: 'TrendingUp',
    });
  }

  return recommendations;
}

function appendQualityRecommendations(
  recommendations: SleepRecommendation[],
  analytics: SleepAnalytics,
) {
  // Sleeping through the night
  if (analytics.isSleepingThroughNight) {
    recommendations.push({
      id: 'sleep-through-night',
      type: 'positive',
      title: '恭喜！寶寶已經睡過夜',
      message: `寶寶最長連續睡眠達 ${Math.floor(analytics.longestContinuousSleep / 60)} 小時 ${analytics.longestContinuousSleep % 60} 分鐘，表現很棒！`,
      icon: 'PartyPopper',
    });
  } else if (analytics.longestContinuousSleep >= 240) {
    recommendations.push({
      id: 'almost-through-night',
      type: 'suggestion',
      title: '快要睡過夜了',
      message: `寶寶最長連續睡眠已達 ${Math.floor(analytics.longestContinuousSleep / 60)} 小時，再加油！試著延長睡前的餵奶量或建立固定的睡前儀式。`,
      icon: 'Moon',
    });
  }

  // Sleep quality
  if (analytics.sleepQualityScore >= 80) {
    recommendations.push({
      id: 'good-quality',
      type: 'positive',
      title: '睡眠品質優良',
      message: '寶寶的睡眠品質很好，請繼續保持目前的作息模式！',
      icon: 'Star',
    });
  } else if (analytics.sleepQualityScore < 50) {
    recommendations.push({
      id: 'poor-quality',
      type: 'warning',
      title: '睡眠品質需改善',
      message:
        '寶寶的睡眠品質較差，建議檢查睡眠環境（溫度、光線、噪音）或諮詢兒科醫師。',
      icon: 'AlertTriangle',
    });
  }
}
