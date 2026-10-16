import { getGrowthPlotData } from './growthPlot';

import { useMemo } from 'react';
import { Gender, GrowthRecord } from '~app/family/domain/familyRecords';
import { MeasurementType } from '~app/knowledge/domain/referenceModels';
import {
  GrowthChartDisplayPresentation,
  GrowthChartDisplayPresentation1,
} from './GrowthChartDisplayPresentation';
const width = 360;
const height = 280;
const padding = { top: 24, right: 32, bottom: 40, left: 36 };
const chartWidth = width - padding.left - padding.right;
const chartHeight = height - padding.top - padding.bottom;

interface GrowthChartDisplayProps {
  records: GrowthRecord[];
  measurementType: MeasurementType;
  gender?: Gender;
  birthday?: string;
  /** 早產週數。有填的話，每個點都畫在矯正年齡上。 */
  gestationalAgeWeeks?: number;
  gestationalAgeDays?: number;
}

export default function GrowthChartDisplay({
  records, measurementType, gender, birthday, gestationalAgeWeeks,
  gestationalAgeDays,
}: GrowthChartDisplayProps) {
  const chartData = useMemo(
    () =>
      getGrowthPlotData({
        records, measurementType, gender, birthday, gestationalAgeWeeks,
        gestationalAgeDays,
      }),
    [
      records,
      measurementType,
      gender,
      birthday,
      gestationalAgeWeeks,
      gestationalAgeDays,
    ],
  );

  if (!chartData) {
    return <GrowthChartDisplayPresentation gender={gender} birthday={birthday} />;
  }

  const {
    recordsWithAge, percentileCurves, maxAge, minValue, maxValue, correcting,
    gestationLabel,
  } = chartData;

  /*
    A phone-sized coordinate space, like `ReportChart`. This used to be 800x500
    with no viewBox, so reading the curve meant scrolling sideways; scaling that
    box down instead would have shrunk every label to ~5px.
  */
  // Cap the x axis at ~8 labels so month ticks don't collide at 360px.
  const monthStep = Math.max(3, Math.ceil(maxAge / 8 / 3) * 3);
  const monthTicks: number[] = [];

  for (let m = 0; m <= maxAge; m += monthStep) {
    monthTicks.push(m);
  }

  // Scales
  const xScale = (ageMonths: number) => {
    return padding.left + (ageMonths / maxAge) * chartWidth;
  };

  const yScale = (value: number) => {
    const range = maxValue - minValue;
    const padding_y = range * 0.1; // 10% padding

    return (
      height
      - padding.bottom
      - ((value - minValue + padding_y) / (range + padding_y * 2)) * chartHeight
    );
  };

  // Generate path for percentile curves
  const generatePath = (points: { ageMonths: number; value: number }[]) => {
    return points
      .map((point, index) => {
        const x = xScale(point.ageMonths);
        const y = yScale(point.value);

        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  };

  const getLabel = () => {
    if (measurementType === 'weight') {
      return { name: '體重', unit: 'kg' };
    }

    if (measurementType === 'height') {
      return { name: '身高', unit: 'cm' };
    }

    return { name: '頭圍', unit: 'cm' };
  };

  const label = getLabel();

  return (
    <GrowthChartDisplayPresentation1
      label={label}
      width={width}
      height={height}
      padding={padding}
      chartHeight={chartHeight}
      percentileCurves={percentileCurves}
      generatePath={generatePath}
      yScale={yScale}
      recordsWithAge={recordsWithAge}
      xScale={xScale}
      monthTicks={monthTicks}
      correcting={correcting}
      gestationLabel={gestationLabel}
    />
  );
}
