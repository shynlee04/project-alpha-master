/**
 * Agent Configuration Diagnostic Tool
 * 
 * CC-2025-12-29: Debug component to trace issues with agent config
 * Usage: Add <AgentDiagnostic /> to any page to run diagnostics
 */

import { useState } from 'react'
import { db } from '@/lib/state/dexie-db'
import { credentialVault } from '@/lib/agent/providers/credential-vault'
import { modelRegistry } from '@/lib/agent/providers/model-registry'
import { Button } from '@/components/ui/button'

interface DiagnosticResult {
    step: string
    status: 'pending' | 'success' | 'error'
    message: string
    data?: unknown
}

export function AgentDiagnostic() {
    const [results, setResults] = useState<DiagnosticResult[]>([])
    const [running, setRunning] = useState(false)

    const addResult = (result: DiagnosticResult) => {
        setResults(prev => [...prev, result])
    }

    const runDiagnostics = async () => {
        setResults([])
        setRunning(true)

        try {
            // Step 1: Check Dexie DB
            addResult({ step: '1. Dexie DB', status: 'pending', message: 'Checking...' })
            try {
                await db.open()
                const credCount = await db.credentials.count()
                setResults(prev => prev.map(r => r.step === '1. Dexie DB'
                    ? { ...r, status: 'success', message: `DB open, ${credCount} credentials stored`, data: credCount }
                    : r
                ))
            } catch (e) {
                setResults(prev => prev.map(r => r.step === '1. Dexie DB'
                    ? { ...r, status: 'error', message: String(e) }
                    : r
                ))
            }

            // Step 2: List credentials in DB
            addResult({ step: '2. Credentials in DB', status: 'pending', message: 'Checking...' })
            try {
                const creds = await db.credentials.toArray()
                const providerIds = creds.map(c => c.providerId)
                setResults(prev => prev.map(r => r.step === '2. Credentials in DB'
                    ? { ...r, status: 'success', message: `Providers: ${providerIds.join(', ') || 'none'}`, data: providerIds }
                    : r
                ))
            } catch (e) {
                setResults(prev => prev.map(r => r.step === '2. Credentials in DB'
                    ? { ...r, status: 'error', message: String(e) }
                    : r
                ))
            }

            // Step 3: Initialize vault
            addResult({ step: '3. Vault Init', status: 'pending', message: 'Initializing...' })
            try {
                await credentialVault.initialize()
                setResults(prev => prev.map(r => r.step === '3. Vault Init'
                    ? { ...r, status: 'success', message: 'Vault initialized' }
                    : r
                ))
            } catch (e) {
                setResults(prev => prev.map(r => r.step === '3. Vault Init'
                    ? { ...r, status: 'error', message: String(e) }
                    : r
                ))
            }

            // Step 4: Check OpenRouter credentials
            addResult({ step: '4. OpenRouter Key', status: 'pending', message: 'Checking...' })
            try {
                const hasKey = await credentialVault.hasCredentials('openrouter')
                const key = hasKey ? await credentialVault.getCredentials('openrouter') : null
                setResults(prev => prev.map(r => r.step === '4. OpenRouter Key'
                    ? {
                        ...r,
                        status: key ? 'success' : 'error',
                        message: key
                            ? `Key found (${key.length} chars, starts with ${key.substring(0, 8)}...)`
                            : 'No key stored'
                    }
                    : r
                ))
            } catch (e) {
                setResults(prev => prev.map(r => r.step === '4. OpenRouter Key'
                    ? { ...r, status: 'error', message: String(e) }
                    : r
                ))
            }

            // Step 5: Fetch models from OpenRouter
            addResult({ step: '5. Fetch Models', status: 'pending', message: 'Fetching...' })
            try {
                const key = await credentialVault.getCredentials('openrouter')
                if (!key) {
                    setResults(prev => prev.map(r => r.step === '5. Fetch Models'
                        ? { ...r, status: 'error', message: 'No API key to fetch models' }
                        : r
                    ))
                } else {
                    const models = await modelRegistry.getModels('openrouter', key)
                    setResults(prev => prev.map(r => r.step === '5. Fetch Models'
                        ? { ...r, status: 'success', message: `Fetched ${models.length} models`, data: models.slice(0, 5) }
                        : r
                    ))
                }
            } catch (e) {
                setResults(prev => prev.map(r => r.step === '5. Fetch Models'
                    ? { ...r, status: 'error', message: String(e) }
                    : r
                ))
            }

            // Step 6: Check localStorage vault keys
            addResult({ step: '6. LocalStorage Keys', status: 'pending', message: 'Checking...' })
            try {
                const vaultKeys = ['vg_vp_v3', 'vg_mk', 'vg_salt']
                const found: string[] = []
                vaultKeys.forEach(k => {
                    if (localStorage.getItem(k)) found.push(k)
                })
                setResults(prev => prev.map(r => r.step === '6. LocalStorage Keys'
                    ? { ...r, status: found.length > 0 ? 'success' : 'error', message: `Found: ${found.join(', ') || 'none'}` }
                    : r
                ))
            } catch (e) {
                setResults(prev => prev.map(r => r.step === '6. LocalStorage Keys'
                    ? { ...r, status: 'error', message: String(e) }
                    : r
                ))
            }

        } finally {
            setRunning(false)
        }
    }

    const testSaveKey = async () => {
        const testKey = prompt('Enter OpenRouter API key to test:')
        if (!testKey) return

        try {
            await credentialVault.initialize()
            await credentialVault.storeCredentials('openrouter', testKey)
            alert('Key saved! Run diagnostics again to verify.')
        } catch (e) {
            alert('Failed to save: ' + String(e))
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-background border border-border p-4 rounded shadow-lg max-w-md max-h-96 overflow-auto">
            <h3 className="font-bold mb-2">Agent Config Diagnostic</h3>

            <div className="flex gap-2 mb-4">
                <Button size="sm" onClick={runDiagnostics} disabled={running}>
                    {running ? 'Running...' : 'Run Diagnostics'}
                </Button>
                <Button size="sm" variant="outline" onClick={testSaveKey}>
                    Test Save Key
                </Button>
            </div>

            <div className="space-y-2 text-sm">
                {results.map((r, i) => (
                    <div key={i} className={`p-2 rounded ${r.status === 'success' ? 'bg-green-900/30' :
                            r.status === 'error' ? 'bg-red-900/30' :
                                'bg-yellow-900/30'
                        }`}>
                        <div className="font-medium">{r.step}</div>
                        <div className="text-xs opacity-70">{r.message}</div>
                        {r.data && (
                            <pre className="text-xs mt-1 overflow-auto max-h-20">
                                {JSON.stringify(r.data, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
