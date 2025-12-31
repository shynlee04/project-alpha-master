/**
 * ApiKeyStatus Component
 * API key status display with error messaging
 * Max 120 lines
 */

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { TruncatedText } from '@/components/ui/truncated-text';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

interface ApiKeyStatusProps {
  providerId: string;
  onApiKeyChange: (apiKey: string | null) => void;
  onErrorChange: (error: string | null) => void;
}

export function ApiKeyStatus({ providerId, onApiKeyChange, onErrorChange }: ApiKeyStatusProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchApiKey() {
      try {
        await credentialVault.initialize();
        let key = await credentialVault.getCredentials(providerId);

        if (!isCancelled) {
          setApiKey(key);
          onApiKeyChange(key);

          if (!key) {
            const error = `No API key for ${providerId}. Click the settings icon on the agent in the Agents panel to configure it.`;
            setApiKeyError(error);
            onErrorChange(error);
          } else {
            setApiKeyError(null);
            onErrorChange(null);
          }
        }
      } catch (err) {
        console.error('[ApiKeyStatus] Failed to fetch API key:', err);
        if (!isCancelled) {
          const error = 'Failed to fetch API key';
          setApiKeyError(error);
          onErrorChange(error);
          onApiKeyChange(null);
        }
      }
    }

    fetchApiKey();

    // Listen for credential updates from AgentConfigDialog
    const handleCredentialsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.providerId === providerId) {
        fetchApiKey();
      }
    };

    window.addEventListener('credentials-updated', handleCredentialsUpdate);

    return () => {
      isCancelled = true;
      window.removeEventListener('credentials-updated', handleCredentialsUpdate);
    };
  }, [providerId, onApiKeyChange, onErrorChange]);

  if (!apiKeyError) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-none mx-2 mt-2">
      <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
      <TruncatedText
        text={apiKeyError}
        className="text-xs text-yellow-500 font-medium"
      />
    </div>
  );
}
