export /**
 * Clamp a value between 0 and 100
 */
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
