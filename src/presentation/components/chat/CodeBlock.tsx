/**
 * PHASE 2 STUB: Code Block Component
 * Original code archived to: _phase2-archive/presentation/components/chat/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import * as React from 'react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps): React.ReactElement {
  console.log('[Phase 2] CodeBlock disabled during Phase 1A');
  return React.createElement('pre', { 
    className: `bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto ${className ?? ''}`
  }, 
    React.createElement('code', { className: `language-${language ?? 'text'}` }, code)
  );
}

export default CodeBlock;
