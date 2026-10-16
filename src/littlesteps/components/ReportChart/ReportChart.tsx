import { useMemo } from 'react';
import {
  ReportChartPresentation,
  ReportChartPresentation1,
} from './ReportChartPresentation';
const TICK_COUNT = 4;

interface ReportChartProps {
  data: number[];
  labels: string[];
  type: 'line' | 'bar';
  color?: string;
  height?: number;
  unit?: string;
  recommendedValue?: number;
}

const PADDING = { top: 20, right: 16, bottom: 36, left: 40 };
const VIEW_WIDTH = 360;

export default function ReportChart({
  data,
  labels,
  type,
  /* `#2A7288` is `secondary-dark`; SVG paint can't take a Tailwind class. */
  color = '#2A7288',
  height = 200,
  unit = '',
  recommendedValue,
}: ReportChartProps) {
  const chartWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const { maxVal, minVal, yTicks } = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxVal: 1, minVal: 0, yTicks: [0, 1] };
    }

    let rawMax = Math.max(...data);
    let rawMin = Math.min(...data);

    // Include recommended value in range if present
    if (recommendedValue !== undefined) {
      rawMax = Math.max(rawMax, recommendedValue);
      rawMin = Math.min(rawMin, recommendedValue);
    }

    // Add 10% headroom
    const range = rawMax - rawMin || 1;
    const paddedMax = rawMax + range * 0.1;
    const paddedMin = Math.max(0, rawMin - range * 0.1);

    // Generate 4 ticks
    const ticks: number[] = [];

    for (let i = 0; i < TICK_COUNT; i++) {
      const val = paddedMin + ((paddedMax - paddedMin) * i) / (TICK_COUNT - 1);

      ticks.push(Math.round(val * 10) / 10);
    }

    return { maxVal: paddedMax, minVal: paddedMin, yTicks: ticks };
  }, [data, recommendedValue]);

  // Empty state
  if (!data || data.length === 0) {
    return <ReportChartPresentation height={height} />;
  }

  const getY = (value: number) => {
    const range = maxVal - minVal || 1;

    return PADDING.top + chartHeight - ((value - minVal) / range) * chartHeight;
  };

  const getX = (index: number) => {
    if (data.length === 1) {
      return PADDING.left + chartWidth / 2;
    }

    return PADDING.left + (index / (data.length - 1)) * chartWidth;
  };

  // For bar charts, compute bar positions differently
  const barWidth
    = data.length > 0 ? Math.min(24, (chartWidth / data.length) * 0.6) : 16;

  const getBarX = (index: number) => {
    const totalGroupWidth = chartWidth / data.length;

    return PADDING.left + totalGroupWidth * index + (totalGroupWidth - barWidth) / 2;
  };

  // Generate line points
  const linePoints = data.map((val, i) => `${getX(i)},${getY(val)}`).join(' ');

  // Fill polygon for line chart
  const fillPoints = [
    `${getX(0)},${PADDING.top + chartHeight}`,
    ...data.map((val, i) => `${getX(i)},${getY(val)}`),
    `${getX(data.length - 1)},${PADDING.top + chartHeight}`,
  ].join(' ');

  // Determine which labels to show (skip some if too many)
  const maxLabels = 10;
  const labelStep = Math.max(1, Math.ceil(data.length / maxLabels));

  return (
    <ReportChartPresentation1
      height={height}
      yTicks={yTicks}
      getY={getY}
      recommendedValue={recommendedValue}
      unit={unit}
      type={type}
      fillPoints={fillPoints}
      color={color}
      linePoints={linePoints}
      data={data}
      getX={getX}
      minVal={minVal}
      maxVal={maxVal}
      chartHeight={chartHeight}
      getBarX={getBarX}
      barWidth={barWidth}
      labels={labels}
      labelStep={labelStep}
    />
  );
}
