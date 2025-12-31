/**
 * @fileoverview API Key Initialization Script
 * @module lib/init/seed-api-keys
 *
 * ONE-TIME initialization script to configure Gemini API key in credential vault.
 * Run this script in browser console or via DevTools to seed the API key.
 *
 * Usage:
 * 1. Start dev server: pnpm dev
 * 2. Open browser DevTools Console (F12)
 * 3. Paste and execute this entire script
 *
 * @epic KSI Module - Agent Architecture
 * @story Seed API Key for Runtime Validation
 */

import { credentialVault } from '../agent/providers/credential-vault';

/**
 * Seed the Gemini API key into credential vault
 *
 * This function:
 * 1. Initializes the vault (generates master key)
 * 2. Stores the provided API key with AES-GCM encryption
 * 3. Verifies storage succeeded
 * 4. Returns diagnostic information
 *
 * @returns Promise<void>
 */
export async function seedGeminiAPIKey(): Promise<void> {
  console.log('🔑 [API Key Seeding] Starting...');

  try {
    // Step 1: Initialize vault
    console.log('1️⃣  Initializing credential vault...');
    await credentialVault.initialize();
    console.log('✅ Vault initialized');

    // Step 2: Check if key already exists
    const hasExistingKey = await credentialVault.hasCredentials('gemini');
    if (hasExistingKey) {
      console.log('⚠️  Gemini API key already exists in vault');
      console.log('   To overwrite, first run: await credentialVault.deleteCredentials("gemini")');
      return;
    }

    // Step 3: Store the API key
    console.log('2️⃣  Storing Gemini API key...');
    const apiKey = 'AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ';

    await credentialVault.storeCredentials('gemini', apiKey);
    console.log('✅ API key stored successfully (encrypted with AES-GCM)');

    // Step 4: Verify storage
    console.log('3️⃣  Verifying storage...');
    const retrievedKey = await credentialVault.getCredentials('gemini');

    if (!retrievedKey) {
      throw new Error('Key storage verification failed - key not retrievable');
    }

    if (retrievedKey !== apiKey) {
      throw new Error('Key mismatch - encryption/decryption error');
    }

    console.log('✅ API key verified (decryption successful)');
    console.log(`   Key length: ${retrievedKey.length} characters`);

    // Step 5: Vault status
    console.log('4️⃣  Vault status:');
    const status = await credentialVault.getStatus();
    console.table({
      'Initialized': status.isInitialized,
      'Has Password': status.hasPassword,
      'Has Encrypted Key': status.hasEncryptedKey,
      'Has Salt': status.hasSalt,
      'Version': status.hasVersion ? 'v3' : 'unknown',
      'Credentials Count': status.credentialCount,
      'Last Error': status.lastError || 'None'
    });

    console.log('🎉 [API Key Seeding] COMPLETE');
    console.log('');
    console.log('📍 Next Steps:');
    console.log('   1. Refresh the page (Cmd+R / F5)');
    console.log('   2. Open Knowledge workspace');
    console.log('   3. Create a vault and import test documents');
    console.log('   4. Click "Synthesize" to trigger real Gemini API calls');
    console.log('');
    console.log('✨ API Key is now configured and ready for KSI validation!');

  } catch (error) {
    console.error('❌ [API Key Seeding] FAILED:', error);
    console.error('   Error:', error instanceof Error ? error.message : error);

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.error('');
      console.error('🔧 TROUBLESHOOTING:');
      console.error('   1. Ensure dev server is running: pnpm dev');
      console.error('   2. Check browser console for IndexedDB errors');
      console.error('   3. Try clearing browser data and refreshing');
    }

    throw error;
  }
}

/**
 * Auto-execute when loaded (DevTools convenience)
 *
 * Uncomment the line below to automatically seed on script import
 */
// seedGeminiAPIKey();

/**
 * Export as window global for DevTools access
 */
if (typeof window !== 'undefined') {
  (window as any).seedGeminiAPIKey = seedGeminiAPIKey;
  console.log('💡 [API Key Seeding] Function available as: seedGeminiAPIKey()');
  console.log('   Run: await seedGeminiAPIKey()');
}

// Export for module usage
export default seedGeminiAPIKey;
