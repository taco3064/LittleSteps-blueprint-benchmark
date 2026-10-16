import type { WHOStandard } from '~app/knowledge/domain/referenceModels';
import { probitApproximation } from './probitApproximation';

/**
 * Calculate percentile value for a given standard and percentile
 * Uses LMS method inverse calculation
 */
export function getPercentileValue(
  standard: WHOStandard,
  percentile: number,
): number {
  const { L, M, S } = standard;

  // Convert percentile to z-score using inverse normal distribution
  // Approximation of probit function (inverse of cumulative normal distribution)
  const p = percentile / 100;
  const z = probitApproximation(p);

  // LMS inverse formula: X = M * (1 + L * S * Z)^(1/L) when L ≠ 0
  if (Math.abs(L) < 0.0001) {
    // When L ≈ 0, use: X = M * exp(S * Z)
    return M * Math.exp(S * z);
  }

  return M * Math.pow(1 + L * S * z, 1 / L);
}
