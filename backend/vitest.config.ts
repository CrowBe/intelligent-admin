import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'backend',
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        execArgv: ['--max_old_space_size=4096']
      }
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./test.db',
      TEST_DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'test-secret-key-at-least-32-characters-long-for-testing',
      OPENAI_API_KEY: 'sk-test-key-for-testing-purposes-only'
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Coverage thresholds for 80% backend target
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        }
      },
      exclude: [
        'node_modules',
        'dist',
        'src/**/*.d.ts',
        'src/**/*.config.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/test-setup.ts'
      ],
      // Include all source files for accurate coverage
      include: [
        'src/**/*.{ts,js}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
