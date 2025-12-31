/**
 * AgentProviderSelector Component
 * Provider dropdown for agent configuration
 * Max 120 lines
 */

import { useProviderStore } from '@/lib/state/provider-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot } from 'lucide-react';

interface AgentProviderSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AgentProviderSelector({ value, onChange, disabled }: AgentProviderSelectorProps) {
  const { providers } = useProviderStore();

  return (
    <div className="grid gap-2">
      <label>LLM Provider <span className="text-destructive">*</span></label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="rounded-none">
          <SelectValue placeholder="Select provider..." />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {providers.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span>{p.name}</span>
                {p.id === 'openrouter' && (
                  <span className="ml-2 text-xs text-success">
                    (Free models available)
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
