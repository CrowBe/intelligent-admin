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
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Global coverage thresholds that apply when running all projects
      thresholds: {
        global: {
          lines: 75,
          functions: 75,
          branches: 70,
          statements: 75,
        }
      },
      // Aggregate coverage across all projects
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/tests/**',
        '**/.storybook/**',
        '**/storybook-static/**'
      ]
    }
  }
})