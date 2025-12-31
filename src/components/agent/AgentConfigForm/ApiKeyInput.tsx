/**
 * API Key Input Component
 *
 * Handles API key password input and save button.
 *
 * @layer Presentation
 * @component ApiKeyInput
 */

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ApiKeyInputProps {
    value: string
    onChange: (value: string) => void
    onSave: () => void
    isSaving: boolean
}

/**
 * API Key Input Component
 */
export function ApiKeyInput({ value, onChange, onSave, isSaving }: ApiKeyInputProps) {
    return (
        <div className="flex gap-2">
            <Input
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter API key..."
                className="rounded-none flex-1"
            />
            <Button
                variant="primary"
                size="sm"
                onClick={onSave}
                disabled={isSaving || !value.trim()}
                className="rounded-none gap-1"
            >
                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
            </Button>
        </div>
    )
}
