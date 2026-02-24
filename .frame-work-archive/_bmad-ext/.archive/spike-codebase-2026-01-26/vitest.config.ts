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
    // Note: environmentMatchGlobs not supported in current Vitest version
    // Tests requiring jsdom environment should use // @vitest-environment jsdom comment
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
