import { defineConfig } from 'vitest/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
      ['src/lib/state/**/*.test.ts', 'jsdom'],
      ['src/lib/rag/**/*.test.ts', 'jsdom'],
      ['src/lib/agent/**/*.test.ts', 'jsdom'],
      ['src/lib/filesystem/**/*.test.ts', 'jsdom'],
      ['src/lib/webcontainer/**/*.test.ts', 'jsdom'],
    ],
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
