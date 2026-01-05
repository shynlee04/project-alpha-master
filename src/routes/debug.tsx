/**
 * Debug Route - Inspect database state and clear data
 * Access at: http://localhost:3000/debug
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { db } from '@/infrastructure/persistence/dexie-db';

export const Route = createFileRoute('/debug')({
    ssr: false,
    component: DebugPage,
});

function DebugPage() {
    const [output, setOutput] = useState<string[]>([]);
    const [clearing, setClearing] = useState(false);

    const log = (msg: string) => {
        setOutput(prev => [...prev, msg]);
        console.log('[DEBUG]', msg);
    };

    const checkDatabase = async () => {
        setOutput([]);
        log('============ CHECKING DATABASE ============');

        try {
            // Check Dexie
            log('Opening Dexie database...');
            await db.open();

            const projects = await db.projects.toArray();
            log(`Found ${projects.length} projects in Dexie:`);

            for (const p of projects) {
                log(`  📁 ID: ${p.id}`);
                log(`     Name: ${p.name}`);
                log(`     Bindings: ${JSON.stringify(p.bindings)}`);
                log(`     LastOpened: ${p.lastOpened}`);
                log('');
            }

            // Check localStorage
            log('\n============ LOCALSTORAGE ============');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('project') || key.includes('workspace') || key.includes('state'))) {
                    const value = localStorage.getItem(key) || '';
                    log(`${key}: ${value.slice(0, 200)}${value.length > 200 ? '...' : ''}`);
                }
            }

        } catch (error) {
            log(`Error: ${(error as Error).message}`);
        }
    };

    const clearAllData = async () => {
        setClearing(true);
        setOutput([]);
        log('============ CLEARING ALL DATA ============');

        try {
            // 1. Clear Dexie tables
            log('Clearing Dexie tables...');
            await db.projects.clear();
            log('✅ Cleared projects table');

            await db.conversations.clear();
            log('✅ Cleared conversations table');

            await db.ideState.clear();
            log('✅ Cleared ideState table');

            // 2. Clear all localStorage
            log('\nClearing localStorage...');
            const keys = Object.keys(localStorage);
            localStorage.clear();
            log(`✅ Cleared ${keys.length} localStorage keys`);

            // 3. Clear sessionStorage
            log('\nClearing sessionStorage...');
            sessionStorage.clear();
            log('✅ Cleared sessionStorage');

            log('\n🎉 ALL DATA CLEARED!');
            log('Redirecting to Hub in 2 seconds...');

            setTimeout(() => {
                window.location.href = '/hub';
            }, 2000);

        } catch (error) {
            log(`❌ Error: ${(error as Error).message}`);
        } finally {
            setClearing(false);
        }
    };

    useEffect(() => {
        checkDatabase();
    }, []);

    return (
        <div style={{
            background: '#1a1a2e',
            color: '#fff',
            minHeight: '100vh',
            padding: '40px',
            fontFamily: 'system-ui'
        }}>
            <h1 style={{ color: '#4ee' }}>🔍 Via-Gent Debug Page</h1>

            <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                <button
                    onClick={checkDatabase}
                    style={{
                        fontSize: '18px',
                        padding: '15px 30px',
                        background: '#4ee',
                        border: 'none',
                        color: '#000',
                        cursor: 'pointer',
                        borderRadius: '8px'
                    }}
                >
                    🔍 Refresh Database Check
                </button>

                <button
                    onClick={clearAllData}
                    disabled={clearing}
                    style={{
                        fontSize: '18px',
                        padding: '15px 30px',
                        background: '#e94560',
                        border: 'none',
                        color: '#fff',
                        cursor: clearing ? 'wait' : 'pointer',
                        borderRadius: '8px',
                        opacity: clearing ? 0.5 : 1
                    }}
                >
                    {clearing ? '⏳ Clearing...' : '🧹 CLEAR ALL DATA'}
                </button>
            </div>

            <pre style={{
                background: '#0d0d1a',
                padding: '20px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                maxHeight: '600px',
                overflow: 'auto'
            }}>
                {output.join('\n')}
            </pre>
        </div>
    );
}
