/**
 * Definition Tooltip Component
 * @module components/editor/DefinitionTooltip
 *
 * Shows definition preview tooltip for go-to-definition
 * Displays symbol location, type, and code preview
 *
 * S-043: Code Navigation
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { DefinitionLocation, DefinitionResult } from '@/lib/navigation/definition-provider';

export interface DefinitionTooltipProps {
  /** Definition result to display */
  definition: DefinitionResult;
  /** Whether tooltip is visible */
  visible: boolean;
  /** Tooltip position (x, y) */
  position?: { x: number; y: number };
  /** Callback to navigate to definition */
  onNavigate?: (definition: DefinitionLocation) => void;
  /** Callback to find references */
  onFindReferences?: (definition: DefinitionLocation) => void;
  /** Number of context lines to show */
  contextLines?: number;
  /** Definition preview content */
  previewContent?: string;
}

/**
 * Definition tooltip component
 */
export function DefinitionTooltip({
  definition,
  visible,
  position,
  onNavigate,
  onFindReferences,
  contextLines: _contextLines = 3,
  previewContent,
}: DefinitionTooltipProps): React.JSX.Element {
  const { t } = useTranslation();

  if (!visible || definition.definitions.length === 0) {
    return <></>;
  }

  const primaryDefinition = definition.definitions[0];

  const content = useMemo(() => {
    return (
      <div
        className="definition-tooltip"
        style={{
          position: 'absolute',
          left: position?.x ?? 0,
          top: position?.y ?? 0,
          zIndex: 1000,
          minWidth: '300px',
          maxWidth: '600px',
        }}
      >
        {/* Tooltip header */}
        <div className="bg-slate-800 text-slate-100 px-3 py-2 rounded-t border-b border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Symbol icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-300"
              >
                {/* Simple icon based on kind */}
                {getSymbolIconForKind(primaryDefinition.kind)}
              </svg>

              {/* Symbol name */}
              <span className="font-mono text-sm font-semibold">
                {primaryDefinition.name}
              </span>
            </div>

            {/* Symbol kind badge */}
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">
              {primaryDefinition.kind}
            </span>
          </div>
        </div>

        {/* Tooltip body */}
        <div className="bg-slate-900 text-slate-100 px-3 py-2">
          {/* Definition location */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span className="text-slate-400 font-mono">
                {getShortFilePath(primaryDefinition.filePath)}
              </span>
            </div>

            <span className="text-slate-500 font-mono">
              Ln {primaryDefinition.line}, Col {primaryDefinition.column}
            </span>
          </div>

          {/* Definition type badges */}
          <div className="flex items-center gap-2 mb-2">
            {definition.isLocal && (
              <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">
                Local
              </span>
            )}
            {definition.isBuiltIn && (
              <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">
                Built-in
              </span>
            )}
            {definition.isThirdParty && (
              <span className="text-xs bg-orange-900 text-orange-300 px-2 py-0.5 rounded">
                Third-party
              </span>
            )}
          </div>

          {/* Preview content */}
          {previewContent && (
            <div className="mt-2">
              <div className="text-xs text-slate-500 mb-1">Preview:</div>
              <pre className="bg-slate-950 text-slate-300 p-2 rounded text-xs overflow-x-auto font-mono">
                {previewContent}
              </pre>
            </div>
          )}

          {/* Multiple definitions warning */}
          {definition.definitions.length > 1 && (
            <div className="mt-2 text-xs text-slate-400">
              +{definition.definitions.length - 1} more definitions
            </div>
          )}
        </div>

        {/* Tooltip footer with actions */}
        <div className="bg-slate-800 text-slate-100 px-3 py-2 rounded-b border-t border-slate-700 flex gap-2">
          {/* Go to definition button */}
          {onNavigate && !definition.isBuiltIn && !definition.isThirdParty && (
            <button
              type="button"
              onClick={() => onNavigate(primaryDefinition)}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Go to Definition (F12)
            </button>
          )}

          {/* Find references button */}
          {onFindReferences && (
            <button
              type="button"
              onClick={() => onFindReferences(primaryDefinition)}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Find References (Shift+F12)
            </button>
          )}
        </div>
      </div>
    );
  }, [definition, position, previewContent, onNavigate, onFindReferences, t]);

  return content;
}

/**
 * Get short file path for display
 */
function getShortFilePath(filePath: string): string {
  // Get filename and maybe parent directory
  const parts = filePath.split('/');
  if (parts.length <= 2) {
    return filePath;
  }
  return '.../' + parts.slice(-2).join('/');
}

/**
 * Get SVG path for symbol kind icon
 */
function getSymbolIconForKind(kind: string): React.JSX.Element {
  // Simplified icons - in production would use lucide-react or similar
  switch (kind) {
    case 'function':
    case 'method':
      return <polyline points="4 17 10 11 4 5" />;
    case 'class':
    case 'interface':
      return <rect x="3" y="3" width="18" height="18" rx="2" />;
    case 'type':
      return <path d="M4 7V4h16v3" />;
    case 'variable':
    case 'constant':
      return <circle cx="12" cy="12" r="10" />;
    case 'enum':
      return <line x1="8" y1="6" x2="21" y2="6" />;
    default:
      return <circle cx="12" cy="12" r="10" />;
  }
}

export default DefinitionTooltip;
