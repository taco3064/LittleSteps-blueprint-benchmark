export /**
 * Get the score label in Traditional Chinese
 */
function getScoreLabel(score: number): string {
  if (score >= 80) {
    return '很棒！';
  }

  if (score >= 60) {
    return '不錯';
  }

  if (score >= 40) {
    return '尚可';
  }

  return '需注意';
}
