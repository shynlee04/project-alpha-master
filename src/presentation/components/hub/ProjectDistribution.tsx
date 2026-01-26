/**
 * @fileoverview Project Distribution Pie Chart
 * @module presentation/components/hub/ProjectDistribution
 * @created 2026-01-26
 *
 * Pie chart displaying project feature distribution using Recharts.
 * Shows how many projects have IDE and Notes features enabled.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface ProjectDistributionProps {
  /** Number of projects with IDE workspace binding */
  ideCount: number;
  /** Number of projects with Notes workspace binding */
  notesCount: number;
  /** Optional additional CSS classes */
  className?: string;
}

// Color palette for project features (8-bit dark theme compatible)
// NOTE: Knowledge and Study features are DEFERRED (ADR-034)
const FEATURE_COLORS: Record<string, string> = {
  ide: '#3b82f6',   // blue-500
  notes: '#eab308',   // yellow-500
  // Deferred: knowledge: '#22c55e', // green-500
  // Deferred: study: '#a855f7',     // purple-500
};

// Feature icons (emojis)
const FEATURE_ICONS: Record<string, string> = {
  ide: '💻',
  notes: '📝',
  // Deferred: knowledge: '📚',
  // Deferred: study: '🎓',
};

/**
 * Project distribution pie chart component.
 *
 * Features:
 * - Shows distribution of projects across features
 * - Responsive sizing
 * - Custom color palette (8-bit themed)
 * - Icons in legend
 * - Loading state
 *
 * @example
 * ```tsx
 * <ProjectDistribution
 *   ideCount={5}
 *   notesCount={3}
 * />
 * ```
 */
export const ProjectDistribution: React.FC<ProjectDistributionProps> = ({
  ideCount,
  notesCount,
  className,
}) => {
  const { t } = useTranslation();

  // Transform data for chart
  const chartData = React.useMemo(() => {
    const data = [
      {
        name: 'IDE',
        value: ideCount,
        color: FEATURE_COLORS.ide,
        icon: FEATURE_ICONS.ide,
        labelKey: 'hub.projectBinding.features.ide',
      },
      {
        name: 'Notes',
        value: notesCount,
        color: FEATURE_COLORS.notes,
        icon: FEATURE_ICONS.notes,
        labelKey: 'hub.projectBinding.features.notes',
      },
      // Deferred: Knowledge feature (ADR-034)
      // Deferred: Study feature (ADR-034)
    ];

    // Filter out features with 0 projects
    return data.filter((item) => item.value > 0);
  }, [ideCount, notesCount]);

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className={cn('h-64 border-2 border-border rounded-md bg-background flex items-center justify-center', className)}>
        <div className="text-sm text-muted-foreground text-center px-4">
          {t('hub.dashboard.noProjects', 'No projects yet.')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-64 border-2 border-border rounded-md bg-background p-4', className)}>
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-sm font-pixel text-foreground uppercase">
          {t('hub.dashboard.projectDistribution', 'PROJECT_DISTRIBUTION')}
        </h3>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => {
              const percent = value / chartData.reduce((sum, item) => sum + item.value, 0);
              return `${name} ${Math.round(percent * 100)}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '2px solid hsl(var(--border))',
              borderRadius: '4px',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: any, name: any) => {
              const item = chartData.find((d) => d.name === name);
              if (!item) return [`${name}: ${value} projects`];
              return [`${item.icon} ${name}: ${value} projects`];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(name: string, entry: any) => {
              return `${entry.payload?.icon || ''} ${name}`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
