/**
 * UX-1 Glassmorphism Removal - Validation Tests
 * 
 * Tests to verify glassmorphism patterns have been removed from the codebase.
 * Uses Pattern Matching approach for UI remediation validation.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'

const COMPONENTS_DIR = path.join(process.cwd(), 'src/presentation/components')
const STYLES_DIR = path.join(process.cwd(), 'src/styles')

// Glassmorphism patterns to detect
const GLASSMORPHISM_PATTERNS = [
  { pattern: /bg-black\/50/g, name: 'bg-black/50' },
  { pattern: /bg-black\/60/g, name: 'bg-black/60' },
  { pattern: /bg-black\/70/g, name: 'bg-black/70' },
  { pattern: /bg-black\/80/g, name: 'bg-black/80' },
  { pattern: /bg-black\/90/g, name: 'bg-black/90' },
  { pattern: /bg-white\/10/g, name: 'bg-white/10' },
  { pattern: /bg-white\/20/g, name: 'bg-white/20' },
  { pattern: /bg-white\/30/g, name: 'bg-white/30' },
  { pattern: /bg-white\/40/g, name: 'bg-white/40' },
  { pattern: /bg-white\/50/g, name: 'bg-white/50' },
  { pattern: /bg-opacity-/g, name: 'bg-opacity-' },
  { pattern: /backdrop-filter/g, name: 'backdrop-filter' },
  { pattern: /backdrop-blur/g, name: 'backdrop-blur' },
]

describe('UX-1: Glassmorphism Removal', () => {
  describe('Design Tokens', () => {
    it('should have --color-overlay CSS variable defined', () => {
      const tokensCss = fs.readFileSync(
        path.join(STYLES_DIR, 'design-tokens.css'),
        'utf-8'
      )
      
      expect(tokensCss).toContain('--color-overlay')
    })

    it('--color-overlay should be a solid color (not transparent)', () => {
      const tokensCss = fs.readFileSync(
        path.join(STYLES_DIR, 'design-tokens.css'),
        'utf-8'
      )
      
      // Should have overlay color like #1a1a1a or hsl(0, 0%, 10%)
      expect(tokensCss).toMatch(/--color-overlay:\s*(#[0-9a-fA-F]{6}|hsl\([^)]+\))/)
    })
  })

  describe('Component Overlays (Acceptable after fix)', () => {
    // These files should use --color-overlay instead of bg-black/50, etc.
    const OVERLAY_FILES = [
      'src/presentation/components/ui/dialog.tsx',
      'src/presentation/components/ui/sheet.tsx',
      'src/presentation/components/ide/FeatureSearch.tsx',
      'src/presentation/components/ide/CommandPalette.tsx',
      'src/presentation/components/ui/ApprovalOverlay.tsx',
      'src/presentation/components/chat/ApprovalOverlay.tsx',
      'src/presentation/components/layout/MainSidebar.tsx',
      'src/presentation/components/knowledge/SourcePreviewPanel.tsx',
    ]

    OVERLAY_FILES.forEach((filePath) => {
      it(`should use solid overlay in ${filePath}`, () => {
        if (!fs.existsSync(path.join(process.cwd(), filePath))) {
          return // Skip if file doesn't exist
        }
        
        const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8')
        
        // After fix: Should use --color-overlay or similar solid color
        const usesSolidOverlay = 
          content.includes('--color-overlay') ||
          content.includes('bg-[var(--color-overlay)]') ||
          content.includes('bg-overlay')
        
        // Before fix: Contains glassmorphism patterns
        const hasGlassmorphism = GLASSMORPHISM_PATTERNS.some(p => p.pattern.test(content))
        
        // Either solid overlay (after fix) OR no glassmorphism patterns
        expect(usesSolidOverlay || !hasGlassmorphism).toBe(true)
      })
    })
  })

  describe('Build Verification', () => {
    it('should pass TypeScript compilation', async () => {
      // This test verifies the build passes after changes
      // In real execution, run: pnpm exec tsc --noEmit
      const { execSync } = require('child_process')
      
      try {
        execSync('pnpm exec tsc --noEmit', { 
          cwd: process.cwd(),
          stdio: 'pipe',
          timeout: 120000 
        })
        expect(true).toBe(true)
      } catch (error) {
        expect(false).toBe(true)
      }
    })

    it('should pass build verification', async () => {
      const { execSync } = require('child_process')
      
      try {
        execSync('pnpm build', { 
          cwd: process.cwd(),
          stdio: 'pipe',
          timeout: 300000 
        })
        expect(true).toBe(true)
      } catch (error) {
        expect(false).toBe(true)
      }
    })
  })

  describe('Visual Regression Check', () => {
    it('should have no glassmorphism patterns in presentation components', () => {
      const presentationDir = path.join(process.cwd(), 'src/presentation')
      
      let hasGlassmorphism = false
      let glassmorphicFiles: string[] = []

      function scanDirectory(dir: string) {
        const files = fs.readdirSync(dir)
        
        for (const file of files) {
          const fullPath = path.join(dir, file)
          const stat = fs.statSync(fullPath)
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath)
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf-8')
            const hasPattern = GLASSMORPHISM_PATTERNS.some(p => p.pattern.test(content))
            
            if (hasPattern) {
              hasGlassmorphism = true
              glassmorphicFiles.push(path.relative(process.cwd(), fullPath))
            }
          }
        }
      }

      scanDirectory(presentationDir)

      // Log any remaining glassmorphism for debugging
      if (glassmorphicFiles.length > 0) {
        console.log('Files with remaining glassmorphism:', glassmorphicFiles)
      }

      // This test documents current state - will fail until fix is applied
      expect(glassmorphicFiles).toEqual([])
    })
  })
})
