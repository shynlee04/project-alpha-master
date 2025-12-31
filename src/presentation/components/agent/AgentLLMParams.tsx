/**
 * AgentLLMParams Component
 * LLM parameters (temperature, tokens, etc.)
 * Max 120 lines
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AgentLLMParamsProps {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onTopPChange: (value: number) => void;
  onTopKChange?: (value: number) => void;
}

export function AgentLLMParams({
  temperature,
  maxTokens,
  topP,
  topK,
  onTemperatureChange,
  onMaxTokensChange,
  onTopPChange,
  onTopKChange
}: AgentLLMParamsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">LLM Parameters</h3>

      <div className="grid gap-2">
        <Label htmlFor="temperature">Temperature (0.0 - 2.0)</Label>
        <Input
          id="temperature"
          type="number"
          step="0.1"
          min="0"
          max="2"
          value={temperature}
          onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
          className="rounded-none"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input
          id="maxTokens"
          type="number"
          min="1"
          max="128000"
          value={maxTokens}
          onChange={(e) => onMaxTokensChange(parseInt(e.target.value))}
          className="rounded-none"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="topP">Top-P (0.0 - 1.0)</Label>
        <Input
          id="topP"
          type="number"
          step="0.05"
          min="0"
          max="1"
          value={topP}
          onChange={(e) => onTopPChange(parseFloat(e.target.value))}
          className="rounded-none"
        />
      </div>

      {topK !== undefined && (
        <div className="grid gap-2">
          <Label htmlFor="topK">Top-K</Label>
          <Input
            id="topK"
            type="number"
            min="1"
            value={topK}
            onChange={(e) => onTopKChange(parseInt(e.target.value))}
            className="rounded-none"
          />
        </div>
      )}
    </div>
  );
}
