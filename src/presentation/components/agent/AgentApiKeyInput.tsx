/**
 * AgentApiKeyInput Component
 * API key input with save and test functionality
 * Max 120 lines
 */

import { Key, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { providerService } from '@/application/services/ProviderService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';

interface AgentApiKeyInputProps {
  providerId: string;
  onSave?: () => void;
}

export function AgentApiKeyInput({ providerId, onSave }: AgentApiKeyInputProps) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) return;

    setIsSaving(true);
    try {
      await providerService.setApiKey(providerId, apiKey);
      setApiKey('••••');
      toast.success('API key saved - loading models...');
      onSave?.();
    } catch (error) {
      toast.error('Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  }, [apiKey, providerId, onSave]);

  const handleTest = useCallback(async () => {
    setIsTesting(true);
    setConnectionStatus('idle');

    try {
      const result = await providerService.testConnection(providerId);
      if (result.success) {
        toast.success(`Connection successful! (${result.latencyMs}ms)`);
        setConnectionStatus('success');
      } else {
        toast.error(`Connection failed: ${result.error}`);
        setConnectionStatus('error');
      }
    } catch (error) {
      toast.error('Connection test error');
      setConnectionStatus('error');
    } finally {
      setIsTesting(false);
    }
  }, [providerId]);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Key className="w-4 h-4" />
        API Key
      </Label>

      {apiKey === '••••' ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={isTesting}
            className="rounded-none gap-1"
          >
            {isTesting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : connectionStatus === 'success' ? (
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            ) : connectionStatus === 'error' ? (
              <XCircle className="w-3 h-3 text-destructive" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Test Connection
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setApiKey('')}
            className="rounded-none text-xs"
          >
            Change Key
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key..."
            className="rounded-none flex-1"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="rounded-none gap-1"
            type="button"
          >
            {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
