/**
 * Chat Plugin - AI Chat Assistant
 * 
 * Wires ChatPanel component to the plugin system.
 * Chat is now fully functional in Phase 1.
 * 
 * @module plugins/chat
 * @created 2026-01-29
 * @updated 2026-02-01 - Wired real ChatPanel (gap closure 01-06)
 */

import { MessageSquare } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';
import { ChatPanel } from './components/ChatPanel';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';

/**
 * ChatPluginMain - Adapts PluginMainProps to ChatPanel requirements
 * 
 * ChatPanel requires projectId, which we get from ProjectStore.
 */
function ChatPluginMain({ width, height }: PluginMainProps) {
  const activeProjectId = useProjectStore(
    useShallow((state) => state.activeProjectId)
  );

  return (
    <div style={{ width, height }} className="h-full overflow-hidden">
      <ChatPanel projectId={activeProjectId} className="h-full" />
    </div>
  );
}

/**
 * Chat Plugin Definition
 */
export const chatPlugin: FeaturePlugin = {
  id: 'chat',
  name: 'Chat',
  icon: <MessageSquare size={16} />,
  description: 'AI Chat Assistant',
  requirements: {
    storageType: 'any',
    deviceType: 'any',
    minWidth: 300,
    maxInstances: 1,
  },
  MainComponent: ChatPluginMain,
};

export default chatPlugin;
