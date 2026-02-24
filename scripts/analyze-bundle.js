#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * 
 * Analyzes build output and warns about large bundles that might
 * cause deployment failures on Cloudflare or Vercel.
 */

import { readFileSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, '../.output');
const MAX_CLOUDFLARE_SIZE = 10 * 1024 * 1024; // 10MB compressed
const MAX_VERCEL_SIZE = 50 * 1024 * 1024; // 50MB uncompressed

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = join(dirPath, file);
      const stats = statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}`);
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBuild() {
  console.log('🔍 Analyzing build output...\n');
  
  try {
    // Check if build output exists
    const serverSize = getDirectorySize(join(OUTPUT_DIR, 'server'));
    const publicSize = getDirectorySize(join(OUTPUT_DIR, 'public'));
    const totalSize = serverSize + publicSize;
    
    console.log('📊 Build Size Analysis:');
    console.log(`   Server bundle: ${formatBytes(serverSize)}`);
    console.log(`   Public assets: ${formatBytes(publicSize)}`);
    console.log(`   Total size: ${formatBytes(totalSize)}\n`);
    
    // Cloudflare Workers limits
    console.log('☁️  Cloudflare Workers Compatibility:');
    if (serverSize > MAX_CLOUDFLARE_SIZE) {
      console.log(`   ❌ Server bundle (${formatBytes(serverSize)}) exceeds Cloudflare limit (${formatBytes(MAX_CLOUDFLARE_SIZE)})`);
      console.log('   💡 Consider externalizing more dependencies in vite.config.ts');
    } else {
      console.log(`   ✅ Server bundle size OK (${formatBytes(serverSize)} < ${formatBytes(MAX_CLOUDFLARE_SIZE)})`);
    }
    
    // Vercel limits
    console.log('\n🔺 Vercel Compatibility:');
    if (totalSize > MAX_VERCEL_SIZE) {
      console.log(`   ❌ Total bundle (${formatBytes(totalSize)}) exceeds Vercel limit (${formatBytes(MAX_VERCEL_SIZE)})`);
      console.log('   💡 Consider code splitting and lazy loading');
    } else {
      console.log(`   ✅ Total bundle size OK (${formatBytes(totalSize)} < ${formatBytes(MAX_VERCEL_SIZE)})`);
    }
    
    // Recommendations
    console.log('\n💡 Optimization Recommendations:');
    
    if (serverSize > 5 * 1024 * 1024) { // 5MB
      console.log('   • Server bundle is large - consider more aggressive externalization');
    }
    
    if (publicSize > 20 * 1024 * 1024) { // 20MB
      console.log('   • Public assets are large - consider asset optimization');
    }
    
    console.log('   • Use dynamic imports for client-only dependencies');
    console.log('   • Enable gzip compression in production');
    console.log('   • Consider lazy loading heavy components\n');
    
  } catch (error) {
    console.error('❌ Error analyzing build:', error.message);
    console.log('💡 Make sure to run `pnpm build` first\n');
    process.exit(1);
  }
}

analyzeBuild();