/**
 * Metrics Collector - Usage Data Collection
 *
 * Collects usage metrics for analytics dashboard:
 * - Session duration
 * - Files edited
 * - Commands run
 * - Projects accessed
 * - Agent interactions
 * - Feature usage
 *
 * Privacy-first: All data stored locally in IndexedDB via Dexie.
 * No telemetry or external data transmission.
 *
 * @module lib/analytics/metrics-collector
 * @story S-034 Analytics Dashboard and Metrics
 */

import { db } from '@/infrastructure/persistence/dexie-db';

export interface MetricsEvent {
  id?: number;
  timestamp: number;
  type: EventType;
  data: Record<string, unknown>;
}

export type EventType =
  | 'session_start'
  | 'session_end'
  | 'file_opened'
  | 'file_edited'
  | 'file_saved'
  | 'command_run'
  | 'project_accessed'
  | 'agent_interaction'
  | 'feature_used'
  | 'error_occurred';

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  filesEdited: number;
  commandsRun: number;
  agentInteractions: number;
  projectsAccessed: string[];
}

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  sessions: number;
  totalDuration: number;
  filesEdited: number;
  commandsRun: number;
  agentInteractions: number;
  uniqueProjects: number;
  featuresUsed: Record<string, number>;
}

class MetricsCollector {
  private currentSession: SessionMetrics | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize metrics collection
   */
  async initialize(): Promise<void> {
    // Ensure analytics table exists
    const tables = await db.tables();
    const analyticsTableExists = tables.some((t: { name: string }) => t.name === 'analytics');

    if (!analyticsTableExists) {
      await db.version(1).stores({
        analytics: '++id, timestamp, type',
      });
    }

    // Start new session
    this.startSession();

    // Setup cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });

      // Track visibility changes for accurate duration
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseSession();
        } else {
          this.resumeSession();
        }
      });
    }
  }

  /**
   * Start a new session
   */
  private startSession(): void {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      filesEdited: 0,
      commandsRun: 0,
      agentInteractions: 0,
      projectsAccessed: [],
    };

    this.trackEvent('session_start', { sessionId });

    // Session timeout after 30 minutes of inactivity
    this.resetSessionTimer();
  }

  /**
   * Reset the session timeout timer
   */
  private resetSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(() => {
      this.endSession();
      this.startSession();
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Pause session (when tab is hidden)
   */
  private pauseSession(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Resume session (when tab becomes visible)
   */
  private resumeSession(): void {
    this.resetSessionTimer();
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    const endTime = Date.now();
    const duration = endTime - this.currentSession.startTime;

    this.trackEvent('session_end', {
      sessionId: this.currentSession.sessionId,
      duration,
      filesEdited: this.currentSession.filesEdited,
      commandsRun: this.currentSession.commandsRun,
      agentInteractions: this.currentSession.agentInteractions,
      projectsAccessed: this.currentSession.projectsAccessed,
    });

    this.currentSession = null;

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Track an analytics event
   */
  async trackEvent(type: EventType, data: Record<string, unknown>): Promise<void> {
    const event: MetricsEvent = {
      timestamp: Date.now(),
      type,
      data,
    };

    try {
      await db.table('analytics').add(event);

      // Update current session metrics
      if (this.currentSession) {
        this.updateSessionMetrics(type, data);
        this.resetSessionTimer();
      }
    } catch (error) {
      console.error('[MetricsCollector] Failed to track event:', error);
    }
  }

  /**
   * Update current session metrics based on event type
   */
  private updateSessionMetrics(type: EventType, data: Record<string, unknown>): void {
    if (!this.currentSession) return;

    switch (type) {
      case 'file_edited':
      case 'file_saved':
        this.currentSession.filesEdited++;
        break;
      case 'command_run':
        this.currentSession.commandsRun++;
        break;
      case 'agent_interaction':
        this.currentSession.agentInteractions++;
        break;
      case 'project_accessed':
        const projectId = data.projectId as string;
        if (projectId && !this.currentSession.projectsAccessed.includes(projectId)) {
          this.currentSession.projectsAccessed.push(projectId);
        }
        break;
    }
  }

  /**
   * Get events within a time range
   */
  async getEvents(startTime: number, endTime: number): Promise<MetricsEvent[]> {
    try {
      return await db.table('analytics')
        .where('timestamp')
        .between(startTime, endTime)
        .toArray();
    } catch (error) {
      console.error('[MetricsCollector] Failed to get events:', error);
      return [];
    }
  }

  /**
   * Get aggregated daily metrics
   */
  async getDailyMetrics(startDate: Date, endDate: Date): Promise<DailyMetrics[]> {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    const events = await this.getEvents(startTime, endTime);

    // Group events by date
    const dailyMap = new Map<string, DailyMetrics>();

    for (const event of events) {
      const date = new Date(event.timestamp);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          sessions: 0,
          totalDuration: 0,
          filesEdited: 0,
          commandsRun: 0,
          agentInteractions: 0,
          uniqueProjects: 0,
          featuresUsed: {},
        });
      }

      const metrics = dailyMap.get(dateKey)!;

      switch (event.type) {
        case 'session_start':
          metrics.sessions++;
          break;
        case 'session_end':
          metrics.totalDuration += (event.data.duration as number) || 0;
          break;
        case 'file_edited':
        case 'file_saved':
          metrics.filesEdited++;
          break;
        case 'command_run':
          metrics.commandsRun++;
          break;
        case 'agent_interaction':
          metrics.agentInteractions++;
          break;
        case 'feature_used':
          const feature = event.data.feature as string;
          if (feature) {
            metrics.featuresUsed[feature] = (metrics.featuresUsed[feature] || 0) + 1;
          }
          break;
        case 'project_accessed':
          // Count unique projects per day
          const projectId = event.data.projectId as string;
          if (projectId) {
            metrics.uniqueProjects++;
          }
          break;
      }
    }

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Delete all analytics data
   */
  async clearAllData(): Promise<void> {
    try {
      await db.table('analytics').clear();
      console.log('[MetricsCollector] All analytics data cleared');
    } catch (error) {
      console.error('[MetricsCollector] Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Export analytics data as JSON
   */
  async exportDataAsJson(startDate?: Date, endDate?: Date): Promise<string> {
    const startTime = startDate ? startDate.getTime() : 0;
    const endTime = endDate ? endDate.getTime() : Date.now();

    const events = await this.getEvents(startTime, endTime);
    return JSON.stringify(events, null, 2);
  }

  /**
   * Export analytics data as CSV
   */
  async exportDataAsCsv(startDate?: Date, endDate?: Date): Promise<string> {
    const startTime = startDate ? startDate.getTime() : 0;
    const endTime = endDate ? endDate.getTime() : Date.now();

    const events = await this.getEvents(startTime, endTime);

    // CSV header
    let csv = 'id,timestamp,type,data\n';

    // CSV rows
    for (const event of events) {
      const dataStr = JSON.stringify(event.data).replace(/"/g, '""');
      csv += `${event.id || ''},${event.timestamp},${event.type},"${dataStr}"\n`;
    }

    return csv;
  }

  /**
   * Get current session info
   */
  getCurrentSession(): SessionMetrics | null {
    return this.currentSession;
  }
}

// Singleton instance
let collectorInstance: MetricsCollector | null = null;

export function getMetricsCollector(): MetricsCollector {
  if (!collectorInstance) {
    collectorInstance = new MetricsCollector();
  }
  return collectorInstance;
}

// Convenience functions for tracking common events
export function trackFileOpened(filePath: string, projectId: string): void {
  getMetricsCollector().trackEvent('file_opened', { filePath, projectId });
}

export function trackFileEdited(filePath: string, projectId: string): void {
  getMetricsCollector().trackEvent('file_edited', { filePath, projectId });
}

export function trackFileSaved(filePath: string, projectId: string): void {
  getMetricsCollector().trackEvent('file_saved', { filePath, projectId });
}

export function trackCommandRun(command: string, args?: Record<string, unknown>): void {
  getMetricsCollector().trackEvent('command_run', { command, args });
}

export function trackProjectAccessed(projectId: string, projectName: string): void {
  getMetricsCollector().trackEvent('project_accessed', { projectId, projectName });
}

export function trackAgentInteraction(agentId: string, action: string): void {
  getMetricsCollector().trackEvent('agent_interaction', { agentId, action });
}

export function trackFeatureUsed(feature: string, details?: Record<string, unknown>): void {
  getMetricsCollector().trackEvent('feature_used', { feature, details });
}

export function trackError(error: Error, context?: string): void {
  getMetricsCollector().trackEvent('error_occurred', {
    message: error.message,
    stack: error.stack,
    context,
  });
}
