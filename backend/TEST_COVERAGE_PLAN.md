# Test Coverage Enhancement Plan

## Current Status
- **Frontend Tests**: 5 test files (minimal coverage)
- **Backend Tests**: 0 test files
- **TypeScript Errors**: 209 errors in backend (mostly type-related)

## Recommended Testing Stack

### Frontend Testing
```json
{
  "@testing-library/react": "^16.1.0",
  "@testing-library/jest-dom": "^6.7.0",
  "@testing-library/user-event": "^14.6.0",
  "@vitest/ui": "^2.1.8",
  "vitest": "^2.1.8",
  "happy-dom": "^16.5.3",
  "@vitest/coverage-v8": "^2.1.8"
}
```

### Backend Testing
```json
{
  "@types/jest": "^29.5.15",
  "@types/supertest": "^6.0.3",
  "jest": "^29.7.0",
  "supertest": "^6.3.4",
  "ts-jest": "^29.2.5"
}
```

## Test Coverage Goals

### Phase 1: Critical Path Testing (Week 1)
**Target: 30% coverage**

#### Frontend Priority Tests
1. **Authentication Flow**
   - `LoginPage.test.tsx`
   - `AuthContext.test.tsx`
   - `ProtectedRoute.test.tsx`

2. **Core Chat Features**
   - `ChatInterface.test.tsx` ✅ (Created)
   - `ChatInput.test.tsx`
   - `MessageList.test.tsx`

3. **Navigation & Layout**
   - `AppShell.test.tsx`
   - `Navigation.test.tsx`

#### Backend Priority Tests
1. **Auth Middleware**
   ```typescript
   // backend/src/__tests__/middleware/auth.test.ts
   describe('Auth Middleware', () => {
     test('should reject requests without token');
     test('should accept valid tokens');
     test('should extract user info correctly');
   });
   ```

2. **Chat Service**
   ```typescript
   // backend/src/__tests__/services/chat.test.ts
   describe('Chat Service', () => {
     test('should create new sessions');
     test('should save messages');
     test('should retrieve conversation history');
   });
   ```

3. **API Routes**
   ```typescript
   // backend/src/__tests__/routes/chat.test.ts
   describe('Chat Routes', () => {
     test('POST /api/v1/chat/sessions');
     test('POST /api/v1/chat/messages');
     test('GET /api/v1/chat/sessions/:id/messages');
   });
   ```

### Phase 2: Feature Coverage (Week 2)
**Target: 50% coverage**

#### Frontend Tests
- Email intelligence components
- Document processing UI
- Settings and preferences
- Dashboard widgets

#### Backend Tests
- OpenAI service integration
- Email analysis service
- Document processing
- Database operations

### Phase 3: Edge Cases & Integration (Week 3)
**Target: 70% coverage**

- Error boundaries
- Network failure scenarios
- Rate limiting
- Concurrent user sessions
- File upload edge cases

## Test Implementation Strategy

### 1. Setup Test Infrastructure

#### Frontend (Vitest)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

#### Backend (Jest)
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};
```

### 2. Test Utilities

#### Frontend Test Utils
```typescript
// frontend/src/test/utils.tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
}
```

#### Backend Test Utils
```typescript
// backend/src/test/utils.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});
```

### 3. CI/CD Integration

#### GitHub Actions Workflow
```yaml
name: Test Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests with coverage
        run: npm run test:coverage
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

## Testing Best Practices

### 1. Test Structure
```typescript
describe('Component/Function Name', () => {
  describe('when condition', () => {
    it('should expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 2. Mock Strategies
- Mock external dependencies (APIs, databases)
- Use real implementations for business logic
- Create factory functions for test data

### 3. Coverage Metrics
- **Line Coverage**: Aim for 70%+
- **Branch Coverage**: Aim for 60%+
- **Function Coverage**: Aim for 70%+
- **Statement Coverage**: Aim for 70%+

## Quick Start Commands

```bash
# Install test dependencies
npm install --save-dev @testing-library/react vitest @vitest/ui happy-dom

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Open coverage report
npm run coverage:open
```

## TypeScript Fixes Priority

1. **Fix critical type errors** that block compilation
2. **Add proper return types** to all async functions
3. **Replace `any` types** with proper interfaces
4. **Handle nullable values** with proper guards
5. **Create shared type definitions** for common patterns

## Next Steps

1. **Today**: Fix TypeScript compilation errors
2. **Tomorrow**: Set up test infrastructure
3. **This Week**: Implement Phase 1 critical path tests
4. **Next Week**: Expand to Phase 2 feature coverage
5. **Ongoing**: Maintain coverage as new features are added

## Success Metrics

- [ ] Backend compiles without errors
- [ ] 30% test coverage achieved (Phase 1)
- [ ] All critical user paths have tests
- [ ] CI/CD pipeline includes test runs
- [ ] Coverage reports generated automatically
- [ ] Team follows TDD for new features
