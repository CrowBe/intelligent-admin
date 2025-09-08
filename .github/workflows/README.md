# GitHub Actions Workflows

## Overview
This directory contains CI/CD workflows for the Intelligent Admin project. The workflows are designed to provide comprehensive quality assurance with performance monitoring.

## Workflows

### 1. `ci.yml` - Main CI/CD Pipeline
**Triggers**: Push to main/develop, PRs to main
**Purpose**: Core quality gates with build validation
- **Dependencies**: Install and cache npm packages
- **Linting**: ESLint validation across all packages  
- **Type Checking**: TypeScript strict mode validation
- **Database Setup**: PostgreSQL for integration tests
- **Testing**: Full test suite with coverage
- **Coverage Upload**: Codecov integration
- **Build Validation**: Frontend and backend builds
- **Security Scanning**: CodeQL, TruffleHog, npm audit
- **Code Quality**: Prettier, bundle analysis, dependency checks

### 2. `coverage.yml` - Coverage Reporting
**Triggers**: Push to main/develop, PRs to main
**Purpose**: Detailed coverage analysis and reporting
- **Individual Package Coverage**: Separate coverage for backend, frontend, shared
- **Aggregated Coverage**: Combined coverage report
- **Multiple Providers**: Codecov and Coveralls integration
- **PR Comments**: Coverage change reporting on pull requests
- **Coverage Badges**: Auto-generated badges for README

### 3. `performance.yml` - Performance Testing
**Triggers**: Push to main, PRs to main, weekly schedule
**Purpose**: Performance benchmarking and validation
- **Test Suite Performance**: < 2 minutes total
- **Individual Package Performance**: Backend < 30s, Frontend < 15s, Shared < 5s
- **Build Performance**: < 60 seconds
- **Performance Regression Detection**: Comparison with targets
- **Weekly Monitoring**: Scheduled performance checks

### 4. `quality-gates.yml` - Quality Analysis
**Triggers**: Push to main/develop, PRs to main  
**Purpose**: Comprehensive code quality analysis
- **Linting Analysis**: Detailed error/warning reporting
- **Type Safety**: Strict TypeScript validation
- **Formatting**: Prettier consistency checks
- **Dependency Security**: High-severity vulnerability detection
- **Unused Dependencies**: Detection and reporting
- **Test Quality**: Performance and coverage analysis

## Coverage Thresholds

### Backend (80% Target)
- Lines: 80%
- Functions: 80% 
- Branches: 75%
- Statements: 80%

### Frontend (70% Target)
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

### Shared (90% Target)
- Lines: 90%
- Functions: 90%
- Branches: 85%
- Statements: 90%

### Global Aggregate (75% Target)
- Lines: 75%
- Functions: 75%
- Branches: 70%
- Statements: 75%

## Performance Targets

| Component | Target | Enforced |
|-----------|---------|----------|
| Full Test Suite | < 2 minutes | ✅ |
| Backend Tests | < 30 seconds | ✅ |
| Frontend Tests | < 15 seconds | ✅ |
| Shared Tests | < 5 seconds | ✅ |
| Build Process | < 60 seconds | ✅ |
| CI Pipeline | < 5 minutes | ✅ |

## Security Gates

### High Priority (Fails CI)
- High severity npm audit vulnerabilities
- Secrets detection by TruffleHog
- CodeQL security issues
- Type safety violations

### Medium Priority (Reported)
- Moderate severity vulnerabilities
- Unused dependencies
- Code formatting issues
- Performance regressions

## Required Secrets

Set these secrets in your GitHub repository settings:

```bash
# Coverage Reporting
CODECOV_TOKEN=your_codecov_token

# Coverage Badges (Optional)
GIST_ID=your_gist_id_for_badges
GIST_TOKEN=your_personal_access_token
```

## Local Testing

Test workflows locally before pushing:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run type checking  
npm run type-check

# Run tests with coverage
npm run test:coverage

# Check formatting
npx prettier --check "**/*.{js,jsx,ts,tsx,json,md,yml,yaml}"

# Security audit
npm audit --audit-level=high

# Build validation
cd frontend && npm run build
cd ../backend && npm run build
```

## Workflow Status

- ✅ **CI/CD Pipeline**: Quality gates enforced
- ✅ **Coverage Reporting**: Multi-provider setup
- ✅ **Performance Testing**: Automated benchmarking
- ✅ **Quality Gates**: Comprehensive analysis
- 🔄 **Security Scanning**: CodeQL + vulnerability detection
- 📊 **Metrics**: Performance and coverage tracking

## Troubleshooting

### Common Issues

1. **Coverage Upload Failures**
   - Check `CODECOV_TOKEN` secret
   - Verify coverage files are generated

2. **Performance Test Failures**
   - Check database connectivity
   - Verify test environment setup

3. **Linting Failures**
   - Run `npm run lint:fix` locally
   - Check ESLint configuration

4. **Build Failures**
   - Verify all dependencies installed
   - Check TypeScript configuration

### Debug Commands

```bash
# Check workflow syntax
npx @github/workflow-validator .github/workflows/*.yml

# Test database connection
psql postgresql://postgres:test@localhost:5432/test -c "SELECT 1"

# Verify coverage generation
npm run test:coverage && ls -la coverage/
```