# Stack Migration & Upgrade Guide

## Overview

This guide provides step-by-step instructions for upgrading core dependencies and managing stack migrations in the Intelligent Admin monorepo. The guide ensures safe upgrades while maintaining the project's strict TypeScript, testing, and code quality standards.

## Current Technology Stack

### Core Dependencies (as of December 2024)
- **Node.js**: 18.0+ (specified in package.json engines)
- **TypeScript**: 5.7.2 (shared across all packages)
- **React**: 19.1.1 (frontend)
- **Express.js**: 4.19.2 (backend)
- **PostgreSQL**: Latest (via Prisma)
- **Prisma ORM**: 6.14.0 (backend)
- **Vite**: 7.0.6 (frontend build tool)
- **Vitest**: 3.2.4 (testing framework)
- **ESLint**: 9.x (linting across all packages)

### Package-Specific Versions
- **Frontend**: React 19.x, Vite 7.x, Tailwind CSS 4.x
- **Backend**: Express 4.x, Prisma 6.x, Winston 3.x
- **Shared**: TypeScript utilities and type definitions

## Migration Strategy

### 1. Pre-Migration Assessment

Before starting any upgrade, perform a comprehensive assessment:

```bash
# Check for outdated dependencies across all packages
npm run install:all
npx npm-check-updates --deep --interactive

# Assess dependency health
npx depcheck --skip-missing
```

#### Security Audit
```bash
# Run security audit across all packages
npm audit --workspaces
npm audit fix --workspaces

# Check for known vulnerabilities
npx audit-ci --config audit-ci.json
```

#### Current Test Coverage
```bash
# Establish baseline test coverage before migration
npm run test:coverage
npm run test:frontend
npm run test:backend
npm run test:shared
```

### 2. Migration Planning

#### Priority Order for Upgrades
1. **Security patches** - Apply immediately
2. **TypeScript** - Core type system updates
3. **Node.js** - Runtime environment
4. **Build tools** (Vite, ESLint) - Development infrastructure
5. **Testing framework** (Vitest) - Quality assurance
6. **React/Express** - Application frameworks
7. **UI libraries** - User interface components

#### Breaking Change Analysis
Create a migration plan document:
```bash
# Create migration tracking file
touch docs/migration-plan-$(date +%Y%m%d).md
```

### 3. Step-by-Step Upgrade Process

#### Phase 1: TypeScript & Core Tools Upgrade

**TypeScript Upgrade:**
```bash
# Check current TypeScript version compatibility
npx tsc --version

# Upgrade TypeScript across all packages
npm install typescript@latest --save-dev
cd frontend && npm install typescript@latest --save-dev
cd ../backend && npm install typescript@latest --save-dev
cd ../shared && npm install typescript@latest --save-dev

# Verify TypeScript compilation
npm run type-check
```

**ESLint Upgrade:**
```bash
# Upgrade ESLint and related plugins
npm install eslint@latest --save-dev
npm install @typescript-eslint/eslint-plugin@latest --save-dev
npm install @typescript-eslint/parser@latest --save-dev

# Test linting rules
npm run lint
npm run lint:fix
```

#### Phase 2: Build Tools & Development Environment

**Vite Upgrade (Frontend):**
```bash
cd frontend

# Check Vite compatibility with current React version
npm install vite@latest @vitejs/plugin-react@latest --save-dev

# Test build process
npm run build
npm run preview
```

**Vitest Upgrade (All Packages):**
```bash
# Upgrade Vitest and coverage tools
npm install vitest@latest @vitest/coverage-v8@latest --save-dev

# Update workspace-specific test configs
cd frontend && npm install vitest@latest @vitest/ui@latest --save-dev
cd ../backend && npm install vitest@latest @vitest/ui@latest --save-dev

# Verify test suite functionality
npm run test:all
npm run test:coverage
```

#### Phase 3: Runtime & Framework Upgrades

**Node.js Upgrade:**
```bash
# Check current Node.js version requirements
node --version
npm --version

# Update package.json engines field if upgrading Node.js
# Edit package.json: "engines": { "node": ">=20.0.0", "npm": ">=10.0.0" }

# Test with new Node.js version
npm run dev
npm run test
```

**React Upgrade (Frontend):**
```bash
cd frontend

# Check React 19+ compatibility
npm install react@latest react-dom@latest
npm install @types/react@latest @types/react-dom@latest --save-dev

# Update React Testing Library for React 19
npm install @testing-library/react@latest --save-dev

# Test React components
npm run test:frontend
npm run storybook
```

**Express.js Upgrade (Backend):**
```bash
cd backend

# Upgrade Express and middleware
npm install express@latest
npm install @types/express@latest --save-dev

# Upgrade security middleware
npm install helmet@latest cors@latest morgan@latest

# Test API endpoints
npm run dev:test
npm run test:backend
```

#### Phase 4: Database & ORM Upgrades

**Prisma Upgrade:**
```bash
cd backend

# Upgrade Prisma CLI and client
npm install prisma@latest --save-dev
npm install @prisma/client@latest

# Regenerate Prisma client
npm run db:generate

# Test database connectivity
npm run db:studio
```

**Database Migration Testing:**
```bash
# Create test migration to verify Prisma functionality
npx prisma migrate dev --name test-migration-compatibility

# Rollback test migration
npx prisma migrate reset

# Verify production migrations still work
npm run db:migrate
```

#### Phase 5: UI Libraries & Dependencies

**Frontend UI Library Upgrades:**
```bash
cd frontend

# Upgrade Radix UI components
npm install @radix-ui/react-*@latest

# Upgrade Tailwind CSS
npm install tailwindcss@latest @tailwindcss/vite@latest

# Upgrade other UI dependencies
npm install @headlessui/react@latest @heroicons/react@latest
npm install lucide-react@latest date-fns@latest

# Test component library
npm run storybook
npm run test:visual
```

## Breaking Changes Management

### React 19 Breaking Changes
- **Automatic batching**: Update state management patterns
- **Strict mode**: Review useEffect dependencies
- **Concurrent features**: Update Suspense usage

### TypeScript 5.7+ Breaking Changes
- **Stricter type checking**: Review any/unknown usage
- **Import/export changes**: Update module syntax
- **Generic constraints**: Review complex type definitions

### Vite 7+ Breaking Changes
- **Configuration changes**: Update vite.config.ts
- **Plugin compatibility**: Verify plugin versions
- **Build output**: Review dist structure

### ESLint 9+ Breaking Changes
- **Flat config**: Update eslint.config.js format
- **Plugin compatibility**: Verify plugin versions
- **Rule changes**: Review custom rule configurations

## Testing Strategy During Migration

### Comprehensive Testing Protocol

**1. Pre-Migration Baseline:**
```bash
# Establish baseline metrics
npm run test:coverage > migration-baseline-coverage.txt
npm run lint > migration-baseline-lint.txt
npm run type-check > migration-baseline-types.txt
```

**2. Component-Level Testing:**
```bash
# Test UI components after React upgrade
cd frontend
npm run storybook:ci
npm run test:storybook

# Test API endpoints after Express upgrade
cd ../backend
npm run dev:test
npm run test:backend
```

**3. Integration Testing:**
```bash
# Test full stack integration
npm run dev
npm run test

# Test database operations
cd backend
npm run db:studio
npm run test # Includes database tests
```

**4. Performance Testing:**
```bash
# Frontend performance
cd frontend
npm run build
npm run preview
# Check bundle size and load times

# Backend performance
cd ../backend
npm run build
npm run start
# Load test API endpoints
```

### Critical Test Cases
- **Authentication flow** (Kinde + Google OAuth)
- **Email intelligence** processing
- **File upload** and document processing
- **Chat interface** real-time updates
- **Database migrations** and data integrity
- **Mobile responsiveness** (co-located components)

## Rollback Procedures

### Git-Based Rollback Strategy

**1. Branch Protection:**
```bash
# Create migration branch for safe testing
git checkout -b migration/stack-upgrade-$(date +%Y%m%d)
git push -u origin migration/stack-upgrade-$(date +%Y%m%d)
```

**2. Package Lock Backup:**
```bash
# Backup lock files before migration
cp package-lock.json package-lock.json.backup
cp frontend/package-lock.json frontend/package-lock.json.backup
cp backend/package-lock.json backend/package-lock.json.backup
```

**3. Database Backup:**
```bash
# Backup database schema
cd backend
npx prisma db pull --file-name schema-backup.prisma
npx prisma migrate diff --to-schema-data-source schema-backup.prisma
```

### Rollback Execution

**Emergency Rollback:**
```bash
# Quick rollback to previous commit
git reset --hard HEAD~1
npm run install:all
npm run setup

# Verify functionality
npm run test
npm run dev
```

**Selective Rollback:**
```bash
# Rollback specific package upgrades
git checkout HEAD~1 -- package.json frontend/package.json
npm run install:all

# Rollback database changes if needed
cd backend
npx prisma migrate reset
npm run db:migrate
```

**Verification After Rollback:**
```bash
# Comprehensive verification
npm run lint
npm run type-check
npm run test:all
npm run build
```

## Best Practices for Monorepo Dependency Management

### 1. Synchronized Upgrades
- **Coordinate versions** across packages to avoid conflicts
- **Use workspace commands** for simultaneous updates
- **Test integration** between packages after upgrades

### 2. Incremental Migration
- **Upgrade one package at a time** when possible
- **Test thoroughly** before moving to next package
- **Document compatibility** between package versions

### 3. Version Pinning Strategy
```json
{
  "devDependencies": {
    "typescript": "~5.7.2",
    "vitest": "~3.2.4",
    "eslint": "~9.32.0"
  }
}
```

### 4. Automated Dependency Management
```bash
# Set up automated dependency checking
npm install npm-check-updates --save-dev

# Configure automated updates (use with caution)
echo '{
  "upgrade": true,
  "target": "patch",
  "reject": ["react", "express", "typescript"]
}' > .ncurc.json
```

### 5. CI/CD Integration
```yaml
# .github/workflows/dependency-check.yml
name: Dependency Security Check
on:
  schedule:
    - cron: '0 8 * * 1' # Weekly Monday 8AM
  push:
    branches: [main, testing-improvements]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm audit --audit-level high
      - run: npx depcheck
```

## Migration Checklist

### Pre-Migration
- [ ] Run full test suite and establish baseline coverage
- [ ] Backup package-lock.json files
- [ ] Document current dependency versions
- [ ] Create migration branch
- [ ] Review breaking changes documentation
- [ ] Plan rollback strategy

### During Migration
- [ ] Upgrade dependencies in priority order
- [ ] Test after each major upgrade
- [ ] Update configuration files as needed
- [ ] Resolve TypeScript errors immediately
- [ ] Update ESLint rules if necessary
- [ ] Verify build processes work

### Post-Migration
- [ ] Run comprehensive test suite
- [ ] Verify all lint rules pass
- [ ] Test development and production builds
- [ ] Validate authentication flows
- [ ] Test API endpoints thoroughly
- [ ] Verify mobile responsiveness
- [ ] Update documentation
- [ ] Create pull request with detailed changelog

### Production Deployment
- [ ] Deploy to staging environment first
- [ ] Run acceptance tests
- [ ] Monitor error rates and performance
- [ ] Prepare rollback plan
- [ ] Deploy to production with monitoring
- [ ] Post-deployment verification

## Emergency Contacts & Resources

### Internal Resources
- **Architecture Documentation**: `/docs/system-architecture.md`
- **Testing Strategy**: `/docs/testing-strategy.md`
- **Development Environment**: `/docs/development-environment.md`

### External Resources
- **React 19 Migration**: https://react.dev/blog/2024/12/05/react-19
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Migration Guide**: https://vitejs.dev/guide/migration.html
- **Prisma Upgrade Guide**: https://www.prisma.io/docs/guides/upgrade-guides

### Support Channels
- **TypeScript Issues**: GitHub Issues + Stack Overflow
- **React Issues**: React GitHub Issues + Discord
- **Vite Issues**: Vite GitHub Issues
- **Prisma Issues**: Prisma GitHub Issues + Community

## Conclusion

This migration guide provides a systematic approach to upgrading the Intelligent Admin stack while maintaining the project's high standards for code quality, testing coverage, and security. Always prioritize testing and have a rollback plan ready before starting any major upgrade.

For questions or issues during migration, refer to the project's CLAUDE.md file for development guidelines and the comprehensive documentation in the `/docs/` folder.