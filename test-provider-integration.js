#!/usr/bin/env node

/**
 * Test Script for Provider Integration Issues
 * 
 * This script tests the provider system integration including:
 * 1. Universal provider registry
 * 2. Credential vault loading/storage
 * 3. Provider adapter creation
 * 4. Model loading
 * 
 * Issue: Keys fail to load and save on all three providers (Groq, Chutes.ai, Mistral.ai)
 */

import { UniversalProviderRegistry } from './src/domain/services/universal-provider-registry.js';
import { credentialVault } from './src/lib/agent/providers/credential-vault.js';
import { ProviderAdapterFactory } from './src/lib/agent/providers/provider-adapter.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🔍 Testing Provider Integration Issues');
  console.log('='.repeat(60));
  
  // Test 1: Check Universal Provider Registry
  console.log('\n1. Testing Universal Provider Registry...');
  const registry = new UniversalProviderRegistry();
  const providers = registry.list();
  
  console.log(`   Total providers: ${providers.length}`);
  console.log('   Available providers:');
  providers.forEach(p => {
    console.log(`   - ${p.name} (${p.id}): ${p.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`     Endpoints: ${Object.keys(p.endpoints).join(', ')}`);
    console.log(`     Models: ${p.models.length} models configured`);
    console.log(`     Requires API Key: ${p.requiresApiKey}`);
    console.log(`     Has API Key Flag: ${p.hasApiKey}`);
    console.log(`     Is Custom: ${p.isCustom}`);
    console.log('');
  });

  // Test 2: Check Credential Vault
  console.log('\n2. Testing Credential Vault...');
  try {
    const status = await credentialVault.getStatus();
    console.log(`   Vault Status:`);
    console.log(`   - Initialized: ${status.isInitialized}`);
    console.log(`   - Has Password: ${status.hasPassword}`);
    console.log(`   - Has Encrypted Key: ${status.hasEncryptedKey}`);
    console.log(`   - Has Salt: ${status.hasSalt}`);
    console.log(`   - Has Version: ${status.hasVersion}`);
    console.log(`   - Credential Count: ${status.credentialCount}`);
    console.log(`   - Last Error: ${status.lastError || 'None'}`);
    
    // Try to initialize vault
    console.log('\n   Initializing vault...');
    await credentialVault.initialize();
    console.log(`   Vault ready: ${credentialVault.isReady()}`);
    
    // List stored providers
    const storedProviders = await credentialVault.getStoredProviders();
    console.log(`   Stored providers in vault: ${storedProviders.length}`);
    storedProviders.forEach(p => console.log(`     - ${p}`));
  } catch (error) {
    console.error(`   ❌ Error testing credential vault: ${error.message}`);
  }

  // Test 3: Check each built-in provider
  console.log('\n3. Testing Built-in Providers...');
  
  const builtinProviders = [
    { id: 'groq', name: 'Groq' },
    { id: 'chutes', name: 'Chutes.ai' },
    { id: 'mistral', name: 'Mistral AI' },
    { id: 'google', name: 'Google Gemini' },
    { id: 'openrouter', name: 'OpenRouter' }
  ];

  for (const provider of builtinProviders) {
    console.log(`\n   Testing ${provider.name} (${provider.id}):`);
    
    // Check registry
    const config = registry.getConfig(provider.id);
    if (!config) {
      console.log(`     ❌ Not found in registry`);
      continue;
    }
    
    console.log(`     ✅ Found in registry`);
    console.log(`       Enabled: ${config.enabled}`);
    console.log(`       Requires API Key: ${config.requiresApiKey}`);
    console.log(`       Has API Key Flag: ${config.hasApiKey}`);
    console.log(`       Models: ${config.models.length}`);
    
    // Check credential vault
    try {
      const hasCreds = await credentialVault.hasCredentials(provider.id);
      console.log(`       Vault has credentials: ${hasCreds}`);
      
      if (hasCreds) {
        const apiKey = await credentialVault.getCredentials(provider.id);
        console.log(`       API Key loaded: ${apiKey ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.log(`       ❌ Error checking credentials: ${error.message}`);
    }
    
    // Check endpoints
    if (config.endpoints) {
      const endpointTypes = Object.keys(config.endpoints);
      console.log(`       Endpoints: ${endpointTypes.length > 0 ? endpointTypes.join(', ') : 'None'}`);
    }
  }

  // Test 4: Check provider adapter factory
  console.log('\n4. Testing Provider Adapter Factory...');
  try {
    const factory = new ProviderAdapterFactory();
    
    // Try to create adapters for each provider
    for (const provider of builtinProviders) {
      console.log(`\n   Testing adapter for ${provider.name}:`);
      
      // Check if provider is in PROVIDERS config
      const providerConfig = globalThis.PROVIDERS?.[provider.id];
      console.log(`     Provider config exists: ${!!providerConfig}`);
      
      if (providerConfig) {
        console.log(`     Type: ${providerConfig.type}`);
        console.log(`     Enabled: ${providerConfig.enabled}`);
        console.log(`     Base URL: ${providerConfig.baseURL}`);
      }
      
      // Try to get adapter
      try {
        const adapter = factory.getAdapter(provider.id);
        console.log(`     Adapter available: ${!!adapter}`);
      } catch (error) {
        console.log(`     ❌ Adapter error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Error with adapter factory: ${error.message}`);
  }

  // Test 5: Check workspace provider slice
  console.log('\n5. Checking Workspace Provider Integration...');
  try {
    // Read the workspace provider slice
    const workspaceProviderPath = join(__dirname, 'src/infrastructure/persistence/stores/workspace/workspace-provider-slice.ts');
    const workspaceProviderContent = readFileSync(workspaceProviderPath, 'utf-8');
    
    // Check for provider integration
    const hasUniversalProviderImport = workspaceProviderContent.includes('universalProviderRegistry');
    const hasProviderStore = workspaceProviderContent.includes('useProviderStore');
    
    console.log(`   Uses Universal Provider Registry: ${hasUniversalProviderImport}`);
    console.log(`   Uses Provider Store: ${hasProviderStore}`);
    
    // Check for model loading
    const hasLoadModels = workspaceProviderContent.includes('loadModelsForProvider');
    const hasFetchModels = workspaceProviderContent.includes('fetchModels');
    
    console.log(`   Has model loading functions: ${hasLoadModels || hasFetchModels}`);
  } catch (error) {
    console.log(`   ❌ Error reading workspace provider slice: ${error.message}`);
  }

  // Test 6: Check routes for provider usage
  console.log('\n6. Checking Provider Usage in Routes...');
  const routesToCheck = [
    'src/routes/$__debug__.provider-playground.tsx',
    'src/routes/api/providers.ts',
    'src/routes/api/providers.$id.ts',
    'src/routes/api/providers.$id.test.ts',
    'src/routes/api/providers.$id.execute.ts'
  ];
  
  for (const route of routesToCheck) {
    try {
      const routePath = join(__dirname, route);
      const routeContent = readFileSync(routePath, 'utf-8');
      
      const usesRegistry = routeContent.includes('universalProviderRegistry');
      const usesVault = routeContent.includes('credentialVault');
      const usesAdapterFactory = routeContent.includes('ProviderAdapterFactory');
      
      console.log(`\n   ${route}:`);
      console.log(`     Uses Registry: ${usesRegistry}`);
      console.log(`     Uses Vault: ${usesVault}`);
      console.log(`     Uses Adapter Factory: ${usesAdapterFactory}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`     ❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n='.repeat(60));
  console.log('📋 DIAGNOSIS SUMMARY:');
  console.log('='.repeat(60));
  
  // Based on my analysis, here are the likely issues:
  console.log('\n🔴 LIKELY ISSUES:');
  console.log('   1. Credential vault initialization failure during SSR');
  console.log('   2. Provider registry not properly synced with credential vault');
  console.log('   3. Missing integration between universal providers and credential vault');
  console.log('   4. API keys not being stored/retrieved correctly');
  console.log('   5. Models not loading due to vault/key issues');
  
  console.log('\n💡 RECOMMENDED FIXES:');
  console.log('   1. Fix SSR vault initialization guard in provider models slice');
  console.log('   2. Ensure provider key metadata sync with universal provider registry');
  console.log('   3. Add proper error handling for failed key loading');
  console.log('   4. Implement fallback to default models when keys missing');
  console.log('   5. Test each provider individually with test playground');
}

// Run the test
main().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});