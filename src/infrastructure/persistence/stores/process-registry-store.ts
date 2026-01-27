/**
 * @fileoverview Process Registry Store
 * @module infrastructure/persistence/stores/process-registry-store
 *
 * **EPIC-0.6-07**: Process Registry for Terminal
 *
 * Central registry for tracking running processes in WebContainer.
 * Maps process IDs to commands, ports, and status.
 * Integrates with dev-server detection (Story 0.6-08).
 *
 * Features:
 * - Track running processes with PIDs
 * - Register dev servers with ports/URLs
 * - Update process status (running, stopped, error)
 * - Query processes by port
 * - Cleanup on process exit
 *
 * @epic EPIC-0.6
 * @story 0.6-07
 * @team Team B
 * @created 2026-01-27
 */

import { create } from 'zustand';

/**
 * Process status
 */
export type ProcessStatus = 'running' | 'stopped' | 'error';

/**
 * Process info
 */
export interface ProcessInfo {
  /** Unique process ID */
  id: string;

  /** Command being executed */
  command: string;

  /** Process ID from WebContainer */
  pid: number;

  /** Current status */
  status: ProcessStatus;

  /** Exit code (if stopped) */
  exitCode?: number;

  /** Ports this process is listening on */
  ports: number[];

  /** Timestamp when process started */
  startedAt: number;

  /** Timestamp when process stopped (if applicable) */
  stoppedAt?: number;

  /** Error message (if error status) */
  error?: string;
}

/**
 * Dev server info
 */
export interface DevServerInfo {
  /** Unique server ID */
  id: string;

  /** Port number */
  port: number;

  /** Full URL */
  url: string;

  /** Process ID (references ProcessInfo.id) */
  processId: string;

  /** Framework type */
  framework: 'vite' | 'next' | 'cra' | 'webpack' | 'unknown';

  /** Timestamp when server started */
  startedAt: number;
}

/**
 * Process registry state
 */
interface ProcessRegistryState {
  /** Map of process ID to process info */
  processes: Map<string, ProcessInfo>;

  /** List of active dev servers */
  devServers: DevServerInfo[];

  /**
   * Register a new process
   */
  registerProcess: (info: Omit<ProcessInfo, 'id'>) => string;

  /**
   * Update process status
   */
  updateProcessStatus: (id: string, status: ProcessStatus, exitCode?: number, error?: string) => void;

  /**
   * Add port to process
   */
  addProcessPort: (id: string, port: number) => void;

  /**
   * Remove process from registry
   */
  removeProcess: (id: string) => void;

  /**
   * Get process by ID
   */
  getProcess: (id: string) => ProcessInfo | undefined;

  /**
   * Get process by port
   */
  getProcessByPort: (port: number) => ProcessInfo | undefined;

  /**
   * Register dev server
   */
  registerDevServer: (info: Omit<DevServerInfo, 'id'>) => string;

  /**
   * Remove dev server
   */
  removeDevServer: (id: string) => void;

  /**
   * Get dev server by port
   */
  getDevServerByPort: (port: number) => DevServerInfo | undefined;

  /**
   * Get all running processes
   */
  getRunningProcesses: () => ProcessInfo[];

  /**
   * Cleanup all processes
   */
  cleanup: () => void;
}

/**
 * Process registry store
 *
 * Singleton store for tracking all WebContainer processes.
 */
export const useProcessRegistry = create<ProcessRegistryState>((set, get) => ({
  processes: new Map(),
  devServers: [],

  /**
   * Register a new process
   *
   * @param info - Process info without ID
   * @returns Process ID (generated UUID)
   */
  registerProcess: (info) => {
    const id = crypto.randomUUID();
    const process: ProcessInfo = { ...info, id };

    set((state) => ({
      processes: new Map(state.processes).set(id, process),
    }));

    console.log(`[ProcessRegistry] Registered process: ${id} (${process.command})`);
    return id;
  },

  /**
   * Update process status
   *
   * @param id - Process ID
   * @param status - New status
   * @param exitCode - Exit code (if stopped)
   * @param error - Error message (if error)
   */
  updateProcessStatus: (id, status, exitCode, error) => {
    set((state) => {
      const processes = new Map(state.processes);
      const process = processes.get(id);

      if (!process) {
        console.warn(`[ProcessRegistry] Process not found: ${id}`);
        return { processes };
      }

      const updated: ProcessInfo = {
        ...process,
        status,
        ...(exitCode !== undefined && { exitCode }),
        ...(error !== undefined && { error }),
        ...(status === 'stopped' && { stoppedAt: Date.now() }),
      };

      processes.set(id, updated);
      console.log(`[ProcessRegistry] Updated process: ${id} -> ${status}`);

      return { processes };
    });
  },

  /**
   * Add port to process
   *
   * @param id - Process ID
   * @param port - Port number to add
   */
  addProcessPort: (id, port) => {
    set((state) => {
      const processes = new Map(state.processes);
      const process = processes.get(id);

      if (!process) {
        console.warn(`[ProcessRegistry] Process not found: ${id}`);
        return { processes };
      }

      if (!process.ports.includes(port)) {
        process.ports.push(port);
        console.log(`[ProcessRegistry] Added port ${port} to process ${id}`);
      }

      return { processes };
    });
  },

  /**
   * Remove process from registry
   *
   * @param id - Process ID
   */
  removeProcess: (id) => {
    set((state) => {
      const processes = new Map(state.processes);
      const removed = processes.delete(id);

      if (removed) {
        console.log(`[ProcessRegistry] Removed process: ${id}`);
      }

      return { processes };
    });
  },

  /**
   * Get process by ID
   *
   * @param id - Process ID
   * @returns Process info or undefined
   */
  getProcess: (id) => {
    return get().processes.get(id);
  },

  /**
   * Get process by port
   *
   * @param port - Port number
   * @returns Process info or undefined
   */
  getProcessByPort: (port) => {
    for (const process of get().processes.values()) {
      if (process.ports.includes(port)) {
        return process;
      }
    }
    return undefined;
  },

  /**
   * Register dev server
   *
   * @param info - Dev server info without ID
   * @returns Server ID (generated UUID)
   */
  registerDevServer: (info) => {
    const id = crypto.randomUUID();
    const server: DevServerInfo = { ...info, id };

    set((state) => ({
      devServers: [...state.devServers, server],
    }));

    console.log(`[ProcessRegistry] Registered dev server: ${id} (${server.url})`);
    return id;
  },

  /**
   * Remove dev server
   *
   * @param id - Server ID
   */
  removeDevServer: (id) => {
    set((state) => ({
      devServers: state.devServers.filter((s) => s.id !== id),
    }));

    console.log(`[ProcessRegistry] Removed dev server: ${id}`);
  },

  /**
   * Get dev server by port
   *
   * @param port - Port number
   * @returns Dev server info or undefined
   */
  getDevServerByPort: (port) => {
    return get().devServers.find((s) => s.port === port);
  },

  /**
   * Get all running processes
   *
   * @returns Array of running processes
   */
  getRunningProcesses: () => {
    return Array.from(get().processes.values()).filter((p) => p.status === 'running');
  },

  /**
   * Cleanup all processes
   */
  cleanup: () => {
    set(() => {
      console.log(`[ProcessRegistry] Cleanup: removing ${get().processes.size} processes`);
      return {
        processes: new Map(),
        devServers: [],
      };
    });
  },
}));
