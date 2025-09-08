/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'frontend',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '**/*.d.ts',
      '**/*.stories.{js,ts,jsx,tsx}', // Exclude Storybook stories from regular tests
      '.storybook/**'
    ],
    env: {
      VITE_API_BASE_URL: 'http://localhost:3001/api/v1'
    },
    coverage: {
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: [
        'node_modules',
        'dist',
        'src/test',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/*.stories.{js,ts,jsx,tsx}',
        '**/types.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '.storybook/**'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});