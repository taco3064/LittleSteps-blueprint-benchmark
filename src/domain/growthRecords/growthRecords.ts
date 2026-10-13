import { growthAgeMonths } from '../correctedAge';
import { calculatePercentile, calculateZScore } from '../growthCalculator';
import type { ChildProfile, Gender, GrowthRecord } from '../records';
export type GrowthChild = Partial<
  Pick<
    ChildProfile,
    'gender' | 'birthday' | 'gestationalAgeWeeks' | 'gestationalAgeDays'
  >
>;

export function sortRecordsByDate(records: GrowthRecord[]): GrowthRecord[] {
  return [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function validateRecord(record: Omit<GrowthRecord, 'id'>): void {
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(record.date)) {
    throw new Error('Invalid date format: must be YYYY-MM-DD');
  }

  validateMeasurement(record.weight, {
    maximum: 50,
    negative: 'Invalid measurement: weight cannot be negative',
    excessive: 'Unrealistic measurement: weight over 50kg for infant',
  });

  validateMeasurement(record.height, {
    maximum: 150,
    negative: 'Invalid measurement: height cannot be negative',
    excessive: 'Unrealistic measurement: height over 150cm for infant',
  });

  validateMeasurement(record.headCircumference, {
    maximum: 70,
    negative: 'Invalid measurement: head circumference cannot be negative',
    excessive: 'Unrealistic measurement: head circumference over 70cm',
  });
}

export function withPercentiles<T extends Omit<GrowthRecord, 'id'>>(
  record: T,
  child?: GrowthChild,
): T {
  const { gender, birthday } = child ?? {};

  if (!gender || !birthday) {
    return record;
  }

  const ageMonths = growthAgeMonths(
    {
      birthday,
      gestationalAgeWeeks: child?.gestationalAgeWeeks,
      gestationalAgeDays: child?.gestationalAgeDays,
    },
    new Date(record.date),
  );

  const percentile: {
    weight?: number;
    height?: number;
    headCircumference?: number;
  } = {};

  try {
    if (record.weight !== undefined) {
      percentile.weight = percentileFor(record.weight, 'weight', {
        ageMonths,
        gender,
      });
    }

    if (record.height !== undefined) {
      percentile.height = percentileFor(record.height, 'height', {
        ageMonths,
        gender,
      });
    }

    if (record.headCircumference !== undefined) {
      percentile.headCircumference = percentileFor(
        record.headCircumference,
        'headCircumference',
        { ageMonths, gender },
      );
    }
  } catch (error) {
    // 超出 WHO 標準的年齡範圍（0-36 個月）會丟錯。既有的百分位留著，好過把
    // 畫面上的數字換成空白。
    console.warn('Failed to calculate percentiles:', error);

    return record;
  }

  return {
    ...record,
    percentile,
  };
}

export function percentileFor(
  measurement: number,
  type: 'weight' | 'height' | 'headCircumference',
  { ageMonths, gender }: { ageMonths: number; gender: Gender },
): number {
  return calculatePercentile(
    calculateZScore({ measurement, ageMonths, measurementType: type, gender }),
  );
}

function validateMeasurement(
  value: number | undefined,
  limits: {
    maximum: number;
    negative: string;
    excessive: string;
  },
) {
  if (value === undefined) {
    return;
  }

  if (value < 0) {
    throw new Error(limits.negative);
  }

  if (value > limits.maximum) {
    throw new Error(limits.excessive);
  }
}
