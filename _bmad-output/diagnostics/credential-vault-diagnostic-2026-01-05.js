/**
 * DIAGNOSTIC SCRIPT: Credential Vault and Model Loading
 * 
 * Run this in browser console on the deployed site to debug the issue.
 * Copy-paste into console and observe the output.
 * 
 * @date 2026-01-05
 * @issue P0-LLM-001, P0-LLM-002
 */

// ============================================================================
// PASTE THIS INTO BROWSER CONSOLE
// ============================================================================

(async function diagnoseCredentialVaultAndModels() {
    console.log('🔍 =================================================');
    console.log('🔍 CREDENTIAL VAULT & MODEL LOADING DIAGNOSTIC');
    console.log('🔍 =================================================\n');

    // Step 1: Check if window/localStorage are available
    console.log('1️⃣ ENVIRONMENT CHECK');
    console.log('   typeof window:', typeof window);
    console.log('   typeof localStorage:', typeof localStorage);
    console.log('   typeof indexedDB:', typeof indexedDB);
    console.log('');

    // Step 2: Check localStorage vault keys
    console.log('2️⃣ LOCALSTORAGE VAULT KEYS');
    const vaultKeys = ['vg_vp_v3', 'vg_ek_v3', 'vg_salt_v3', 'vg_kv_v3'];
    vaultKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        console.log(`   ${key}: ${value ? `✅ present (${value.length} chars)` : '❌ MISSING'}`);
    });
    console.log('');

    // Step 3: Check IndexedDB databases
    console.log('3️⃣ INDEXEDDB STATUS');
    try {
        const databases = await indexedDB.databases();
        console.log('   Databases found:', databases.length);
        databases.forEach((db) => {
            console.log(`     - ${db.name} (v${db.version})`);
        });
    } catch (e) {
        console.log('   ❌ Failed to list databases:', e.message);
    }
    console.log('');

    // Step 4: Check ViaGentDB tables
    console.log('4️⃣ VIA-GENT DATABASE CHECK');
    try {
        // Open the database directly to inspect
        const request = indexedDB.open('via-gent-db');
        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('   Database version:', db.version);
            console.log('   Object stores:', [...db.objectStoreNames].join(', '));
            
            // Check if credentials table exists
            const hasCredentials = db.objectStoreNames.contains('credentials');
            console.log(`   credentials table: ${hasCredentials ? '✅ exists' : '❌ MISSING'}`);
            
            // If exists, count entries
            if (hasCredentials) {
                const tx = db.transaction('credentials', 'readonly');
                const store = tx.objectStore('credentials');
                const countReq = store.count();
                countReq.onsuccess = () => {
                    console.log(`   Credentials stored: ${countReq.result}`);
                };
                
                // List all credential provider IDs
                const getAllReq = store.getAllKeys();
                getAllReq.onsuccess = () => {
                    console.log('   Provider IDs with credentials:', getAllReq.result);
                };
            }
            db.close();
        };
        request.onerror = (event) => {
            console.log('   ❌ Failed to open database:', event.target.error);
        };
    } catch (e) {
        console.log('   ❌ Database check failed:', e.message);
    }
    
    // Give IDB time to complete
    await new Promise((r) => setTimeout(r, 500));
    console.log('');

    // Step 5: Test credential vault import
    console.log('5️⃣ CREDENTIAL VAULT STATUS');
    try {
        // Try to access the credential vault singleton
        const vault = window.__VIA_GENT_DEBUG__?.credentialVault;
        if (vault) {
            console.log('   Vault instance found');
            const status = await vault.getStatus();
            console.log('   Status:', JSON.stringify(status, null, 2));
        } else {
            console.log('   ⚠️ Vault not exposed on window. Will try manual import...');
            // This won't work in console but shows what we need
            console.log('   (Import via ES module not available in console)');
        }
    } catch (e) {
        console.log('   ❌ Vault check failed:', e.message);
    }
    console.log('');

    // Step 6: Check Zustand store state
    console.log('6️⃣ ZUSTAND STORE STATE');
    try {
        // Access Zustand store if exposed
        const store = window.__VIA_GENT_DEBUG__?.appStore;
        if (store) {
            const state = store.getState();
            console.log('   Providers:', state.providers?.map(p => ({
                id: p.id,
                name: p.name,
                hasApiKey: p.hasApiKey,
                modelCount: state.availableModels?.[p.id]?.length || 0
            })));
        } else {
            console.log('   ⚠️ Store not exposed on window');
        }
    } catch (e) {
        console.log('   ❌ Store check failed:', e.message);
    }
    console.log('');

    console.log('🔍 =================================================');
    console.log('🔍 DIAGNOSTIC COMPLETE');
    console.log('🔍 =================================================');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('   1. If localStorage keys are MISSING: Vault creation failed');
    console.log('   2. If credentials table MISSING: Dexie schema issue');
    console.log('   3. If credentials stored but models empty: API fetch failing');
    console.log('   4. Check Network tab for API requests to provider endpoints');
})();
