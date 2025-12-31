/**
 * AgentBasicInfoForm Component
 * Basic agent configuration (name, role, description)
 * Max 120 lines
 */

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AgentBasicInfoFormProps {
  name: string;
  role: string;
  description: string;
  onNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

export function AgentBasicInfoForm({
  name,
  role,
  description,
  onNameChange,
  onRoleChange,
  onDescriptionChange,
  disabled = false
}: AgentBasicInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Basic Information</h3>

      <div className="grid gap-2">
        <Label htmlFor="agentName">
          Agent Name <span className="text-destructive">*</span>
        </Label>
        <input
          id="agentName"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g., Code-Reviewer-V2"
          className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="agentRole">
          Role <span className="text-destructive">*</span>
        </Label>
        <input
          id="agentRole"
          type="text"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g., QA Engineer"
          className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="agentDescription">Description</Label>
        <Textarea
          id="agentDescription"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
          placeholder="What does this agent specialize in?"
          rows={3}
          className="rounded-none resize-none"
        />
      </div>
    </div>
  );
}
