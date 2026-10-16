import { Gender } from '~app/family/domain/familyRecords';

import EmptyState from '~app/platform/components/EmptyState';

import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
interface GrowthChartPlotProps {
  width: 360;
  height: 280;
  padding: { top: number; right: number; bottom: number; left: number };
  chartHeight: number;
  percentileCurves: {
    percentile: number;
    points: { ageMonths: number; value: number }[];
  }[];
  generatePath: (points: { ageMonths: number; value: number }[]) => string;
  yScale: (value: number) => number;
  recordsWithAge: {
    ageMonths: number;
    value: number;
    date: string;
    percentile: number | undefined;
  }[];
  xScale: (ageMonths: number) => number;
  label: { name: string; unit: string };
  monthTicks: number[];
}
interface GrowthChartDisplayPresentationProps {
  gender: Gender | undefined;
  birthday: string | undefined;
}

interface GrowthChartDisplayPresentation2Props {
  curve: { percentile: number; points: { ageMonths: number; value: number }[] };
  generatePath: (points: { ageMonths: number; value: number }[]) => string;
  width: 360;
  padding: { top: number; right: number; bottom: number; left: number };
  yScale: (value: number) => number;
}

interface GrowthChartDisplayPresentation3Props {
  index: number;
  xScale: (ageMonths: number) => number;
  record: {
    ageMonths: number;
    value: number;
    date: string;
    percentile: number | undefined;
  };
  yScale: (value: number) => number;
  recordsWithAge: {
    ageMonths: number;
    value: number;
    date: string;
    percentile: number | undefined;
  }[];
  label: { name: string; unit: string };
}

interface GrowthChartDisplayPresentation4Props {
  ageMonths: number;
  x: number;
  height: 280;
  padding: { top: number; right: number; bottom: number; left: number };
}

interface GrowthChartDisplayPresentation1Props {
  label: { name: string; unit: string };
  width: 360;
  height: 280;
  padding: { top: number; right: number; bottom: number; left: number };
  chartHeight: number;
  percentileCurves: {
    percentile: number;
    points: { ageMonths: number; value: number }[];
  }[];
  generatePath: (points: { ageMonths: number; value: number }[]) => string;
  yScale: (value: number) => number;
  recordsWithAge: {
    ageMonths: number;
    value: number;
    date: string;
    percentile: number | undefined;
  }[];
  xScale: (ageMonths: number) => number;
  monthTicks: number[];
  correcting: boolean;
  gestationLabel: string | null;
}

export function GrowthChartDisplayPresentation({
  gender, birthday,
}: GrowthChartDisplayPresentationProps) {
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

export function GrowthChartDisplayPresentation2({
  curve, generatePath, width, padding, yScale,
}: GrowthChartDisplayPresentation2Props) {
  return (
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
  );
}

export function GrowthChartDisplayPresentation3({
  index, xScale, record, yScale, recordsWithAge, label,
}: GrowthChartDisplayPresentation3Props) {
  return (
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
  );
}

export function GrowthChartDisplayPresentation4({
  ageMonths, x, height, padding,
}: GrowthChartDisplayPresentation4Props) {
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
}

export function GrowthChartDisplayPresentation1({
  label, width, height, padding, chartHeight, percentileCurves, generatePath, yScale,
  recordsWithAge, xScale, monthTicks, correcting, gestationLabel,
}: GrowthChartDisplayPresentation1Props) {
  return (
    <div className="panel">
      <h2 className="mb-4">
        {label.name}
        成長曲線圖 (WHO 標準)
      </h2>

      <GrowthChartPlot
        width={width}
        height={height}
        padding={padding}
        chartHeight={chartHeight}
        percentileCurves={percentileCurves}
        generatePath={generatePath}
        yScale={yScale}
        recordsWithAge={recordsWithAge}
        xScale={xScale}
        label={label}
        monthTicks={monthTicks}
      />

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
      <GrowthChartDisplayPresentation1Section3 />
    </div>
  );
}

function GrowthChartDisplayPresentation1Section1({
  padding, height, width,
}: Pick<GrowthChartDisplayPresentation1Props, 'padding' | 'height' | 'width'>) {
  return (
    <line
      x1={padding.left}
      y1={height - padding.bottom}
      x2={width - padding.right}
      y2={height - padding.bottom}
      stroke="#374151"
      strokeWidth="1.5"
    />
  );
}

function GrowthChartDisplayPresentation1Section2({
  padding, height,
}: Pick<GrowthChartDisplayPresentation1Props, 'padding' | 'height'>) {
  return (
    <line
      x1={padding.left}
      y1={padding.top}
      x2={padding.left}
      y2={height - padding.bottom}
      stroke="#374151"
      strokeWidth="1.5"
    />
  );
}

function GrowthChartDisplayPresentation1Section3() {
  return (
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
  );
}

function GrowthChartPlot({
  width, height, padding, chartHeight, percentileCurves, generatePath, yScale,
  recordsWithAge, xScale, label, monthTicks,
}: GrowthChartPlotProps) {
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
        <GrowthChartDisplayPresentation2
          key={`curve-${curve.percentile}`}
          curve={curve}
          generatePath={generatePath}
          width={width}
          padding={padding}
          yScale={yScale}
        />
      ))}

      {/* Baby's data points. `#B84A50` is `primary-dark`. */}
      {recordsWithAge.map((record, index) => (
        <GrowthChartDisplayPresentation3
          key={`point-${index}`}
          index={index}
          xScale={xScale}
          record={record}
          yScale={yScale}
          recordsWithAge={recordsWithAge}
          label={label}
        />
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

      {/* X-axis */}
      <GrowthChartDisplayPresentation1Section1
        padding={padding}
        height={height}
        width={width}
      />
      {monthTicks.map((ageMonths) => {
        const x = xScale(ageMonths);

        return (
          <GrowthChartDisplayPresentation4
            key={`x-label-${ageMonths}`}
            ageMonths={ageMonths}
            x={x}
            height={height}
            padding={padding}
          />
        );
      })}

      {/* Y-axis */}
      <GrowthChartDisplayPresentation1Section2 padding={padding} height={height} />
      <text
        x={2}
        y={padding.top - 10}
        fontSize="11"
        fill="#374151"
        fontWeight="bold"
      >
        {label.name}
        {' '}
        (
        {label.unit}
        )
      </text>
    </svg>
  );
}
