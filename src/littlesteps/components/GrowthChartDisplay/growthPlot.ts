import {
  gestationalAgeLabel,
  growthAgeMonths,
  isCorrecting,
} from '~app/family/domain/correctedAge';
import { Gender, GrowthRecord } from '~app/family/domain/familyRecords';
import { MeasurementType } from '~app/knowledge/domain/referenceModels';
import {
  getPercentileValue,
  getWHOStandard,
  WHO_MAX_AGE_MONTHS,
} from '~app/littlesteps/domain/growthChartData';
interface GrowthChartDisplayProps {
  records: GrowthRecord[];
  measurementType: MeasurementType;
  gender?: Gender;
  birthday?: string;
  /** 早產週數。有填的話，每個點都畫在矯正年齡上。 */
  gestationalAgeWeeks?: number;
  gestationalAgeDays?: number;
}

export function getGrowthPlotData({
  records, measurementType, gender, birthday, gestationalAgeWeeks,
  gestationalAgeDays,
}: GrowthChartDisplayProps) {
  if (!gender || !birthday || records.length === 0) {
    return null;
  }

  // Filter records that have the selected measurement
  const validRecords = records.filter((r) => {
    if (measurementType === 'weight') {
      return r.weight !== undefined;
    }

    if (measurementType === 'height') {
      return r.height !== undefined;
    }

    if (measurementType === 'headCircumference') {
      return r.headCircumference !== undefined;
    }

    return false;
  });

  if (validRecords.length === 0) {
    return null;
  }

  // 每個點畫在那一天的年齡上；早產兒是矯正年齡，否則一個體重完全正常的
  // 32 週寶寶會整條線都貼在第 3 百分位附近。
  const recordsWithAge = validRecords.map((record) => {
    const ageMonths = growthAgeMonths(
      { birthday, gestationalAgeWeeks, gestationalAgeDays },
      new Date(record.date),
    );

    let value: number;

    if (measurementType === 'weight') {
      value = record.weight!;
    } else if (measurementType === 'height') {
      value = record.height!;
    } else {
      value = record.headCircumference!;
    }

    return {
      ageMonths,
      value,
      date: record.date,
      percentile:
        measurementType === 'weight'
          ? record.percentile?.weight
          : measurementType === 'height'
            ? record.percentile?.height
            : record.percentile?.headCircumference,
    };
  });

  // Generate WHO percentile curves (3rd, 15th, 50th, 85th, 97th).
  // Clamping to the tables' ceiling is what keeps getWHOStandard() in range.
  const maxAge = Math.min(
    WHO_MAX_AGE_MONTHS,
    Math.max(...recordsWithAge.map((r) => r.ageMonths)) + 2,
  );

  const percentileCurves = [3, 15, 50, 85, 97].map((percentile) => {
    const points: { ageMonths: number; value: number }[] = [];

    for (let age = 0; age <= maxAge; age += 1) {
      const standard = getWHOStandard(age, measurementType, gender);
      const value = getPercentileValue(standard, percentile);

      points.push({ ageMonths: age, value });
    }

    return { percentile, points };
  });

  // 圖上要不要標「矯正年齡」，用最新那一筆測量當天判斷——橫軸畫的就是這
  // 些紀錄的年齡。records 由 useGrowthTracking 依日期新到舊排好。
  const correctable = { birthday, gestationalAgeWeeks, gestationalAgeDays };

  return {
    recordsWithAge,
    percentileCurves,
    maxAge,
    correcting: isCorrecting(correctable, new Date(validRecords[0].date)),
    gestationLabel: gestationalAgeLabel(correctable),
    minValue: Math.min(
      ...percentileCurves[0].points.map((p) => p.value),
      ...recordsWithAge.map((r) => r.value),
    ),
    maxValue: Math.max(
      ...percentileCurves[percentileCurves.length - 1].points.map((p) => p.value),
      ...recordsWithAge.map((r) => r.value),
    ),
  };
}
