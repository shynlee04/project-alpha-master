/**
 * @fileoverview Workspace Distribution Pie Chart
 * @module spike/components/hub/WorkspacePieChart
 * @created 2026-01-03T01:50:00+07:00
 *
 * Pie chart displaying workspace binding distribution using Recharts.
 * Shows how many projects are bound to each workspace.
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
import { cn } from '@/spike/lib/utils';

export interface WorkspacePieChartProps {
  /** Number of projects with IDE workspace binding */
  ideCount: number;
  /** Number of projects with Knowledge workspace binding */
  knowledgeCount: number;
  /** Number of projects with Notes workspace binding */
  notesCount: number;
  /** Number of projects with Study workspace binding */
  studyCount: number;
  /** Optional additional CSS classes */
  className?: string;
}

// Color palette for workspaces (8-bit dark theme compatible)
const WORKSPACE_COLORS: Record<string, string> = {
  ide: '#3b82f6',      // blue-500
  knowledge: '#22c55e', // green-500
  notes: '#eab308',     // yellow-500
  study: '#a855f7',     // purple-500
};

// Workspace icons (emojis)
const WORKSPACE_ICONS: Record<string, string> = {
  ide: '💻',
  knowledge: '📚',
  notes: '📝',
  study: '🎓',
};

/**
 * Workspace distribution pie chart component.
 *
 * Features:
 * - Shows distribution of projects across workspaces
 * - Responsive sizing
 * - Custom color palette (8-bit themed)
 * - Icons in legend
 * - Loading state
 *
 * @example
 * ```tsx
 * <WorkspacePieChart
 *   ideCount={5}
 *   knowledgeCount={3}
 *   notesCount={8}
 *   studyCount={2}
 * />
 * ```
 */
export const WorkspacePieChart: React.FC<WorkspacePieChartProps> = ({
  ideCount,
  knowledgeCount,
  notesCount,
  studyCount,
  className,
}) => {
  const { t } = useTranslation();

  // Transform data for chart
  const chartData = React.useMemo(() => {
    const data = [
      {
        name: 'IDE',
        value: ideCount,
        color: WORKSPACE_COLORS.ide,
        icon: WORKSPACE_ICONS.ide,
        labelKey: 'hub.workspaceBinding.workspaces.ide',
      },
      {
        name: 'Knowledge',
        value: knowledgeCount,
        color: WORKSPACE_COLORS.knowledge,
        icon: WORKSPACE_ICONS.knowledge,
        labelKey: 'hub.workspaceBinding.workspaces.knowledge',
      },
      {
        name: 'Notes',
        value: notesCount,
        color: WORKSPACE_COLORS.notes,
        icon: WORKSPACE_ICONS.notes,
        labelKey: 'hub.workspaceBinding.workspaces.notes',
      },
      {
        name: 'Study',
        value: studyCount,
        color: WORKSPACE_COLORS.study,
        icon: WORKSPACE_ICONS.study,
        labelKey: 'hub.workspaceBinding.workspaces.study',
      },
    ];

    // Filter out workspaces with 0 projects
    return data.filter((item) => item.value > 0);
  }, [ideCount, knowledgeCount, notesCount, studyCount]);

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className={cn('h-64 border-2 border-border rounded-md bg-background flex items-center justify-center', className)}>
        <div className="text-sm text-muted-foreground text-center px-4">
          {t('hub.dashboard.noWorkspaces', 'No workspace bindings yet.')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-64 border-2 border-border rounded-md bg-background p-4', className)}>
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-sm font-pixel text-foreground uppercase">
          {t('hub.dashboard.workspaceDistribution', 'WORKSPACE_DISTRIBUTION')}
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