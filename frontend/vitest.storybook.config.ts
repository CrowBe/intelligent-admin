/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Storybook-specific Vitest configuration
export default defineConfig({
  plugins: [
    react(),
    // The plugin will run tests for the stories defined in your Storybook config
    storybookTest({
      configDir: path.join(dirname, '.storybook')
    })
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{
        browser: 'chromium'
      }]
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
    // Note: include/exclude for story files is now handled by Storybook plugin automatically
    exclude: ['node_modules', 'dist', '**/*.d.ts'],
    testTimeout: 15000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});