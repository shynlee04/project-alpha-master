/**
 * PHASE 2 STUB: Chat Plugin
 * 
 * Original code archived to: _phase2-archive/plugins/chat/
 * This stub prevents runtime errors during Phase 1A development.
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

/**
 * Stub Chat Main Component - renders placeholder during Phase 1A
 */
function ChatStubComponent({ width: _width, height: _height }: PluginMainProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center h-full bg-background text-muted-foreground font-mono text-sm p-4"
    >
      <div className="text-center">
        <div className="text-lg mb-2">💬</div>
        <div>Chat Plugin</div>
        <div className="text-xs mt-1 opacity-60">(Phase 2 - Staged)</div>
      </div>
    </div>
  );
}

/**
 * Stub Chat Plugin Definition
 */
export const chatPlugin: FeaturePlugin = {
  id: 'chat',
  name: 'Chat',
  icon: <MessageSquare size={16} />,
  description: 'AI Chat Assistant (Phase 2 - Staged)',
  requirements: {
    storageType: 'any',
    deviceType: 'any',
    minWidth: 300,
    maxInstances: 1,
  },
  MainComponent: ChatStubComponent,
};

export default chatPlugin;
