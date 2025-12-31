/**
 * AgentSelector Utilities
 * Helper functions for agent status and display
 * Max 120 lines
 */

import type { Agent } from '@/mocks/agents';

/**
 * Get status color class
 */
export function getStatusColor(status: Agent['status']): string {
  switch (status) {
    case 'online':
      return 'bg-green-500 shadow-colored-success';
    case 'busy':
      return 'bg-yellow-500 shadow-colored-warning';
    case 'offline':
      return 'bg-slate-500';
    case 'error':
      return 'bg-red-500 shadow-colored-error';
    default:
      return 'bg-slate-500';
  }
}

/**
 * Get status text
 */
export function getStatusText(status: Agent['status']): string {
  const statusMap: Record<Agent['status'], string> = {
    online: 'ONLINE',
    busy: 'BUSY',
    offline: 'OFFLINE',
    error: 'ERROR',
  };
  return statusMap[status] || 'UNKNOWN';
}

/**
 * Get status badge classes
 */
export function getStatusBadgeClasses(status: Agent['status']): string {
  const baseClasses = 'text-[9px] px-1.5 py-0.5 rounded-sm font-bold';

  switch (status) {
    case 'online':
      return `${baseClasses} bg-green-900/50 text-green-400`;
    case 'busy':
      return `${baseClasses} bg-yellow-900/50 text-yellow-400`;
    case 'offline':
      return `${baseClasses} bg-slate-700 text-slate-400`;
    case 'error':
      return `${baseClasses} bg-red-900/50 text-red-400`;
    default:
      return `${baseClasses} bg-slate-700 text-slate-400`;
  }
}

/**
 * Sort agents: online first, then by name
 */
export function sortAgents(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => {
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (b.status === 'online' && a.status !== 'online') return 1;
    return a.name.localeCompare(b.name);
  });
}
