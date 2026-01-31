/**
 * Analytics Dashboard - Main Analytics UI
 *
 * Displays usage metrics, project statistics, and performance indicators.
 * Privacy-first: Local storage only, no telemetry.
 * Opt-in: Analytics disabled by default.
 *
 * Dashboard sections:
 * - Overview: Key metrics at a glance
 * - Usage: Session duration, files edited, commands run
 * - Projects: Project access patterns
 * - Performance: Load time, memory, cache stats
 * - Activity: GitHub-style contribution heatmap
 *
 * Mobile: Responsive design, touch targets >=44px
 * Style: 8-bit gaming, no blur, high contrast
 *
 * @module components/analytics/AnalyticsDashboard
 * @story S-034 Analytics Dashboard and Metrics
 */

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { TimeRange } from '@/infrastructure/persistence/stores/analytics-store';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LineChart,
  BarChart,
  ActivityHeatmap,
  StatCard,
} from './MetricsChart';

export function AnalyticsDashboard() {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const {
    enabled,
    timeRange,
    dailyMetrics,
    performanceStats,
    lastUpdated,
    setEnabled,
    setTimeRange,
    refreshData,
    clearAllData,
    exportDataAsJson,
    exportDataAsCsv,
  } = useAnalytics();

  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Initialize analytics on mount if enabled
  useEffect(() => {
    if (enabled) {
      refreshData();
    }
  }, [enabled, timeRange, refreshData]);

  // Calculate aggregated stats
  const stats = useMemo(() => {
    if (dailyMetrics.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalFilesEdited: 0,
        totalCommands: 0,
        avgDailyFiles: 0,
        avgDailyDuration: 0,
      };
    }

    const totalSessions = dailyMetrics.reduce((sum: number, d: any) => sum + d.sessions, 0);
    const totalDuration = dailyMetrics.reduce((sum: number, d: any) => sum + d.totalDuration, 0);
    const totalFilesEdited = dailyMetrics.reduce((sum: number, d: any) => sum + d.filesEdited, 0);
    const totalCommands = dailyMetrics.reduce((sum: number, d: any) => sum + d.commandsRun, 0);

    return {
      totalSessions,
      totalDuration: Math.round(totalDuration / 1000 / 60), // Convert to minutes
      totalFilesEdited,
      totalCommands,
      avgDailyFiles: Math.round(totalFilesEdited / dailyMetrics.length),
      avgDailyDuration: Math.round((totalDuration / dailyMetrics.length) / 1000 / 60),
    };
  }, [dailyMetrics]);

  // Prepare chart data
  const filesEditedData = useMemo(() => {
    return dailyMetrics.slice(-14).map((d: any) => ({
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: d.filesEdited,
    }));
  }, [dailyMetrics]);

  const sessionDurationData = useMemo(() => {
    return dailyMetrics.slice(-14).map((d: any) => ({
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(d.totalDuration / 1000 / 60), // Convert to minutes
    }));
  }, [dailyMetrics]);

  const featureUsageData = useMemo(() => {
    const featureMap = new Map<string, number>();

    dailyMetrics.forEach((d: any) => {
      Object.entries(d.featuresUsed || {}).forEach(([feature, count]: [string, any]) => {
        featureMap.set(feature, (featureMap.get(feature) || 0) + count);
      });
    });

    return Array.from(featureMap.entries())
      .map(([feature, count]) => ({ label: feature, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [dailyMetrics]);

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    const map = new Map<string, number>();

    dailyMetrics.forEach((d: any) => {
      map.set(d.date, d.filesEdited + d.commandsRun + d.agentInteractions);
    });

    return map;
  }, [dailyMetrics]);

  // Handle export
  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);

    try {
      const data = format === 'json' ? await exportDataAsJson() : await exportDataAsCsv();

      // Create download link
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[AnalyticsDashboard] Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    await clearAllData();
    setShowConfirmDelete(false);
  };

  // If analytics is not enabled, show opt-in screen
  if (!enabled) {
    return (
      <div className={cn('max-w-4xl mx-auto', isMobile ? 'p-4' : 'p-6')}>
        <div className="border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] p-6 text-center">
          <h2 className="text-xl font-bold font-mono text-foreground mb-4">
            {t('analytics.optIn.title')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('analytics.optIn.description')}
          </p>

          <div className="space-y-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{t('analytics.optIn.privacyFirst')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{t('analytics.optIn.localOnly')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{t('analytics.optIn.noTelemetry')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{t('analytics.optIn.dataControl')}</span>
            </div>
          </div>

          <Button
            onClick={() => setEnabled(true)}
            className={cn(
              'rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
              isMobile && 'min-h-[44px] w-full justify-center'
            )}
          >
            {t('analytics.optIn.enable')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-6xl mx-auto', isMobile ? 'p-4' : 'p-6')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className={cn(
          'font-bold font-mono text-foreground',
          isMobile ? 'text-xl' : 'text-3xl'
        )}>
          {t('analytics.title')}
        </h1>

        <div className={cn('flex gap-2', isMobile && 'flex-col')}>
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className={cn(
              'border-2 border-border rounded-none bg-background px-3 py-2 font-mono text-sm',
              isMobile && 'min-h-[44px]'
            )}
          >
            <option value="24h">{t('analytics.timeRange.24h')}</option>
            <option value="7d">{t('analytics.timeRange.7d')}</option>
            <option value="30d">{t('analytics.timeRange.30d')}</option>
            <option value="12m">{t('analytics.timeRange.12m')}</option>
          </select>

          {/* Refresh button */}
          <Button
            onClick={refreshData}
            variant="outline"
            className={cn(
              'rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
              isMobile && 'min-h-[44px]'
            )}
            disabled={isExporting}
          >
            {t('analytics.refresh')}
          </Button>
        </div>
      </div>

      {/* Overview Section */}
      <section className="mb-8">
        <h2 className={cn(
          'font-semibold font-mono mb-4 text-foreground',
          isMobile ? 'text-lg' : 'text-xl'
        )}>
          {t('analytics.overview.title')}
        </h2>

        <div className={cn(
          'grid gap-4',
          isMobile ? 'grid-cols-2' : 'grid-cols-4'
        )}>
          <StatCard
            label={t('analytics.overview.sessions')}
            value={stats.totalSessions}
            unit={t('analytics.units.sessions')}
          />
          <StatCard
            label={t('analytics.overview.duration')}
            value={stats.totalDuration}
            unit={t('analytics.units.minutes')}
          />
          <StatCard
            label={t('analytics.overview.files')}
            value={stats.totalFilesEdited}
            unit={t('analytics.units.files')}
          />
          <StatCard
            label={t('analytics.overview.commands')}
            value={stats.totalCommands}
            unit={t('analytics.units.commands')}
          />
        </div>
      </section>

      {/* Usage Section */}
      <section className="mb-8">
        <h2 className={cn(
          'font-semibold font-mono mb-4 text-foreground',
          isMobile ? 'text-lg' : 'text-xl'
        )}>
          {t('analytics.usage.title')}
        </h2>

        <div className="border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] p-4">
          <h3 className="font-mono text-sm text-muted-foreground mb-4">
            {t('analytics.usage.filesEdited')}
          </h3>
          <LineChart data={filesEditedData} height={200} />

          <h3 className="font-mono text-sm text-muted-foreground mb-4 mt-6">
            {t('analytics.usage.sessionDuration')}
          </h3>
          <LineChart data={sessionDurationData} height={200} />
        </div>
      </section>

      {/* Activity Heatmap */}
      <section className="mb-8">
        <h2 className={cn(
          'font-semibold font-mono mb-4 text-foreground',
          isMobile ? 'text-lg' : 'text-xl'
        )}>
          {t('analytics.activity.title')}
        </h2>

        <div className="border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] p-4">
          <ActivityHeatmap data={heatmapData} />
        </div>
      </section>

      {/* Performance Section */}
      {performanceStats && (
        <section className="mb-8">
          <h2 className={cn(
            'font-semibold font-mono mb-4 text-foreground',
            isMobile ? 'text-lg' : 'text-xl'
          )}>
            {t('analytics.performance.title')}
          </h2>

          <div className={cn(
            'grid gap-4',
            isMobile ? 'grid-cols-1' : 'grid-cols-3'
          )}>
            <StatCard
              label={t('analytics.performance.avgLoadTime')}
              value={Math.round(performanceStats.avgLoadTime)}
              unit={t('analytics.units.ms')}
            />
            <StatCard
              label={t('analytics.performance.avgMemory')}
              value={Math.round(performanceStats.avgMemory / 1024 / 1024)}
              unit={t('analytics.units.mb')}
            />
            <StatCard
              label={t('analytics.performance.cacheHitRate')}
              value={Math.round(performanceStats.avgCacheHitRate)}
              unit={t('analytics.units.percent')}
            />
          </div>
        </section>
      )}

      {/* Features Section */}
      {featureUsageData.length > 0 && (
        <section className="mb-8">
          <h2 className={cn(
            'font-semibold font-mono mb-4 text-foreground',
            isMobile ? 'text-lg' : 'text-xl'
          )}>
            {t('analytics.features.title')}
          </h2>

          <div className="border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] p-4">
            <BarChart data={featureUsageData} height={200} />
          </div>
        </section>
      )}

      {/* Data Management Section */}
      <section className="mb-8">
        <h2 className={cn(
          'font-semibold font-mono mb-4 text-foreground',
          isMobile ? 'text-lg' : 'text-xl'
        )}>
          {t('analytics.dataManagement.title')}
        </h2>

        <div className="border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] p-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t('analytics.dataManagement.description')}
          </p>

          <div className={cn('flex gap-3', isMobile ? 'flex-col' : 'flex-row')}>
            <Button
              onClick={() => handleExport('json')}
              variant="outline"
              className={cn(
                'rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                isMobile && 'min-h-[44px]'
              )}
              disabled={isExporting}
            >
              {t('analytics.dataManagement.exportJson')}
            </Button>

            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              className={cn(
                'rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                isMobile && 'min-h-[44px]'
              )}
              disabled={isExporting}
            >
              {t('analytics.dataManagement.exportCsv')}
            </Button>

            {!showConfirmDelete ? (
              <Button
                onClick={() => setShowConfirmDelete(true)}
                variant="outline"
                className={cn(
                  'rounded-none border-2 border-red-500 text-destructive shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                  isMobile && 'min-h-[44px]'
                )}
                disabled={isExporting}
              >
                {t('analytics.dataManagement.delete')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className={cn(
                    'rounded-none border-2 border-red-500 bg-red-500 text-white shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                    isMobile && 'min-h-[44px]'
                  )}
                >
                  {t('analytics.dataManagement.confirm')}
                </Button>
                <Button
                  onClick={() => setShowConfirmDelete(false)}
                  variant="outline"
                  className={cn(
                    'rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                    isMobile && 'min-h-[44px]'
                  )}
                >
                  {t('analytics.dataManagement.cancel')}
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            {t('analytics.dataManagement.lastUpdated')}:{' '}
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : t('analytics.never')}
          </p>
        </div>
      </section>
    </div>
  );
}
