import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Define projects for monorepo testing
    projects: [
      './frontend/vitest.config.ts',
      './backend/vitest.config.ts', 
      './shared/vitest.config.ts'
    ],
    // Global test configuration
    reporter: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage'
    }
  }
})