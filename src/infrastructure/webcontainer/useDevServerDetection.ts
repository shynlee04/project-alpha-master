/**
 * @fileoverview Dev Server Detection Hook
 * @module infrastructure/webcontainer/useDevServerDetection
 *
 * **EPIC-0.6-08**: Dev-Server-Ready Events
 *
 * Detects dev server URLs from terminal output.
 * Emits dev-server-ready events for Preview plugin.
 * Supports Vite, Next.js, CRA, and Webpack output formats.
 *
 * Features:
 * - Parse terminal output for dev server URLs
 * - Detect port and framework type
 * - Emit window events for Preview plugin
 * - Register dev servers in process registry
 *
 * @epic EPIC-0.6
 * @story 0.6-08
 * @team Team B
 * @created 2026-01-27
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueuePreviewUrl } from '@/infrastructure/persistence/stores/plugin-coordination-store';

/**
 * Dev server patterns
 * Matches common dev server output formats:
 * - Vite: "Local: http://localhost:5173/"
 * - Next.js: "ready in 1234ms - Local: http://localhost:3000"
 * - CRA: "Local: http://localhost:3000"
 * - Webpack: "Compiled successfully! Server running at http://localhost:8080"
 */
const DEV_SERVER_PATTERNS = [
  // Vite
  /Local:\s+(https?:\/\/localhost:\d+\/?)/i,

  // Next.js
  /ready\s+in\s+\d+ms.*?Local:\s+(https?:\/\/localhost:\d+\/?)/i,

  // Create React App
  /Local:\s+(https?:\/\/localhost:\d+\/?)/i,

  // Webpack
  /Server\s+running\s+at\s+(https?:\/\/localhost:\d+\/?)/i,

  // General patterns
  /listening\s+(?:on\s+)?(?:https?:\/\/)?localhost:(\d+)/i,
  /http:\/\/localhost:(\d+)/i,
];

/**
 * Framework type
 */
export type FrameworkType = 'vite' | 'next' | 'cra' | 'webpack' | 'unknown';

/**
 * Dev server detected info
 */
export interface DevServerDetected {
  /** Full URL */
  url: string;

  /** Port number */
  port: number;

  /** Framework type */
  framework: FrameworkType;

  /** Raw output line */
  rawOutput: string;
}

/**
 * Dev server ready event detail
 */
export interface DevServerReadyDetail {
  url: string;
  port: number;
  framework: FrameworkType;
  processId?: string;
}

/**
 * Detect framework from output
 *
 * @param output - Terminal output line
 * @returns Framework type
 */
function detectFramework(output: string): FrameworkType {
  const lowerOutput = output.toLowerCase();

  if (lowerOutput.includes('vite')) {
    return 'vite';
  }

  if (lowerOutput.includes('next') || lowerOutput.includes('- ready')) {
    return 'next';
  }

  if (lowerOutput.includes('react app') || lowerOutput.includes('cra')) {
    return 'cra';
  }

  if (lowerOutput.includes('webpack') || lowerOutput.includes('compiled')) {
    return 'webpack';
  }

  return 'unknown';
}

/**
 * Parse dev server URL from output
 *
 * @param output - Terminal output line
 * @returns Dev server info or null
 */
function parseDevServerURL(output: string): DevServerDetected | null {
  for (const pattern of DEV_SERVER_PATTERNS) {
    const match = output.match(pattern);

    if (match) {
      // Extract URL (might be in different capture groups)
      const url = match.find((m) => m?.startsWith('http')) || match[1];

      if (!url) {
        continue;
      }

      // Extract port from URL
      const portMatch = url.match(/:(\d+)/);
      const port = portMatch ? parseInt(portMatch[1], 10) : 3000;

      // Detect framework
      const framework = detectFramework(output);

      return {
        url,
        port,
        framework,
        rawOutput: output,
      };
    }
  }

  return null;
}

/**
 * useDevServerDetection hook options
 */
interface UseDevServerDetectionOptions {
  /** Terminal output to monitor */
  output?: string;

  /** Optional process ID to associate with server */
  processId?: string;

  /** Whether detection is enabled */
  enabled?: boolean;
}

/**
 * useDevServerDetection hook
 *
 * Monitors terminal output for dev server URLs.
 * Emits dev-server-ready events when detected.
 *
 * @param options - Hook options
 *
 * @example
 * ```tsx
 * function TerminalComponent() {
 *   const [output, setOutput] = useState('');
 *   const { lastDetected } = useDevServerDetection({
 *     output,
 *     processId: currentProcessId,
 *     enabled: true,
 *   });
 *
 *   return (
 *     <div>
 *       <Terminal onOutput={setOutput} />
 *       {lastDetected && (
 *         <div>Server at: {lastDetected.url}</div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDevServerDetection(options: UseDevServerDetectionOptions = {}) {
  const { output, processId, enabled = true } = options;

  // EPIC-0.6-09: Get queue function to defer URLs for Preview
  const queuePreviewUrl = useQueuePreviewUrl();

  // Track last detected server (to avoid duplicate events)
  const lastDetectedRef = useRef<DevServerDetected | null>(null);

  /**
   * Handle dev server detection
   */
  const handleDetection = useCallback(
    (detected: DevServerDetected) => {
      // Avoid duplicate events for same server
      if (
        lastDetectedRef.current?.url === detected.url &&
        lastDetectedRef.current?.port === detected.port
      ) {
        return;
      }

      console.log(
        `[DevServerDetection] Detected: ${detected.url} (${detected.framework})`
      );

      // Emit window event for Preview plugin
      const event = new CustomEvent<DevServerReadyDetail>('dev-server-ready', {
        detail: {
          url: detected.url,
          port: detected.port,
          framework: detected.framework,
          processId,
        },
      });

      window.dispatchEvent(event);

      // EPIC-0.6-09: Queue URL for Preview plugin when it's offline
      // This ensures Preview can still get the URL even if it's toggled OFF
      // when the dev server starts
      queuePreviewUrl(detected.url);

      // Update last detected
      lastDetectedRef.current = detected;
    },
    [processId, queuePreviewUrl]
  );

  /**
   * Process output for dev server patterns
   */
  useEffect(() => {
    if (!enabled || !output) {
      return;
    }

    // Check each line for dev server pattern
    const lines = output.split('\n');

    for (const line of lines) {
      const detected = parseDevServerURL(line);

      if (detected) {
        handleDetection(detected);
        break; // Only emit first match
      }
    }
  }, [output, enabled, handleDetection]);

  return {
    lastDetected: lastDetectedRef.current,
  };
}

/**
 * Helper: Register dev server in process registry
 *
 * This should be called when dev server is detected.
 * Integrates with Story 0.6-07 process registry.
 *
 * @param detected - Dev server detected info
 * @param processId - Process ID from registry
 */
export function registerDevServerInRegistry(
  detected: DevServerDetected,
  processId: string
): void {
  // This is a placeholder for integration with process registry
  // In production, would import useProcessRegistry and call registerDevServer
  console.log(
    `[DevServerDetection] Would register in registry:`,
    detected.url,
    'for process',
    processId
  );
}
