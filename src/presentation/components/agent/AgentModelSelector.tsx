/**
 * AgentModelSelector Component
 * Model dropdown with refresh functionality
 * Max 120 lines
 */

import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AgentModelSelectorProps {
  providerId: string;
  value: string;
  onChange: (value: string) => void;
  models: Array<{ id: string; name: string; isFree?: boolean }>;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function AgentModelSelector({
  providerId,
  value,
  onChange,
  models,
  isLoading,
  onRefresh
}: AgentModelSelectorProps) {

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>Model <span className="text-destructive">*</span></Label>
        <Button
          variant="ghost"
          iconOnly
          className="h-6 w-6"
          onClick={async (e) => {
            e.preventDefault();
            await onRefresh();
          }}
          disabled={isLoading}
          title="Refresh models"
        >
          <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
        </Button>
      </div>

      <Select
        value={value}
        onValueChange={onChange}
        disabled={!providerId || isLoading}
      >
        <SelectTrigger className="rounded-none">
          <SelectValue placeholder={
            isLoading
              ? 'Loading models...'
              : 'Select model...'
          } />
        </SelectTrigger>
        <SelectContent className="rounded-none max-h-60">
          {models.length === 0 ? (
            <SelectItem value="none" disabled>No models found</SelectItem>
          ) : (
            models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
                {m.isFree && (
                  <span className="ml-2 text-xs text-success">(Free)</span>
                )}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading models...
        </div>
      )}
    </div>
  );
}
