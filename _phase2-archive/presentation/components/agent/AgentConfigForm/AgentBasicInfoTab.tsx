/**
 * Agent Basic Info Tab Component
 *
 * Handles agent name and role/description input fields.
 *
 * @layer Presentation
 * @component AgentBasicInfoTab
 */

import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'

interface AgentBasicInfoTabProps {
    name: string
    role: string
    onNameChange: (name: string) => void
    onRoleChange: (role: string) => void
    errors?: {
        name?: string
    }
}

/**
 * Agent Basic Info Tab Component
 */
export function AgentBasicInfoTab({
    name,
    role,
    onNameChange,
    onRoleChange,
    errors
}: AgentBasicInfoTabProps) {
    return (
        <div className="grid gap-4">
            {/* Agent Name */}
            <div className="grid gap-2">
                <Label htmlFor="agent-name">
                    Agent Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="agent-name"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Enter agent name..."
                    className="rounded-none"
                />
                {errors?.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                )}
            </div>

            {/* Role/Description */}
            <div className="grid gap-2">
                <Label htmlFor="agent-role">
                    Role
                </Label>
                <Input
                    id="agent-role"
                    value={role}
                    onChange={(e) => onRoleChange(e.target.value)}
                    placeholder="e.g., Frontend Developer"
                    className="rounded-none"
                />
            </div>
        </div>
    )
}
