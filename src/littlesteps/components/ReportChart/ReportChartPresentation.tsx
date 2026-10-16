interface ReportChartPresentationProps {
  height: number;
}

interface ReportChartPresentation2Props {
  tick: number;
  y: number;
}

interface ReportChartPresentation3Props {
  getY: (value: number) => number;
  recommendedValue: number;
  unit: string;
}

interface ReportChartPresentation4Props {
  fillPoints: string;
  color: string;
  linePoints: string;
  data: number[];
  getX: (index: number) => number;
  getY: (value: number) => number;
}

interface ReportChartPresentation5Props {
  data: number[];
  minVal: number;
  maxVal: number;
  chartHeight: number;
  getBarX: (index: number) => number;
  barWidth: number;
  color: string;
}

interface ReportChartPresentation1Props {
  height: number;
  yTicks: number[];
  getY: (value: number) => number;
  recommendedValue: number | undefined;
  unit: string;
  type: 'line' | 'bar';
  fillPoints: string;
  color: string;
  linePoints: string;
  data: number[];
  getX: (index: number) => number;
  minVal: number;
  maxVal: number;
  chartHeight: number;
  getBarX: (index: number) => number;
  barWidth: number;
  labels: string[];
  labelStep: number;
}
const PADDING = { top: 20, right: 16, bottom: 36, left: 40 };

const VIEW_WIDTH = 360;

export function ReportChartPresentation({ height }: ReportChartPresentationProps) {
  return (
    <div
      className="flex items-center justify-center bg-warm-white rounded-xl"
      style={{ height }}
    >
      <p className="text-sm text-ink-faint">尚無資料</p>
    </div>
  );
}

export function ReportChartPresentation2({
  tick, y,
}: ReportChartPresentation2Props) {
  return (
    <g key={`ytick-${tick}`}>
      <line
        x1={PADDING.left}
        y1={y}
        x2={VIEW_WIDTH - PADDING.right}
        y2={y}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
      <text
        x={PADDING.left - 6}
        y={y + 4}
        textAnchor="end"
        className="fill-ink-faint"
        fontSize={10}
      >
        {tick % 1 === 0 ? tick : tick.toFixed(1)}
      </text>
    </g>
  );
}

export function ReportChartPresentation3({
  getY, recommendedValue, unit,
}: ReportChartPresentation3Props) {
  return (
    <g>
      <line
        x1={PADDING.left}
        y1={getY(recommendedValue)}
        x2={VIEW_WIDTH - PADDING.right}
        y2={getY(recommendedValue)}
        stroke="#9A6212"
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <text
        x={VIEW_WIDTH - PADDING.right + 2}
        y={getY(recommendedValue) + 3}
        fontSize={9}
        className="fill-butter-dark"
      >
        {recommendedValue}
        {unit}
      </text>
    </g>
  );
}

export function ReportChartPresentation4({
  fillPoints, color, linePoints, data, getX, getY,
}: ReportChartPresentation4Props) {
  return (
    <>
      {/* Fill area */}
      <polygon points={fillPoints} fill={color} opacity={0.1} />
      {/* Line */}
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {data.map((val, i) => (
        <circle
          key={`dot-${i}`}
          cx={getX(i)}
          cy={getY(val)}
          r={3}
          fill="white"
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </>
  );
}

export function ReportChartPresentation5({
  data, minVal, maxVal, chartHeight, getBarX, barWidth, color,
}: ReportChartPresentation5Props) {
  return (
    <>
      {/* Bars */}
      {data.map((val, i) => {
        const barHeight = Math.max(
          1,
          ((val - minVal) / (maxVal - minVal || 1)) * chartHeight,
        );

        const barY = PADDING.top + chartHeight - barHeight;

        return (
          <rect
            key={`bar-${i}`}
            x={getBarX(i)}
            y={barY}
            width={barWidth}
            height={barHeight}
            rx={Math.min(4, barWidth / 2)}
            fill={color}
            opacity={0.85}
          />
        );
      })}
    </>
  );
}

export function ReportChartPresentation1({
  height, yTicks, getY, recommendedValue, unit, type, fillPoints, color, linePoints,
  data, getX, minVal, maxVal, chartHeight, getBarX, barWidth, labels, labelStep,
}: ReportChartPresentation1Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y-axis gridlines and labels */}
      {yTicks.map((tick) => {
        const y = getY(tick);

        return <ReportChartPresentation2 key={`ytick-${tick}`} tick={tick} y={y} />;
      })}

      {/* Recommended value dashed line */}
      {recommendedValue !== undefined && (
        <ReportChartPresentation3
          getY={getY}
          recommendedValue={recommendedValue}
          unit={unit}
        />
      )}

      {/* Chart body */}
      {type === 'line'
        ? (
            <ReportChartPresentation4
              fillPoints={fillPoints}
              color={color}
              linePoints={linePoints}
              data={data}
              getX={getX}
              getY={getY}
            />
          )
        : (
            <ReportChartPresentation5
              data={data}
              minVal={minVal}
              maxVal={maxVal}
              chartHeight={chartHeight}
              getBarX={getBarX}
              barWidth={barWidth}
              color={color}
            />
          )}

      {/* X-axis labels */}
      {labels.map((label, i) => {
        if (i % labelStep !== 0 && i !== labels.length - 1) {
          return null;
        }

        const x = type === 'bar' ? getBarX(i) + barWidth / 2 : getX(i);

        return (
          <text
            key={`xlabel-${i}`}
            x={x}
            y={height - 6}
            textAnchor="middle"
            fontSize={9}
            className="fill-ink-faint"
          >
            {label}
          </text>
        );
      })}

      {/* Unit label */}
      {unit && (
        <text
          x={PADDING.left}
          y={PADDING.top - 6}
          fontSize={9}
          className="fill-ink-faint"
        >
          (
          {unit}
          )
        </text>
      )}
    </svg>
  );
}
