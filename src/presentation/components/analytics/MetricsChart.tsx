/**
 * Metrics Chart Components
 *
 * Reusable chart components for analytics dashboard.
 * Uses SVG for 8-bit gaming style without external charting libraries.
 *
 * Mobile: Responsive charts with touch interactions
 * Style: No blur, pixel-perfect, high contrast
 *
 * @module components/analytics/MetricsChart
 * @story S-034 Analytics Dashboard and Metrics
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface ChartProps {
  data: ChartData[];
  className?: string;
  height?: number;
}

/**
 * Line Chart - Shows trends over time
 */
export function LineChart({ data, className, height = 200 }: ChartProps) {
  const { width, points, maxLabelWidth } = useMemo(() => {
    const maxLabelWidth = Math.max(...data.map(d => d.label.length)) * 8;
    const width = Math.max(400, data.length * 40);

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - maxLabelWidth - 20) + maxLabelWidth + 10;
      const y = height - (d.value / maxValue) * (height - 40) - 20;
      return `${x},${y}`;
    });

    return { width, points, maxLabelWidth };
  }, [data, height]);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <svg width={width} height={height} className="font-mono text-xs">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1={maxLabelWidth + 10}
            y1={20 + (i * (height - 40)) / 4}
            x2={width - 20}
            y2={20 + (i * (height - 40)) / 4}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Line path */}
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const maxValue = Math.max(...data.map(d => d.value), 1);
          const x = (i / (data.length - 1)) * (width - maxLabelWidth - 20) + maxLabelWidth + 10;
          const y = height - (d.value / maxValue) * (height - 40) - 20;

          return (
            <g key={i}>
              <circle cx={x} cy={y} r={4} fill="hsl(var(--primary))" />
              {/* Value label */}
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize="10"
              >
                {d.value}
              </text>
              {/* X-axis label */}
              <text
                x={x}
                y={height - 5}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Bar Chart - Compares values across categories
 */
export function BarChart({ data, className, height = 200 }: ChartProps) {
  const { width, barWidth, maxValue } = useMemo(() => {
    const maxLabelWidth = Math.max(...data.map(d => d.label.length)) * 8;
    const barWidth = 40;
    const width = Math.max(400, maxLabelWidth + data.length * (barWidth + 10) + 20);
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return { width, barWidth, maxLabelWidth, maxValue };
  }, [data, height]);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <svg width={width} height={height} className="font-mono text-xs">
        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map(i => {
          const value = Math.round((maxValue / 4) * i);
          const y = height - 20 - (i * (height - 40)) / 4;
          return (
            <text
              key={i}
              x={5}
              y={y + 4}
              fill="hsl(var(--muted-foreground))"
              fontSize="10"
            >
              {value}
            </text>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 40);
          const x = 60 + i * (45);
          const y = height - 20 - barHeight;

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="hsl(var(--primary))"
                opacity={0.8}
              />
              {/* Value label */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize="10"
              >
                {d.value}
              </text>
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="9"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Pie Chart - Shows distribution
 */
export function PieChart({ data, className }: ChartProps) {
  const { segments, total } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    let currentAngle = 0;

    const segments = data.map((d) => {
      const angle = (d.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      return {
        ...d,
        startAngle,
        endAngle,
        percentage: Math.round((d.value / total) * 100),
      };
    });

    return { segments, total };
  }, [data]);

  const size = 200;
  const center = size / 2;
  const radius = 80;

  const getCoordinates = (angle: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const createPath = (startAngle: number, endAngle: number) => {
    const start = getCoordinates(startAngle);
    const end = getCoordinates(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <div className={cn('flex flex-col md:flex-row items-center gap-6', className)}>
      <svg width={size} height={size} className="font-mono text-xs">
        {segments.map((d, i) => (
          <g key={i}>
            <path
              d={createPath(d.startAngle, d.endAngle)}
              fill={d.color || `hsl(var(--primary))`}
              opacity={0.8}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-4 h-4 border-2 border-border"
              style={{ backgroundColor: d.color || 'hsl(var(--primary))' }}
            />
            <span className="text-sm text-foreground">{d.label}</span>
            <span className="text-sm text-muted-foreground">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Activity Heatmap - GitHub-style contribution graph
 */
interface HeatmapProps {
  data: Map<string, number>; // date -> count
  className?: string;
}

export function ActivityHeatmap({ data, className }: HeatmapProps) {
  const { weeks, maxCount } = useMemo(() => {
    // Get date range
    const dates = Array.from(data.keys()).sort();
    const endDate = new Date(dates[dates.length - 1] || Date.now());
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 364); // 52 weeks

    // Build weekly grid
    const weeks: Array<Array<{ date: string; count: number } | null>> = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < 52; week++) {
      const weekData: Array<{ date: string; count: number } | null> = [];

      for (let day = 0; day < 7; day++) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const count = data.get(dateKey) || 0;

        weekData.push({
          date: dateKey,
          count,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(weekData);
    }

    const maxCount = Math.max(...Array.from(data.values()), 1);

    return { weeks, maxCount };
  }, [data]);

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'hsl(var(--muted))';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'hsl(var(--primary) / 0.25)';
    if (intensity < 0.5) return 'hsl(var(--primary) / 0.5)';
    if (intensity < 0.75) return 'hsl(var(--primary) / 0.75)';
    return 'hsl(var(--primary))';
  };

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <svg width={54 * 12} height={150} className="font-mono text-xs">
        {/* Day labels */}
        {['Mon', '', 'Wed', '', 'Fri', '', ''].map((label, i) => (
          <text
            key={i}
            x={0}
            y={20 + i * 20}
            fill="hsl(var(--muted-foreground))"
            fontSize="9"
          >
            {label}
          </text>
        ))}

        {/* Heatmap grid */}
        {weeks.map((week, weekIndex) => (
          <g key={weekIndex} transform={`translate(${30 + weekIndex * 12}, 0)`}>
            {week.map((day, dayIndex) => {
              if (!day) return null;

              return (
                <rect
                  key={dayIndex}
                  x={0}
                  y={15 + dayIndex * 18}
                  width={10}
                  height={10}
                  fill={getIntensityColor(day.count)}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                >
                  <title>{day.date}: {day.count} activities</title>
                </rect>
              );
            })}
          </g>
        ))}

        {/* Month labels */}
        <g transform={`translate(30, ${140})`}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
            (month, i) => (
              <text
                key={i}
                x={i * 53}
                y={0}
                fill="hsl(var(--muted-foreground))"
                fontSize="9"
              >
                {month}
              </text>
            )
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * Stat Card - Single metric display
 */
export interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, unit, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] p-4',
        className
      )}
    >
      <div className="text-sm text-muted-foreground font-mono mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-foreground">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground font-mono">{unit}</span>
        )}
      </div>
      {trend && (
        <div
          className={cn(
            'text-xs font-mono mt-1',
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          )}
        >
          {trend.isPositive ? '+' : ''}
          {trend.value}%
        </div>
      )}
    </div>
  );
}
