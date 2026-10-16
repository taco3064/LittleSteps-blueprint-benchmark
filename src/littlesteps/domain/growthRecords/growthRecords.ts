import { growthAgeMonths } from '~app/family/domain/correctedAge';
import type {
  ChildProfile,
  Gender,
  GrowthRecord,
} from '~app/family/domain/familyRecords';
import { calculatePercentile, calculateZScore } from '../growthCalculator';
export type GrowthChild = Partial<
  Pick<
    ChildProfile,
    'gender' | 'birthday' | 'gestationalAgeWeeks' | 'gestationalAgeDays'
  >
>;

/**
 * Sort records by date (newest first)
 */
export function sortRecordsByDate(records: GrowthRecord[]): GrowthRecord[] {
  return [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

/**
 * Validate a growth record
 */
export function validateRecord(record: Omit<GrowthRecord, 'id'>): void {
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(record.date)) {
    throw new Error('Invalid date format: must be YYYY-MM-DD');
  }

  // Validate measurements
  validateWeight(record);

  validateHeight(record);

  if (record.headCircumference !== undefined) {
    if (record.headCircumference < 0) {
      throw new Error('Invalid measurement: head circumference cannot be negative');
    }

    if (record.headCircumference > 70) {
      throw new Error('Unrealistic measurement: head circumference over 70cm');
    }
  }
}

/**
 * 依 WHO 標準算出這一筆測量的百分位，早產兒用矯正年齡。
 *
 * 三件事值得說明：
 *
 * 1. 有存好的百分位也一律重算。這個函式原本會在 `record.percentile` 有值時
 *    直接回傳——寫入時算一次就不再動。矯正機制上線後，那個捷徑等於保證舊的
 *    早產紀錄永遠是錯的。百分位只是快取，不是使用者輸入，重算是安全的。
 * 2. 算不出來時保留原本存著的那一份，不清空。缺性別或生日的情況下把
 *    percentile 覆蓋成 `{}`，畫面會從「第 45 百分位」變成什麼都沒有。存著的
 *    只會是舊紀錄：現在的寫入端不存百分位，而那時算不出來的，寫入當下也
 *    一樣算不出來，所以新紀錄在這裡沒有東西可留。
 * 3. 同步。原本掛著 async 卻沒有任何 await；讀取端每一筆都要算，多包一層
 *    promise 只是讓 useMemo 沒辦法用。
 */
export function withPercentiles<T extends Omit<GrowthRecord, 'id'>>(
  record: T,
  child?: GrowthChild,
): T {
  const gender = child?.gender;
  const birthday = child?.birthday;

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

  populatePercentiles(record, percentile, { ageMonths, gender });

  return {
    ...record,
    percentile,
  };
}

function percentileFor(
  measurement: number,
  {
    ageMonths,
    type,
    gender,
  }: {
    ageMonths: number;
    type: 'weight' | 'height' | 'headCircumference';
    gender: Gender;
  },
): number {
  return calculatePercentile(
    calculateZScore({
      measurement: measurement,
      ageMonths: ageMonths,
      measurementType: type,
      gender: gender,
    }),
  );
}

function validateWeight(record: Omit<GrowthRecord, 'id'>) {
  if (record.weight !== undefined) {
    if (record.weight < 0) {
      throw new Error('Invalid measurement: weight cannot be negative');
    }

    if (record.weight > 50) {
      throw new Error('Unrealistic measurement: weight over 50kg for infant');
    }
  }
}

function validateHeight(record: Omit<GrowthRecord, 'id'>) {
  if (record.height !== undefined) {
    if (record.height < 0) {
      throw new Error('Invalid measurement: height cannot be negative');
    }

    if (record.height > 150) {
      throw new Error('Unrealistic measurement: height over 150cm for infant');
    }
  }
}

function populatePercentiles(
  record: Omit<GrowthRecord, 'id'>,
  percentile: NonNullable<GrowthRecord['percentile']>,
  { ageMonths, gender }: { ageMonths: number; gender: Gender },
) {
  if (record.weight !== undefined) {
    percentile.weight = percentileFor(record.weight, {
      ageMonths,
      type: 'weight',
      gender,
    });
  }

  if (record.height !== undefined) {
    percentile.height = percentileFor(record.height, {
      ageMonths,
      type: 'height',
      gender,
    });
  }

  if (record.headCircumference !== undefined) {
    percentile.headCircumference = percentileFor(record.headCircumference, {
      ageMonths,
      type: 'headCircumference',
      gender,
    });
  }
}
