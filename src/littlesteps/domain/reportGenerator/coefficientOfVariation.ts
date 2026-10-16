import { standardDeviation } from './standardDeviation';

export /**
 * Coefficient of variation (CV): std / mean, returns 0 if mean is 0
 */
function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  if (mean === 0) {
    return 0;
  }

  return standardDeviation(values) / mean;
}
