import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json']
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        global: 'readonly',
        Promise: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      // TypeScript rules with auto-fix capabilities
      ...typescript.configs.recommended.rules,
      ...typescript.configs['recommended-type-checked'].rules,
      
      // Auto-fixable: Add explicit return types
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true
      }],
      
      // Auto-fixable: Remove unused variables (prefix with _)
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      
      // Auto-fixable: Use type imports when possible
      '@typescript-eslint/consistent-type-imports': ['warn', {
        prefer: 'type-imports',
        disallowTypeAnnotations: false
      }],
      
      // Auto-fixable: Remove unnecessary type assertions
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      
      // Auto-fixable: Add missing async/await
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      
      // Auto-fixable: Prefer nullish coalescing
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      
      // Auto-fixable: Prefer optional chaining
      '@typescript-eslint/prefer-optional-chain': 'warn',
      
      // Auto-fixable: Array type consistency
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      
      // Auto-fixable: Remove unnecessary conditionals
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      
      // Auto-fixable: Consistent type exports
      '@typescript-eslint/consistent-type-exports': 'warn',
      
      // Warn about any types (not auto-fixable but helps identify)
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Auto-fixable: Missing return statements
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: {
          attributes: false
        }
      }],
      
      // Handle async functions properly
      '@typescript-eslint/promise-function-async': 'warn',
      
      // Auto-fixable: Prefer string starts/ends with
      '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
      
      // Auto-fixable: Prefer includes
      '@typescript-eslint/prefer-includes': 'warn',
      
      // Auto-fixable: No redundant type constituents
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      
      // Turn off rules that conflict with our setup
      'no-console': 'off',
      'no-undef': 'off', // TypeScript handles this
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  },
  {
    ignores: [
      'dist/**',
      '*.config.js',
      '*.config.ts',
      'node_modules/**',
      'coverage/**',
      'uploads/**',
      'scripts/**',
      '**/*.test.ts',
      '**/*.spec.ts'
    ]
  }
];
