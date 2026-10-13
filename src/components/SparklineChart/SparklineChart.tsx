import type { ReactNode } from 'react';

interface SparklineChartProps {
  data: number[];
  height?: number;
  color?: string;
  fillColor?: string;
}

/**
 * viewBox 的座標寬度，不是渲染寬度——圖表一律撐滿容器，所以呼叫端無從影響它，
 * 也就不該是一個 prop。
 */
const VIEWBOX_WIDTH = 120;

/**
 * 三個分支共用的外殼。寫死 `width` 的 svg 在 320px 的螢幕上會把卡片撐開；
 * 改成撐滿容器、只固定高度。`preserveAspectRatio="none"` 讓折線真的鋪滿寬度
 * （sparkline 在意的是形狀不是比例），線寬則用 non-scaling-stroke 保住。
 */
function Canvas({ height, children }: { height: number; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
      height={height}
      preserveAspectRatio="none"
      className="w-full"
    >
      {children}
    </svg>
  );
}

/*
  SVG `stroke`/`fill` take paint values, not Tailwind classes, so the token has
  to arrive here as its literal. `#2A7288` is `secondary-dark`: the DEFAULT
  `secondary` is a 2:1 fill and disappeared at 1.5px.
*/
export default function SparklineChart({
  data,
  height = 32,
  color = '#2A7288',
  fillColor,
}: SparklineChartProps) {
  // Handle edge cases
  if (!data || data.length === 0) {
    return (
      <Canvas height={height}>
        <line
          x1={0}
          y1={height / 2}
          x2={VIEWBOX_WIDTH}
          y2={height / 2}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.4}
          vectorEffect="non-scaling-stroke"
        />
      </Canvas>
    );
  }

  if (data.length === 1) {
    return (
      <Canvas height={height}>
        <circle cx={VIEWBOX_WIDTH / 2} cy={height / 2} r={2.5} fill={color} />
      </Canvas>
    );
  }

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  // Avoid division by zero when all values are the same.
  const range = maxVal - minVal || 1;

  const padding = 2;
  const chartWidth = VIEWBOX_WIDTH - padding * 2;
  const chartHeight = height - padding * 2;

  // Generate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - minVal) / range) * chartHeight;

    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Build fill polygon path (area under the line)
  const fillPoints = [
    `${points[0].x},${height - padding}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${height - padding}`,
  ].join(' ');

  return (
    <Canvas height={height}>
      {/* Fill area */}
      {fillColor && <polygon points={fillPoints} fill={fillColor} opacity={0.2} />}
      {/* Line */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* End point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2}
        fill={color}
      />
    </Canvas>
  );
}
