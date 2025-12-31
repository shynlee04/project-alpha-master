/**
 * Custom Headers Editor Component
 *
 * Handles custom HTTP headers for OpenAI-compatible providers.
 *
 * @layer Presentation
 * @component CustomHeadersEditor
 */

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CustomHeadersEditorProps {
    headers: Array<{ key: string; value: string }>
    onHeadersChange: (headers: Array<{ key: string; value: string }>) => void
}

/**
 * Custom Headers Editor Component
 */
export function CustomHeadersEditor({
    headers,
    onHeadersChange
}: CustomHeadersEditorProps) {
    return (
        <details className="group">
            <summary className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                <span className="text-[10px]">▶</span>
                <span className="group-open:hidden">Custom Headers</span>
                <span className="hidden group-open:inline">Custom Headers</span>
            </summary>
            <div className="mt-2 space-y-2">
                {headers.map((header, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <Input
                            value={header.key}
                            onChange={(e) => {
                                const newHeaders = [...headers]
                                newHeaders[idx].key = e.target.value
                                onHeadersChange(newHeaders)
                            }}
                            placeholder="Key"
                            className="rounded-none flex-1 text-xs"
                        />
                        <Input
                            value={header.value}
                            onChange={(e) => {
                                const newHeaders = [...headers]
                                newHeaders[idx].value = e.target.value
                                onHeadersChange(newHeaders)
                            }}
                            placeholder="Value"
                            className="rounded-none flex-1 text-xs"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onHeadersChange(headers.filter((_, i) => i !== idx))}
                            className="rounded-none text-xs text-destructive"
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onHeadersChange([...headers, { key: '', value: '' }])}
                    className="rounded-none text-xs"
                >
                    + Add Header
                </Button>
            </div>
        </details>
    )
}
