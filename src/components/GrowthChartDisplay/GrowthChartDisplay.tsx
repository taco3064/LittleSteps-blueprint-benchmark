import { calculateGrowthData, type GrowthChartDisplayProps } from './growthData';
import { useMemo } from 'react';
import { MeasurementType } from '~app/domain/records';
import EmptyState from '../EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

export default function GrowthChartDisplay({
  records,
  measurementType,
  gender,
  birthday,
  gestationalAgeWeeks,
  gestationalAgeDays,
}: GrowthChartDisplayProps) {
  const chartData = useMemo(
    () =>
      calculateGrowthData({
        records,
        measurementType,
        gender,
        birthday,
        gestationalAgeWeeks,
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
    return (
      <EmptyState
        theme={SERVICE_THEME.littlesteps}
        title="無法顯示圖表"
        description={
          !gender || !birthday ? '需要設定寶寶的性別和生日' : '尚無此項目的測量記錄'
        }
      />
    );
  }

  const layout = chartLayout(chartData, measurementType);
  const { label } = layout;
  const { correcting, gestationLabel } = chartData;

  return (
    <div className="panel">
      <h2 className="mb-4">
        {label.name}
        成長曲線圖 (WHO 標準)
      </h2>

      <GrowthPlot chartData={chartData} layout={layout} />

      {/* 圖上的橫軸換成矯正年齡了，那就要說出來——否則家長會拿它跟健康手冊
          上依實際月齡標的那張圖對不起來。 */}
      {correcting && (
        <p className="mt-3 text-xs text-ink-muted">
          橫軸為矯正年齡（
          {gestationLabel}
          ），已扣除早產的週數。
        </p>
      )}

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-secondary-dark" />
          <span className="text-ink-muted">WHO 第50百分位</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-ink-faint" />
          <span className="text-ink-muted">WHO 其他百分位</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-dark rounded-full" />
          <span className="text-ink-muted">寶寶數據</span>
        </div>
      </div>
    </div>
  );
}

function chartLayout(
  chartData: NonNullable<ReturnType<typeof calculateGrowthData>>,
  measurementType: MeasurementType,
) {
  const { maxAge, minValue, maxValue } = chartData;

  /*
    A phone-sized coordinate space, like `ReportChart`. This used to be 800x500
    with no viewBox, so reading the curve meant scrolling sideways; scaling that
    box down instead would have shrunk every label to ~5px.
  */
  const width = 360;
  const height = 280;
  const padding = { top: 24, right: 32, bottom: 40, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

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

  const label = getLabel(measurementType);

  return {
    width,
    height,
    padding,
    chartWidth,
    chartHeight,
    monthTicks,
    xScale,
    yScale,
    generatePath,
    label,
  };
}

interface GrowthPlotProps {
  chartData: NonNullable<ReturnType<typeof calculateGrowthData>>;
  layout: ReturnType<typeof chartLayout>;
}

function GrowthPlot({ chartData, layout }: GrowthPlotProps) {
  const { recordsWithAge, percentileCurves } = chartData;

  const { width, height, padding, chartHeight, xScale, yScale, generatePath, label }
    = layout;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto"
    >
      {/* Grid lines */}
      {[...Array(5)].map((_, i) => {
        const y = padding.top + (chartHeight / 4) * i;

        return (
          <line
            key={`grid-${i}`}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* WHO Percentile curves. `#2A7288` is `secondary-dark`. */}
      {percentileCurves.map((curve) => (
        <g key={`curve-${curve.percentile}`}>
          <path
            d={generatePath(curve.points)}
            fill="none"
            stroke={
              curve.percentile === 50
                ? '#2A7288'
                : curve.percentile === 3 || curve.percentile === 97
                  ? '#ef4444'
                  : '#94a3b8'
            }
            strokeWidth={curve.percentile === 50 ? 2 : 1}
            strokeDasharray={curve.percentile === 50 ? '0' : '4,4'}
          />
          <text
            x={width - padding.right + 4}
            y={yScale(curve.points[curve.points.length - 1].value)}
            fontSize="10"
            fill="#6b7280"
            dominantBaseline="middle"
          >
            P
            {curve.percentile}
          </text>
        </g>
      ))}

      {/* Baby's data points. `#B84A50` is `primary-dark`. */}
      {recordsWithAge.map((record, index) => (
        <g key={`point-${index}`}>
          <circle
            cx={xScale(record.ageMonths)}
            cy={yScale(record.value)}
            r="4"
            fill="#B84A50"
            stroke="white"
            strokeWidth="2"
          />
          {index === recordsWithAge.length - 1 && (
            <text
              x={xScale(record.ageMonths)}
              y={yScale(record.value) - 12}
              fontSize="10"
              fill="#B84A50"
              textAnchor="middle"
              fontWeight="bold"
            >
              {record.value}
              {' '}
              {label.unit}
            </text>
          )}
        </g>
      ))}

      {/* Connect baby's data points */}
      {recordsWithAge.length > 1 && (
        <path
          d={generatePath(recordsWithAge)}
          fill="none"
          stroke="#B84A50"
          strokeWidth="2"
        />
      )}

      <GrowthAxes layout={layout} />
    </svg>
  );
}

function GrowthAxes({ layout }: Pick<GrowthPlotProps, 'layout'>) {
  const { width, height, padding, monthTicks, xScale, label } = layout;

  return (
    <>
      {/* X-axis */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="#374151"
        strokeWidth="1.5"
      />
      {monthTicks.map((ageMonths) => {
        const x = xScale(ageMonths);

        return (
          <g key={`x-label-${ageMonths}`}>
            <line
              x1={x}
              y1={height - padding.bottom}
              x2={x}
              y2={height - padding.bottom + 5}
              stroke="#374151"
              strokeWidth="1.5"
            />
            <text
              x={x}
              y={height - padding.bottom + 17}
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {ageMonths}
              月
            </text>
          </g>
        );
      })}

      {/* Y-axis */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="#374151"
        strokeWidth="1.5"
      />
      <text x={2} y={padding.top - 10} fontSize="11" fill="#374151" fontWeight="bold">
        {label.name}
        {' ('}
        {label.unit}
        )
      </text>
    </>
  );
}

const getLabel = (measurementType: MeasurementType) => {
  if (measurementType === 'weight') {
    return { name: '體重', unit: 'kg' };
  }

  if (measurementType === 'height') {
    return { name: '身高', unit: 'cm' };
  }

  return { name: '頭圍', unit: 'cm' };
};
