/**
 * Base URL Input Component
 *
 * Handles base URL input for OpenAI-compatible providers.
 *
 * @layer Presentation
 * @component BaseUrlInput
 */

import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'

interface BaseUrlInputProps {
    value: string
    onChange: (url: string) => void
    error?: string
}

/**
 * Base URL Input Component
 */
export function BaseUrlInput({ value, onChange, error }: BaseUrlInputProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor="custom-base-url">
                Base URL <span className="text-destructive">*</span>
            </Label>
            <Input
                id="custom-base-url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="http://localhost:1234/v1"
                className="rounded-none"
            />
            <p className="text-xs text-muted-foreground">
                The API endpoint URL (e.g., http://localhost:1234/v1 for LM Studio)
            </p>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}
