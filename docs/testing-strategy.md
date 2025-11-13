# Testing Strategy

## Testing Philosophy

This application employs a **multi-layered testing approach** designed for reliability, maintainability, and developer confidence. Our testing strategy balances comprehensive coverage with practical development velocity, ensuring code quality while enabling rapid iteration.

**Core Principles:**
- **Test with Confidence**: Every test should provide meaningful feedback about system behavior
- **Fail Fast**: Catch issues early in development with immediate feedback loops
- **Real-World Focus**: Test realistic scenarios that reflect actual user interactions
- **Maintainable Tests**: Co-located, well-organized tests that evolve with the codebase

## Testing Framework Stack

### Core Testing Framework: Vitest
**Why Vitest**: Fast, native TypeScript support, excellent developer experience, and unified testing across the monorepo.

**Key Features:**
- **Performance**: ~10x faster than Jest for this codebase size
- **Native TypeScript**: Zero-config TypeScript support with strict type checking
- **Watch Mode**: Instant feedback during development
- **Coverage**: Built-in v8 coverage reporting with 80% minimum threshold

### Component Testing: Testing Library + Storybook
**React Testing Library**: User-focused component testing that encourages accessibility
**Storybook**: Visual component documentation and regression testing

**Integration Benefits:**
- Stories serve as both documentation and test fixtures
- Visual regression detection for UI consistency
- Browser-based testing for real rendering validation

### API Testing: Supertest + MSW
**Supertest**: Express.js route testing with realistic HTTP interactions
**MSW (Mock Service Worker)**: API request interception for isolated testing

**Coverage Areas:**
- Authentication flows (OAuth 2.0, JWT validation)
- Admin routes with proper authorization
- File upload handling and security
- Database integration patterns

## Test Organization Strategy

### Co-located Component Tests
**Structure Pattern:**
```
src/components/ui/button/
├── index.ts              # Re-exports for clean imports
├── Button.tsx            # Component implementation
├── Button.stories.tsx    # Storybook visual testing
└── Button.test.tsx       # Vitest unit tests
```

**Benefits:**
- Related files stay together during refactoring
- Easier code review (all changes in one folder)
- Clear component ownership boundaries
- Follows shadcn-ui compatibility requirements

### Grouped Integration Tests
**Structure Pattern:**
```
backend/src/__tests__/
├── server.test.ts              # Server lifecycle and health endpoints
├── admin.routes.test.ts        # Administrative API testing
├── fileUpload.test.ts          # Document processing workflows
└── race-condition-explanation.md # Performance testing documentation
```

**Focus Areas:**
- Cross-service integration scenarios
- Database connectivity and transactions
- Authentication and authorization flows
- Performance and race condition prevention

## Test Types and Coverage

### 1. Unit Tests (Vitest)
**Target**: Individual functions and class methods
**Coverage**: 80% minimum across all modules
**Timeout**: 10 seconds for backend, 5 seconds for frontend

**Examples:**
- Service layer business logic
- Utility functions and data transformations
- Component props and state management
- Input validation and error handling

### 2. Integration Tests (Supertest)
**Target**: API endpoints and service interactions
**Coverage**: All critical user flows
**Timeout**: 15 seconds for database operations

**Key Scenarios:**
- Gmail OAuth flow and token refresh
- Document upload and processing pipeline
- Morning brief scheduling and notifications
- Admin dashboard authentication

### 3. Component Tests (Testing Library)
**Target**: React component behavior
**Coverage**: User interactions and accessibility
**Environment**: jsdom for DOM simulation

**Focus Areas:**
- Chat interface message handling
- Document upload progress feedback
- Mobile-responsive touch interactions
- Error state handling and recovery

### 4. Visual Tests (Storybook)
**Target**: Component appearance and variants
**Coverage**: All UI states and responsive breakpoints
**Environment**: Browser-based rendering

**Story Categories:**
- Component variants (default, destructive, outline)
- Mobile optimization for trade professionals
- Loading and error states
- Industry-specific contexts (WorkSafe notices)

### 5. Performance Tests
**Target**: Race conditions and timeout scenarios
**Coverage**: Server initialization and concurrent requests
**Timeout**: Configurable based on operation complexity

**Critical Scenarios:**
- Scheduler initialization race conditions
- Database connection pool management
- Concurrent health check requests
- File upload timeout handling

## Coverage Requirements and Quality Metrics

### Minimum Coverage Thresholds
- **Global Coverage**: 80% across branches, functions, lines, statements
- **Frontend Specific**: 70% threshold with stricter accessibility testing
- **Backend Specific**: Higher security and error handling coverage

### Quality Gates
- **Branch Coverage**: Ensure all code paths are tested
- **Function Coverage**: Every exported function has tests
- **Statement Coverage**: Critical business logic fully covered
- **Integration Coverage**: All API endpoints tested

### Coverage Exclusions
**Reasonable Exclusions:**
- Configuration files (*.config.ts)
- Type definitions (*.d.ts)
- Test files themselves
- Build artifacts and dependencies

## CI/CD Integration and Automation

### GitHub Actions Workflow
**Automated Testing Pipeline:**
1. **Lint Check**: ESLint with strict TypeScript rules
2. **Type Check**: Full TypeScript compilation validation
3. **Unit Tests**: All Vitest test suites in parallel
4. **Coverage Report**: Enforce 80% minimum threshold
5. **Integration Tests**: API and database connectivity
6. **Visual Tests**: Storybook story validation

### Pre-commit Quality Gates
**Required Checks:**
- All tests pass
- Coverage thresholds met
- No linting violations
- TypeScript compilation successful

### Development Environment
**Local Testing Commands:**
```bash
# Run all tests
npm run test

# Watch mode during development
npm run test:watch

# Coverage analysis
npm run test:coverage

# Module-specific testing
npm run test:backend
npm run test:frontend
npm run test:shared
```

## Best Practices and Guidelines

### Writing Effective Tests

#### 1. Test Structure (AAA Pattern)
```typescript
describe('Gmail OAuth Integration', () => {
  it('should refresh expired tokens automatically', async () => {
    // Arrange: Set up test data and mocks
    const expiredToken = createExpiredToken();
    mockGmailAPI.mockTokenRefresh();
    
    // Act: Execute the functionality
    const result = await gmailService.fetchEmails(expiredToken);
    
    // Assert: Verify expected outcomes
    expect(result).toHaveLength(5);
    expect(mockGmailAPI.refreshToken).toHaveBeenCalledOnce();
  });
});
```

#### 2. Meaningful Test Names
**Good**: `should refresh expired tokens automatically`
**Bad**: `test token refresh`

**Pattern**: `should [expected behavior] when [condition]`

#### 3. Mock Strategy Guidelines
**External Services**: Always mock (Gmail API, OpenAI)
**Database**: Mock for unit tests, real for integration tests
**Time-Dependent**: Use vi.setSystemTime() for consistent results

### Component Testing Best Practices

#### 1. User-Centric Testing
```typescript
// Focus on user interactions, not implementation
test('should submit document when upload button is clicked', async () => {
  render(<DocumentUpload onUpload={mockOnUpload} />);
  
  const fileInput = screen.getByLabelText(/upload document/i);
  const uploadButton = screen.getByRole('button', { name: /upload/i });
  
  await user.upload(fileInput, testFile);
  await user.click(uploadButton);
  
  expect(mockOnUpload).toHaveBeenCalledWith(testFile);
});
```

#### 2. Accessibility Testing
```typescript
// Ensure components are accessible
test('should have proper ARIA labels for screen readers', () => {
  render(<ChatMessage message={urgentMessage} />);
  
  const message = screen.getByRole('article');
  expect(message).toHaveAttribute('aria-label', 'Urgent notification');
  
  const timestamp = screen.getByText(/2 minutes ago/i);
  expect(timestamp).toBeInTheDocument();
});
```

### API Testing Best Practices

#### 1. Realistic Request/Response Testing
```typescript
describe('POST /api/v1/documents/upload', () => {
  it('should process PDF documents and extract text', async () => {
    const response = await request(app)
      .post('/api/v1/documents/upload')
      .attach('file', 'test-files/worksafe-notice.pdf')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    
    expect(response.body).toMatchObject({
      documentId: expect.any(String),
      extractedText: expect.stringContaining('WorkSafe'),
      urgencyLevel: 'HIGH'
    });
  });
});
```

#### 2. Security Testing
```typescript
// Test unauthorized access attempts
it('should reject requests without valid authentication', async () => {
  await request(app)
    .get('/api/v1/admin/users')
    .expect(401)
    .expect(res => {
      expect(res.body.error).toBe('Unauthorized access');
    });
});
```

### Performance Testing Guidelines

#### 1. Race Condition Prevention
```typescript
// Test server initialization order
it('should initialize scheduler before health endpoint access', async () => {
  // Verify scheduler exists before health checks
  expect(scheduler).toBeDefined();
  expect(scheduler.getStatus).toBeInstanceOf(Function);
  
  // Test concurrent health checks don't cause race conditions
  const concurrentRequests = Array.from({ length: 10 }, () => 
    request(app).get('/health')
  );
  
  const responses = await Promise.all(concurrentRequests);
  responses.forEach(response => {
    expect(response.status).toBe(200);
    expect(response.body.services.scheduler).toBeDefined();
  });
});
```

#### 2. Timeout Configuration
- **Database Operations**: 5-10 seconds
- **File Upload Processing**: 30 seconds  
- **Unit Tests**: 5 seconds
- **Integration Tests**: 15 seconds

## Developer Workflow

### Running Tests During Development

#### 1. Watch Mode (Recommended)
```bash
# Start watch mode for instant feedback
npm run test:watch

# Module-specific watch mode
cd frontend && npm run test:watch
cd backend && npm run test:watch
```

#### 2. Pre-commit Testing
```bash
# Run full test suite before committing
npm run test
npm run lint
npm run type-check
```

#### 3. Coverage Analysis
```bash
# Generate detailed coverage report
npm run test:coverage

# View coverage report in browser
open ./coverage/index.html
```

### Adding New Tests

#### 1. Component Tests
```bash
# Create component with co-located test
mkdir src/components/ui/new-component
touch src/components/ui/new-component/NewComponent.tsx
touch src/components/ui/new-component/NewComponent.test.tsx
touch src/components/ui/new-component/NewComponent.stories.tsx
```

#### 2. Integration Tests
```bash
# Add to existing test directory
touch backend/src/__tests__/new-feature.test.ts
```

### Debugging Test Failures

#### 1. Verbose Output
```bash
# Run with detailed output
npm run test -- --reporter=verbose

# Debug specific test file
npx vitest run path/to/test.test.ts --reporter=verbose
```

#### 2. Debug Mode
```bash
# Run tests in debug mode
npx vitest --inspect-brk path/to/test.test.ts
```

#### 3. Common Issues and Solutions

**Database Connection Timeouts**:
- Check Docker PostgreSQL container is running
- Verify DATABASE_URL in test environment
- Increase timeout in vitest.config.ts

**Mock Issues**:
- Ensure mocks are set up before imports
- Clear mocks between tests with vi.clearAllMocks()
- Verify mock implementation matches actual API

**Async Test Failures**:
- Add proper await keywords
- Increase timeout for slow operations
- Check promise resolution/rejection handling

## Test Maintenance and Evolution

### Regular Maintenance Tasks

#### 1. Coverage Monitoring
- Review coverage reports weekly
- Identify untested code paths
- Add tests for new features immediately

#### 2. Mock Updates
- Update external API mocks when services change
- Verify mock data reflects real API responses
- Test with both success and error scenarios

#### 3. Performance Monitoring
- Monitor test execution times
- Optimize slow-running tests
- Update timeout configurations as needed

### Continuous Improvement

#### 1. Test Quality Reviews
- Regular review of test effectiveness
- Remove redundant or brittle tests
- Improve test clarity and maintainability

#### 2. Framework Updates
- Keep testing dependencies current
- Adopt new testing patterns and best practices
- Evaluate new tools for testing efficiency

### Migration Testing Strategy

#### Stack Upgrade Testing
When upgrading core dependencies (React, TypeScript, Vitest, etc.), follow these testing protocols:

**Pre-Migration Baseline:**
- Establish test coverage baseline with `npm run test:coverage`
- Document current test execution times and performance metrics
- Record any existing test flakiness or known issues

**During Migration Testing:**
- Run test suite after each major dependency upgrade
- Monitor for new TypeScript errors or test failures
- Verify Storybook visual components still render correctly
- Test authentication flows and API integrations thoroughly

**Post-Migration Validation:**
- Compare test coverage to pre-migration baseline
- Verify all critical user paths still function correctly
- Run extended test suite including integration tests
- Performance test to ensure no regression in test execution speed

For detailed migration procedures, see [Migration Guide](./migration-guide.md).

This testing strategy ensures our AI-powered administrative assistant maintains high quality standards while enabling rapid development and reliable deployment for Australian trade businesses.