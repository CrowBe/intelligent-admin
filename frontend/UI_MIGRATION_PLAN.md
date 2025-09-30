# Figma Frontend Migration Plan

**Status**: 🟡 In Progress
**Timeline**: 6-8 weeks (7 stages)
**Current Stage**: Stage 1 - Understanding the New UI

---

## Progress Tracking

- [x] **Stage 1**: Understanding the New UI ✅ ANALYSIS COMPLETE
- [ ] **Stage 2**: Tech Stack Upgrade Planning (IN PROGRESS - 2.2 Complete)
- [ ] **Stage 3**: Component Migration Strategy
- [ ] **Stage 4**: Authentication Integration
- [ ] **Stage 5**: Dark Mode & Theme System
- [ ] **Stage 6**: Backend Integration
- [ ] **Stage 7**: Testing & Quality Assurance

## Plan Amendments

### Amendment [2025-10-01]

**Deviation**: Upgraded `react-day-picker` from v8.10.1 to v9.11.0
**Rationale**: Version 8.10.1 required `date-fns@^2.28.0 || ^3.0.0` but project uses `date-fns@4.1.0` (actively used for chat timestamps). Version 9.11.0 removes date-fns peer dependency entirely, eliminating conflict while maintaining calendar functionality.
**Impact**: None - v9 is backward compatible with same API. Calendar component will need minor import adjustments.
**Evidence**:
- Current codebase uses `date-fns@4.1.0` in 3 chat components (ChatInterface, ChatSidebar, ChatMessage)
- npm view shows v9.11.0 has no date-fns peer dependency
- Installation succeeded with 127 packages added, 0 vulnerabilities after audit fix
**Confidence**: 95%

---

## Executive Summary

**Migration Approach**: Staged, incremental migration from current Kinde-authenticated React app to new Figma-generated UI while preserving all existing functionality and enhancing user experience.

**Key Strategy**: Parallel development approach - build new UI components alongside existing system, then swap in stages with comprehensive testing at each phase.

**Success Criteria**:
- Zero authentication/security regressions
- 80%+ test coverage maintained
- All existing backend integrations functional
- Improved mobile responsiveness
- Dark mode fully functional
- No user data loss

---

## Stage 1: Understanding the New UI

**Objective**: Analyze the new_src folder structure, document components, and identify differences from current implementation.

### Tasks

- [x] **Inventory New Components** (57 components total)
  - Analysis complete: 8 page components, 47 UI library components, 2 utility components

- [x] **Document New UI Patterns**
  - Single-page app with tab-based navigation (Dashboard, Integrations, Analytics)
  - Responsive sidebar (mobile overlay + desktop persistent)
  - Contextual AI chat with section context
  - Accordion-based dashboard with expandable sections
  - Mock data for emails, schedule, leads
  - Gradient accents for AI features (cyan-to-teal)

- [x] **Feature Comparison Matrix**
  - Created comparison table of new vs current features
  - Identified features to preserve: Email Intelligence, Industry Knowledge
  - Identified features to add: Integrations grid, contextual chat, quick actions

- [x] **Identify Missing Features**
  - Email Intelligence Dashboard (needs preservation)
  - Industry Knowledge Dashboard (needs preservation)
  - Settings page (not in new UI)
  - Real backend integration (needs implementation)
  - Kinde authentication (needs replacement of localStorage)

### Completion Checklist

- [x] All new components documented
- [x] UI patterns identified and documented
- [x] Feature comparison completed
- [x] Missing features identified

**✅ Mark Stage 1 Complete**: Once all tasks above are checked, update progress tracking at top of document.

---

## Stage 2: Tech Stack Upgrade Planning

**Objective**: Identify version conflicts, plan package installations, and prepare configuration updates.

### Tasks

#### 2.1 Version Compatibility Analysis

- [x] **Compare Dependencies**
  - Current: React 19.1.1, Tailwind v4.1.11, partial shadcn-ui, Kinde auth
  - New: React 19.1.1, Tailwind v4, full shadcn-ui (47 components)
  - Action: Add 35+ missing shadcn-ui components

- [x] **Document Required Packages**
  - List all shadcn-ui components to install
  - Verify no version conflicts
  - Check for deprecated packages
  - ✅ 46 components identified, 35 new packages needed

#### 2.2 Install Missing shadcn-ui Components

- [x] **Run Component Installation**
  ```bash
  # Installed via npm (Radix UI + third-party deps)
  npm install --save \
    @radix-ui/react-{accordion,alert-dialog,aspect-ratio,checkbox,...} \
    react-day-picker@9.11.0 embla-carousel-react recharts vaul \
    react-resizable-panels sonner next-themes react-hook-form
  ```
  ✅ 127 packages added, 0 vulnerabilities

- [x] **Verify Installation**
  - ✅ All 35 required packages installed (21 Radix UI + 8 third-party + 6 utilities)
  - ✅ No version conflicts (React 19.1.1, Tailwind v4, TypeScript 5.8.3)
  - ✅ Security audit passed (Vite updated from 7.1.3 to 7.1.5)
  - Note: Components will be migrated to `src/components/ui/` in Stage 3

#### 2.3 Tailwind Configuration Updates

- [x] **Audit CSS Files**
  - ✅ Compared `src/index.css` (115 lines) vs `new_src/index.css` (3009 lines)
  - ✅ Identified shadcn-ui theme variables to merge
  - ✅ Preserved existing responsive utilities and custom animations

- [x] **Merge CSS Custom Properties**
  - ✅ Backup created: `src/index.css.backup` (2.6KB)
  - ✅ Merged shadcn-ui theme variables (:root and .dark)
  - ✅ Added accordion-down/up animations
  - ✅ Preserved all existing utilities (scrollbar, buttons, messages)
  - ✅ Added color variable fallbacks for compatibility

- [x] **Test Tailwind Build**
  ```bash
  npm run build
  ```
  - ✅ CSS build successful: 104.87 kB (17.16 kB gzipped)
  - ✅ No CSS-related errors
  - Note: Pre-existing TypeScript errors unrelated to CSS merge

#### 2.4 TypeScript Strict Mode Compliance

- [x] **Audit New Components for TypeScript Issues**
  - ✅ 61 files audited (9 page components, 48 UI components, 4 utilities)
  - ✅ 24 violations found: 9 critical `any` types, 15 missing return types
  - ✅ All violations documented with line numbers and fixes

- [x] **Create Fix List**
  - **Critical (9 errors)**:
    - App.tsx: `sectionContext` data type, `handleChatAboutSection` param
    - contextual-chat-interface.tsx: 5 `any` parameters in functions
    - chat-interface.tsx: `BusinessInfo` callback type
    - quick-actions.tsx: `onChatAbout` context param
  - **Warnings (15)**:
    - Missing return types on 9 page components
    - Missing return types on helper functions
  - **Shared types needed**: `SectionContextData`, `PageContext`, `BusinessInfo`

- [x] **Document Fix Strategy** (fixes to be applied in Stage 3 during migration)
  - Phase 1: Create shared type definitions file
  - Phase 2: Fix critical `any` types (2-3 hours)
  - Phase 3: Add return type annotations (1-2 hours)
  - Total effort: 5-8 hours during component migration

#### 2.5 ESLint Configuration Review

- [x] **Analyze New Components Against ESLint Rules**
  - ✅ Analyzed all 61 files for line count violations
  - ✅ Identified 6 files exceeding 300-line limit
  - ✅ Function complexity/length to be checked during migration
  - ✅ Parameter count violations minimal (mostly shadcn-ui components)

- [x] **Document Violations**
  - **Critical (>300 lines)**:
    - `sidebar.tsx`: 726 lines (shadcn-ui component - keep as-is)
    - `quick-actions.tsx`: 407 lines ❌ **MUST REFACTOR**
    - `App.tsx`: 378 lines ❌ **MUST REFACTOR**
    - `landing-page.tsx`: 356 lines ❌ **MUST REFACTOR**
    - `chart.tsx`: 353 lines (shadcn-ui component - keep as-is)
  - **Borderline (250-300 lines)**:
    - `contextual-chat-interface.tsx`: 287 lines (acceptable)
    - `menubar.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`: 250+ lines (shadcn-ui)

- [x] **Plan Refactoring**
  - **App.tsx** (378 lines → 3 files):
    - Extract `Dashboard` component (~150 lines)
    - Extract `DashboardSidebar` component (~80 lines)
    - Keep `App` for auth logic (~150 lines)
  - **quick-actions.tsx** (407 lines → 4 files):
    - Extract `EmailSummaryCard` component (~120 lines)
    - Extract `ScheduleCard` component (~100 lines)
    - Extract `LeadsCard` component (~100 lines)
    - Keep `QuickActions` as container (~90 lines)
  - **landing-page.tsx** (356 lines → 3 files):
    - Extract `HeroSection` component (~100 lines)
    - Extract `FeaturesList` component (~120 lines)
    - Extract `LoginForm` and `SignUpForm` components (~80 lines each)
    - Keep `LandingPage` as container (~100 lines)

#### 2.6 Co-located Component Structure Planning

- [x] **Document Current Structure**
  ```
  src/components/ui/button/
    ├── index.ts              # Re-exports: export { Button } from './Button'
    ├── Button.tsx            # Component implementation
    ├── Button.stories.tsx    # Storybook visual testing
    └── Button.test.tsx       # Vitest unit tests
  ```
  - ✅ Follows project CLAUDE.md guidelines
  - ✅ Compatible with shadcn-ui (imports still work via index.ts)
  - ✅ 80% test coverage requirement met

- [x] **Document New Structure** (flat in new_src)
  ```
  new_src/components/ui/
    ├── button.tsx            # Component only (no tests/stories)
    ├── card.tsx
    └── [46 other flat files]
  ```
  - ⚠️ No test files
  - ⚠️ No Storybook stories
  - ⚠️ No co-location

- [x] **Define Migration Strategy**
  - **Step 1**: Create co-located folder structure
    ```
    src/components/ui/button/
      ├── index.ts           # export { Button } from './Button'
      ├── Button.tsx         # Copy from new_src, fix TypeScript/ESLint
      ├── Button.stories.tsx # Create comprehensive stories
      └── Button.test.tsx    # Create unit tests (80%+ coverage)
    ```
  - **Step 2**: Migration workflow per component (from Stage 3 plan):
    1. Copy component from `new_src/` to co-located folder
    2. Create `index.ts` re-export
    3. Fix TypeScript violations (add types, return types)
    4. Fix ESLint violations (refactor if >300 lines)
    5. Write Storybook story with light/dark variants
    6. Write Vitest tests with 80%+ coverage
    7. Update `src/components/ui/index.ts` (if UI component)
    8. Verify in Storybook and run tests
  - **Step 3**: Preserve shadcn-ui compatibility
    - Import paths unchanged: `import { Button } from '@/components/ui/button'`
    - CLI commands still work: `npx shadcn add button`
    - Path aliases work: `@/components` → `src/components`

### Completion Checklist

- [x] Version compatibility verified (React 19.1.1, Tailwind v4, TypeScript 5.8.3)
- [x] All missing shadcn-ui components installed (35 packages: 21 Radix UI + 8 third-party + 6 utilities)
- [x] Tailwind CSS configuration updated and tested (272 lines merged, build successful)
- [x] TypeScript violations documented (9 critical `any` types, 15 missing return types)
- [x] ESLint violations documented with refactor plan (3 files >300 lines need refactoring)
- [x] Co-located structure migration strategy defined (8-step workflow per component)
- [ ] All configuration changes committed to git

**✅ Mark Stage 2 Complete**: Once all tasks above are checked, update progress tracking at top of document.

---

## Stage 3: Component Migration Strategy

**Objective**: Systematically migrate components from new_src to src with co-located tests and stories.

### Component Migration Workflow

For **each component**, follow this workflow:

1. Copy component from `new_src/` to co-located structure in `src/`
2. Create `index.ts` re-export file
3. Write Storybook story (`.stories.tsx`)
4. Write Vitest test (`.test.tsx`)
5. Fix ESLint violations
6. Test in Storybook
7. Run tests: `npm run test`
8. Update `src/components/ui/index.ts` (if UI component)

### Tasks

#### 3.1 Priority 1: Core UI Components (Upgrade Existing)

- [ ] **button.tsx** → `src/components/ui/button/Button.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **card.tsx** → `src/components/ui/card/Card.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **badge.tsx** → `src/components/ui/badge/Badge.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **input.tsx** → `src/components/ui/input/Input.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **dropdown-menu.tsx** → `src/components/ui/dropdown-menu/DropdownMenu.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **avatar.tsx** → `src/components/ui/avatar/Avatar.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **separator.tsx** → `src/components/ui/separator/Separator.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **skeleton.tsx** → `src/components/ui/skeleton/Skeleton.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **textarea.tsx** → `src/components/ui/textarea/Textarea.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

- [ ] **alert.tsx** → `src/components/ui/alert/Alert.tsx`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

#### 3.2 Priority 2: New UI Library Components (25 most common, defer rest)

- [ ] **accordion.tsx** → `src/components/ui/accordion/`
- [ ] **dialog.tsx** → `src/components/ui/dialog/`
- [ ] **drawer.tsx** → `src/components/ui/drawer/`
- [ ] **select.tsx** → `src/components/ui/select/`
- [ ] **sheet.tsx** → `src/components/ui/sheet/`
- [ ] **tabs.tsx** → `src/components/ui/tabs/`
- [ ] **tooltip.tsx** → `src/components/ui/tooltip/`
- [ ] **popover.tsx** → `src/components/ui/popover/`
- [ ] **command.tsx** → `src/components/ui/command/`
- [ ] **scroll-area.tsx** → `src/components/ui/scroll-area/`
- [ ] **switch.tsx** → `src/components/ui/switch/`
- [ ] **checkbox.tsx** → `src/components/ui/checkbox/`
- [ ] **label.tsx** → `src/components/ui/label/`
- [ ] **form.tsx** → `src/components/ui/form/`
- [ ] **table.tsx** → `src/components/ui/table/`
- [ ] **sonner.tsx** → `src/components/ui/sonner/` (toast notifications)
- [ ] **progress.tsx** → `src/components/ui/progress/`
- [ ] **slider.tsx** → `src/components/ui/slider/`
- [ ] **radio-group.tsx** → `src/components/ui/radio-group/`
- [ ] **calendar.tsx** → `src/components/ui/calendar/`
- [ ] **sidebar.tsx** → `src/components/ui/sidebar/`
- [ ] **breadcrumb.tsx** → `src/components/ui/breadcrumb/`
- [ ] **pagination.tsx** → `src/components/ui/pagination/`
- [ ] **collapsible.tsx** → `src/components/ui/collapsible/`
- [ ] **hover-card.tsx** → `src/components/ui/hover-card/`

**Note**: Remaining components (alert-dialog, aspect-ratio, carousel, chart, context-menu, input-otp, menubar, navigation-menu, resizable, toggle, toggle-group) can be migrated as needed or deferred to future work.

#### 3.3 Priority 3: Utility Components

- [ ] **use-mobile.ts** → `src/hooks/useMobile.ts`
  - [ ] Copy hook
  - [ ] Write tests
  - [ ] Update imports

- [ ] **utils.ts** → Merge with `src/lib/utils.ts`
  - [ ] Compare implementations
  - [ ] Merge `cn` helper (if different)
  - [ ] Write tests for merged utilities

- [ ] **ImageWithFallback.tsx** → `src/components/ui/image-with-fallback/`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Fix ESLint
  - [ ] Verify in Storybook

#### 3.4 Priority 4: Theme Components

- [ ] **theme-provider.tsx** → `src/contexts/ThemeProvider.tsx`
  - [ ] Copy provider
  - [ ] Write tests for theme switching
  - [ ] Test localStorage persistence
  - [ ] Test system theme detection

- [ ] **theme-toggle.tsx** → `src/components/ui/theme-toggle/`
  - [ ] Copy component
  - [ ] Create index.ts
  - [ ] Write story
  - [ ] Write tests
  - [ ] Integrate with ThemeProvider

#### 3.5 Priority 5: Feature Components (Defer to later stages)

**Note**: These will be handled in Stages 4-6 with authentication and backend integration.

- Defer: `landing-page.tsx`
- Defer: `dashboard-header.tsx`
- Defer: `chat-fab.tsx`
- Defer: `contextual-chat-interface.tsx`
- Defer: `quick-actions.tsx`
- Defer: `integrations-grid.tsx`
- Defer: `integration-card.tsx`

### Completion Checklist

- [ ] All Priority 1 components (core UI) migrated with tests and stories
- [ ] All Priority 2 components (new UI library) migrated with tests and stories
- [ ] All utility components migrated
- [ ] Theme components migrated and tested
- [ ] Component index (`src/components/ui/index.ts`) updated
- [ ] All tests passing: `npm run test`
- [ ] All components visible in Storybook: `npm run storybook`
- [ ] Code coverage maintained at 80%+: `npm run test:coverage`
- [ ] All ESLint violations fixed
- [ ] Changes committed to git

**✅ Mark Stage 3 Complete**: Once all tasks above are checked, update progress tracking at top of document.

---

## Stage 4: Authentication Integration

**Objective**: Replace localStorage mock authentication with Kinde OAuth integration.

### Tasks

#### 4.1 Analyze Current Authentication

- [ ] **Review New UI Auth Implementation**
  - Read `new_src/App.tsx` authentication logic
  - Document localStorage usage
  - Identify user data structure
  - Document login/logout flows

- [ ] **Review Existing Kinde Integration**
  - Read `src/contexts/KindeAuthContext.tsx`
  - Document `useAppAuth()` hook API
  - Review AuthGuard implementation
  - Document user data mapping strategy

#### 4.2 Update App.tsx for Kinde

- [ ] **Wrap App in KindeAuthProvider**
  - Ensure `src/main.tsx` has KindeAuthProvider
  - Verify environment variables configured

- [ ] **Update App.tsx**
  - Import `useAppAuth` hook
  - Remove `useState` for `isAuthenticated` and `user`
  - Remove `useEffect` for localStorage
  - Replace with `const { isAuthenticated, user, login, logout } = useAppAuth()`
  - Remove `handleLogin` and `handleSignUp` functions
  - Update to use Kinde's `login()` and `logout()`

- [ ] **Test Basic Auth Flow**
  ```bash
  npm run dev
  ```
  - Click "Sign In" → should redirect to Kinde
  - Complete login → should return to app
  - Verify user data appears in dashboard
  - Click "Logout" → should return to landing page

#### 4.3 Update Landing Page Component

- [ ] **Migrate landing-page.tsx**
  - Copy `new_src/components/landing-page.tsx` to `src/pages/LandingPage.tsx`
  - Update interface:
    ```typescript
    interface LandingPageProps {
      onLogin: () => void;    // Kinde login trigger
      onSignUp: () => void;   // Kinde register trigger
    }
    ```
  - Remove form handling for email/password (Kinde handles this)
  - Update button click handlers to call `onLogin()` / `onSignUp()`

- [ ] **Write Tests**
  - Test landing page renders
  - Test "Sign In" button calls `onLogin`
  - Test "Sign Up" button calls `onSignUp`
  - Test responsive design (mobile/desktop)

- [ ] **Write Storybook Story**
  - Create story with mock login/signup handlers
  - Test light and dark modes

#### 4.4 User Data Mapping

- [ ] **Document Mapping Strategy**

  | Kinde User Field | App User Field | Source |
  |------------------|----------------|--------|
  | `id` | `id` | Kinde |
  | `email` | `email` | Kinde |
  | `given_name` | `firstName` | Kinde |
  | `family_name` | `lastName` | Kinde |
  | `picture` | `picture` | Kinde |
  | N/A | `businessName` | App database |
  | N/A | `businessType` | App database |
  | N/A | `preferences` | App database |

- [ ] **Verify KindeAuthContext Handles Mapping**
  - Check `src/contexts/KindeAuthContext.tsx`
  - Ensure `user` object includes all fields
  - Ensure business data fetched from backend

- [ ] **Test User Data Display**
  - Login with test user
  - Verify name appears in header
  - Verify email accessible
  - Verify business name displays (or prompt to set)

#### 4.5 Update Dashboard Header

- [ ] **Migrate dashboard-header.tsx**
  - Copy `new_src/components/dashboard-header.tsx` to `src/components/layout/DashboardHeader/`
  - Create index.ts
  - Update props to use real Kinde user:
    ```typescript
    interface DashboardHeaderProps {
      onMenuToggle: () => void;
      onLogout: () => void;
      // userName and businessName derived from context
    }
    ```
  - Import `useAppAuth()` hook inside component
  - Use `user.firstName`, `user.lastName`, `user.businessName`

- [ ] **Handle Missing Business Info**
  - If `user.businessName` is null, show placeholder or prompt
  - Plan for onboarding flow (future work)

- [ ] **Write Tests**
  - Test header renders with user data
  - Test menu toggle button
  - Test logout button
  - Test theme toggle (if integrated)

- [ ] **Write Storybook Story**
  - Mock user context
  - Test with and without business name

#### 4.6 AuthGuard Integration

- [ ] **Verify Existing AuthGuard Works**
  - Check `src/App.tsx` AuthGuard component
  - Test protected routes redirect when logged out
  - Test loading state during auth check

- [ ] **Apply AuthGuard to New Routes**
  - Ensure all authenticated routes wrapped in `<AuthGuard>`
  - Test accessing `/dashboard` while logged out → should redirect to `/`

#### 4.7 Session Persistence

- [ ] **Test Kinde Token Refresh**
  - Login, then refresh page → should stay logged in
  - Wait for token to expire → should auto-refresh

- [ ] **Test Logout Cleanup**
  - Logout → should clear all app state
  - Verify no user data in localStorage (except Kinde tokens)
  - Verify backend session cleared (if applicable)

### Completion Checklist

- [ ] All localStorage auth removed from new components
- [ ] Kinde authentication integrated in App.tsx
- [ ] Landing page updated with Kinde login/signup
- [ ] Dashboard header displays real user data
- [ ] AuthGuard protects all authenticated routes
- [ ] User data mapping verified and tested
- [ ] Session persistence working correctly
- [ ] All auth flows tested (login, logout, token refresh)
- [ ] Tests written for all auth-related components
- [ ] Storybook stories created for auth components
- [ ] Changes committed to git

**✅ Mark Stage 4 Complete**: Once all tasks above are checked, update progress tracking at top of document.

---

## Stage 5: Dark Mode & Theme System

**Objective**: Integrate new theme system and ensure dark mode works consistently across all components.

### Tasks

#### 5.1 Compare Theme Implementations

- [ ] **Audit New Theme Provider**
  - Review `new_src/components/theme-provider.tsx`
  - Document approach (localStorage + system detection)
  - Check CSS class toggling (`light`, `dark`)

- [ ] **Audit Existing Theme System** (if any)
  - Check if `src/contexts/ThemeContext.tsx` exists
  - Document current approach
  - Identify differences

#### 5.2 Integrate Theme Provider

- [ ] **Copy Theme Provider**
  - Already done in Stage 3 (theme components migration)
  - Verify `src/contexts/ThemeProvider.tsx` exists

- [ ] **Wrap App in ThemeProvider**
  - Update `src/main.tsx` or `src/App.tsx`
  - Add `<ThemeProvider>` wrapper
  - Set default theme: `defaultTheme="system"`
  - Set storage key: `storageKey="intelligent-admin-theme"`

- [ ] **Test Theme Provider**
  ```bash
  npm run dev
  ```
  - Open dev tools → check `<html>` element
  - Verify `class="dark"` or `class="light"` applied
  - Switch theme → verify class changes

#### 5.3 Merge CSS Custom Properties

- [ ] **Compare CSS Files**
  - Open `src/index.css` and `new_src/index.css` side-by-side
  - Identify unique variables in each

- [ ] **Merge CSS Variables**
  - Backup `src/index.css`
  - Copy unique variables from `new_src/index.css` to `src/index.css`
  - Ensure both `:root` and `.dark` variants defined

- [ ] **Verify Gradient Utilities**
  - Test `from-cyan-500`, `to-teal-600` in both light and dark modes
  - Ensure AI feature gradients work correctly

- [ ] **Test CSS Build**
  ```bash
  npm run build
  ```
  - Verify no CSS errors
  - Check CSS bundle size (should not increase significantly)

#### 5.4 Integrate Theme Toggle

- [ ] **Add Theme Toggle to Header**
  - Import `ThemeToggle` component in `DashboardHeader`
  - Add to header toolbar (near user menu)
  - Test toggle opens/closes

- [ ] **Test Theme Switching**
  - Click toggle → switch to Light mode
  - Verify all components update
  - Click toggle → switch to Dark mode
  - Verify all components update
  - Click toggle → switch to System mode
  - Verify follows OS preference

- [ ] **Test Persistence**
  - Switch to Dark mode
  - Refresh page → should stay Dark
  - Switch to Light mode
  - Refresh page → should stay Light

#### 5.5 Dark Mode Component Testing

- [ ] **Test Core UI Components**
  - Open Storybook: `npm run storybook`
  - For each component, check dark mode story
  - Verify contrast, readability, visibility

- [ ] **Test Feature Components**
  - Test Dashboard in dark mode
  - Test Landing Page in dark mode
  - Test Chat Interface in dark mode
  - Test Quick Actions cards in dark mode
  - Test Integrations Grid in dark mode

- [ ] **Verify Visual Consistency**
  - Text readable in both modes (contrast ratio ≥ 4.5:1)
  - Icons visible in both modes
  - Borders visible in both modes
  - Shadows visible in both modes
  - Gradients maintain contrast in both modes

#### 5.6 Fix Dark Mode Issues

- [ ] **Create Issue List**
  - Document any components with poor dark mode support
  - Screenshot issues for reference

- [ ] **Fix Issues**
  - Update component styles
  - Add missing `dark:` variants
  - Test fixes in Storybook

- [ ] **Re-test All Components**
  - Verify all issues resolved

#### 5.7 System Theme Detection

- [ ] **Test System Theme Following**
  - Set theme to "System"
  - Change OS theme preference (light → dark)
  - Verify app updates automatically
  - Change OS theme preference (dark → light)
  - Verify app updates automatically

- [ ] **Test on Multiple OS**
  - Windows (if available)
  - macOS (if available)
  - Linux (if available)

### Completion Checklist

- [ ] Theme provider integrated and working
- [ ] App wrapped in ThemeProvider
- [ ] CSS custom properties merged and tested
- [ ] Theme toggle integrated in header
- [ ] Theme switching works (light, dark, system)
- [ ] Theme persistence works across sessions
- [ ] All components tested in dark mode
- [ ] All dark mode visual issues fixed
- [ ] System theme detection working
- [ ] Gradient utilities verified in both modes
- [ ] Tests written for theme switching
- [ ] Storybook stories include dark mode variants
- [ ] Changes committed to git

**✅ Mark Stage 5 Complete**: Once all tasks above are checked, update progress tracking at top of document.

---

## Stage 6: Backend Integration

**Objective**: Connect new UI components to existing backend APIs and enhance with contextual features.

### Tasks

#### 6.1 Email Intelligence Integration

- [ ] **Create useEmailAnalysis Hook**
  - Create `src/hooks/useEmailAnalysis.ts`
  - Fetch from `/api/emails/analysis`
  - Map backend response to `EmailSummary[]` interface
  - Handle loading and error states
  - Add refresh functionality

  ```typescript
  export interface EmailSummary {
    id: string;
    from: string;
    subject: string;
    urgency: 'high' | 'medium' | 'low';
    preview: string;
    timestamp: string;
  }

  export function useEmailAnalysis() {
    const [emails, setEmails] = useState<EmailSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Implementation...

    return { emails, loading, error, refresh };
  }
  ```

- [ ] **Write Hook Tests**
  - Test successful fetch
  - Test loading state
  - Test error handling
  - Test data mapping
  - Test refresh functionality

- [ ] **Update QuickActions Component**
  - Migrate `new_src/components/quick-actions.tsx` to `src/components/dashboard/QuickActions/`
  - Split into sub-components:
    - [ ] `EmailSummaryCard.tsx`
    - [ ] `ScheduleCard.tsx` (mock for now)
    - [ ] `LeadsCard.tsx` (mock for now)
  - Import `useEmailAnalysis()` hook
  - Replace `mockEmails` with real data
  - Add loading skeleton
  - Add error state display

- [ ] **Test Email Integration**
  - Login to app
  - Navigate to dashboard
  - Verify emails load from backend
  - Verify urgency badges correct
  - Verify email preview displays
  - Click "Chat about this" → verify context passed

#### 6.2 Integrations Management Integration

- [ ] **Create useIntegrations Hook**
  - Create `src/hooks/useIntegrations.ts`
  - Fetch from `/api/admin/integrations`
  - Map to integration status
  - Handle OAuth connection flow

  ```typescript
  export interface Integration {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    connected: boolean;
    benefits: string[];
    comingSoon?: boolean;
  }

  export function useIntegrations() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    const connect = async (integrationId: string) => {
      // Trigger OAuth flow
    };

    const disconnect = async (integrationId: string) => {
      // Disconnect integration
    };

    return { integrations, loading, connect, disconnect };
  }
  ```

- [ ] **Write Hook Tests**
  - Test fetch integrations
  - Test connect flow
  - Test disconnect flow
  - Test error handling

- [ ] **Update IntegrationsGrid Component**
  - Migrate `new_src/components/integrations-grid.tsx` and `integration-card.tsx`
  - Create `src/components/integrations/IntegrationsGrid/`
  - Create `src/components/integrations/IntegrationCard/`
  - Import `useIntegrations()` hook
  - Replace static data with real data
  - Implement real OAuth flow for "Connect" button
  - Add loading states
  - Add success/error notifications (use sonner)

- [ ] **Test Integration Flow**
  - Navigate to Integrations tab
  - Verify existing connections show "Connected" status (Gmail, Calendar)
  - Click "Connect" on new integration → should trigger OAuth
  - Complete OAuth → should return to app with "Connected" status
  - Click "Disconnect" → should show confirmation dialog
  - Confirm disconnect → status should update

#### 6.3 Chat Context Enhancement

- [ ] **Review ChatContext**
  - Read `src/contexts/ChatContext.tsx`
  - Document current `sendMessage()` API

- [ ] **Enhance ChatContext for Section Context**
  - Update `sendMessage` signature:
    ```typescript
    interface ChatContextType {
      sendMessage: (message: string, context?: {
        page?: string;
        section?: string;
        data?: any;
      }) => Promise<void>;
    }
    ```
  - Update backend API call to include context
  - Test context passing

- [ ] **Write Tests**
  - Test sendMessage with context
  - Test sendMessage without context
  - Test context serialization

#### 6.4 Contextual Chat Integration

- [ ] **Migrate ContextualChatInterface**
  - Copy `new_src/components/contextual-chat-interface.tsx`
  - Create `src/components/chat/ContextualChatInterface/`
  - Import `useChatContext()` hook (existing)
  - Update to use real `sendMessage()` with context

- [ ] **Migrate ChatFab**
  - Copy `new_src/components/chat-fab.tsx`
  - Create `src/components/chat/ChatFab/`
  - Connect to chat state

- [ ] **Integrate in Dashboard**
  - Import ChatFab and ContextualChatInterface in Dashboard page
  - Wire up "Chat about this" buttons in QuickActions
  - Pass section context (emails, schedule, leads)
  - Test context injection

- [ ] **Test Contextual Chat**
  - Click "Chat about this" on Email card
  - Verify chat opens with email context pre-loaded
  - Send message → verify AI has email context
  - Close chat → verify state resets
  - Open FAB chat → verify no pre-loaded context

#### 6.5 Dashboard Page Integration

- [ ] **Create DashboardPage Component**
  - Create `src/pages/DashboardPage.tsx`
  - Implement tab-based navigation (Dashboard, Integrations, Analytics)
  - Import DashboardHeader, DashboardSidebar
  - Import QuickActions, IntegrationsGrid
  - Import ChatFab, ContextualChatInterface
  - Wire up all state and event handlers

- [ ] **Handle Sidebar State**
  - Implement responsive sidebar (mobile overlay, desktop persistent)
  - Use `useMobile()` hook
  - Test on mobile (overlay) and desktop (persistent)

- [ ] **Update App.tsx Routes**
  - Update `/dashboard` route to render new `DashboardPage`
  - Keep existing routes (`/chat`, `/emails`, `/industry`)
  - Test navigation between routes

- [ ] **Write Tests**
  - Test tab switching
  - Test sidebar toggle
  - Test responsive behavior
  - Test "Chat about this" integration

#### 6.6 Create Service Layer

- [ ] **Create emailService.ts**
  - Create `src/services/emailService.ts`
  - Implement API calls:
    - `fetchEmailAnalysis()`
    - `analyzeEmail(emailId)`
  - Add error handling
  - Write tests

- [ ] **Create integrationService.ts**
  - Create `src/services/integrationService.ts`
  - Implement API calls:
    - `fetchIntegrations()`
    - `connectIntegration(integrationId)`
    - `disconnectIntegration(integrationId)`
  - Add error handling
  - Write tests

- [ ] **Update chatService.ts**
  - Update `src/services/chatService.ts`
  - Add context parameter to chat API call
  - Write tests for contextual chat

#### 6.7 Preserve Existing Features

- [ ] **Verify Email Intelligence Dashboard**
  - Navigate to `/emails`
  - Verify existing EmailIntelligenceDashboard still works
  - Test all features (email list, analysis, filters)

- [ ] **Verify Industry Knowledge Dashboard**
  - Navigate to `/industry`
  - Verify existing IndustryKnowledgeDashboard still works
  - Test all features (knowledge articles, search, upload)

- [ ] **Update Navigation**
  - Add links to `/emails` and `/industry` in sidebar or menu
  - Ensure users can access all features

### Completion Checklist

- [ ] Email intelligence integrated with real backend API
- [ ] useEmailAnalysis hook created and tested
- [ ] QuickActions component split and integrated with backend
- [ ] Integrations management integrated with backend
- [ ] useIntegrations hook created and tested
- [ ] OAuth connection flow working for integrations
- [ ] ChatContext enhanced with section context
- [ ] Contextual chat integrated in dashboard
- [ ] ChatFab component integrated
- [ ] Dashboard page created with tab navigation
- [ ] Responsive sidebar working (mobile + desktop)
- [ ] Service layer created for email, integrations, chat
- [ ] Existing features preserved (email dashboard, industry knowledge)
- [ ] All backend integrations tested end-to-end
- [ ] Loading and error states implemented
- [ ] Tests written for all hooks and services
- [ ] Storybook stories created for new components
- [ ] Changes committed to git

**✅ Mark Stage 6 Complete**: Once all tasks above are checked, update progress tracking at top of document.

---

## Stage 7: Testing & Quality Assurance

**Objective**: Comprehensive testing across all levels - unit, integration, visual, accessibility, and performance.

### Tasks

#### 7.1 Unit Testing (Vitest)

- [ ] **Run Full Test Suite**
  ```bash
  npm run test
  ```
  - Review test results
  - Identify failing tests
  - Fix all failures

- [ ] **Check Code Coverage**
  ```bash
  npm run test:coverage
  ```
  - Verify ≥80% coverage overall
  - Identify uncovered lines
  - Write additional tests for low-coverage areas

- [ ] **Test New Components**
  - Verify all new UI components have tests
  - Verify all new hooks have tests
  - Verify all new services have tests
  - Verify all new pages have tests

- [ ] **Test Critical Paths**
  - [ ] Theme switching (light, dark, system)
  - [ ] Authentication (login, logout, token refresh)
  - [ ] Email analysis fetching and display
  - [ ] Integration connection flow
  - [ ] Chat context passing
  - [ ] Responsive sidebar behavior

#### 7.2 Storybook Visual Testing

- [ ] **Build Storybook**
  ```bash
  npm run build-storybook
  ```
  - Verify build succeeds
  - Check bundle size

- [ ] **Review All Stories**
  ```bash
  npm run storybook
  ```
  - Open each component story
  - Verify default state renders correctly
  - Test all variants
  - Test interactive states (hover, active, disabled)
  - Test dark mode variant

- [ ] **Verify Story Coverage**
  - All new UI components have stories
  - All new feature components have stories
  - All stories include dark mode variant
  - All stories include mobile variant (if responsive)

#### 7.3 Critical User Flow Testing

- [ ] **Authentication Flow**
  - [ ] User lands on LandingPage (logged out)
  - [ ] Clicks "Sign In" → redirects to Kinde
  - [ ] Completes login → returns to app
  - [ ] Redirects to `/dashboard`
  - [ ] Sees personalized dashboard with user name
  - [ ] Clicks "Logout" → returns to LandingPage
  - [ ] Verify logged out state

- [ ] **Dashboard Interaction Flow**
  - [ ] Login and navigate to dashboard
  - [ ] Open sidebar on mobile (overlay)
  - [ ] Navigate between tabs (Dashboard, Integrations, Analytics)
  - [ ] Expand/collapse accordion sections (emails, schedule, leads)
  - [ ] Click "Chat about this" on email card
  - [ ] Verify contextual chat opens with email context
  - [ ] Send message in contextual chat
  - [ ] Verify AI receives context
  - [ ] Close contextual chat
  - [ ] Open FAB chat (no context)
  - [ ] Send message in FAB chat

- [ ] **Theme Switching Flow**
  - [ ] Open theme toggle in header
  - [ ] Switch to Light mode → verify all components update
  - [ ] Refresh page → verify theme persists (Light)
  - [ ] Switch to Dark mode → verify all components update
  - [ ] Refresh page → verify theme persists (Dark)
  - [ ] Switch to System mode
  - [ ] Change OS preference → verify app follows

- [ ] **Integration Management Flow**
  - [ ] Navigate to Integrations tab
  - [ ] Verify connected integrations show "Connected" (Gmail, Calendar)
  - [ ] Click "Connect" on new integration (e.g., QuickBooks)
  - [ ] Complete OAuth flow
  - [ ] Return to app → verify shows "Connected"
  - [ ] Click "Disconnect"
  - [ ] Confirm → verify shows "Not Connected"

- [ ] **Email Intelligence Flow**
  - [ ] Navigate to dashboard
  - [ ] Verify email summary loads from backend
  - [ ] Check high priority badge count matches emails
  - [ ] Expand email section
  - [ ] Verify emails sorted by priority (high, medium, low)
  - [ ] Click "Chat about this"
  - [ ] Ask AI about specific email
  - [ ] Verify AI has email context in response
  - [ ] Click "View All Emails" → navigate to `/emails`
  - [ ] Verify full EmailIntelligenceDashboard loads

#### 7.4 Accessibility Testing

- [ ] **Run Storybook a11y Addon**
  ```bash
  npm run storybook
  ```
  - Open each component story
  - Click "Accessibility" tab
  - Review violations
  - Fix all critical and serious violations

- [ ] **Keyboard Navigation Testing**
  - [ ] Tab through all interactive elements on Landing Page
  - [ ] Tab through all interactive elements on Dashboard
  - [ ] Tab through sidebar menu items
  - [ ] Tab through email cards and buttons
  - [ ] Tab through integration cards and buttons
  - [ ] Verify focus indicators visible
  - [ ] Verify focus order logical
  - [ ] Test Enter/Space on buttons
  - [ ] Test Escape to close modals/drawers

- [ ] **Screen Reader Testing** (NVDA/JAWS/VoiceOver)
  - [ ] Test Landing Page announcement
  - [ ] Test Dashboard navigation announcement
  - [ ] Test button labels announced
  - [ ] Test form labels announced
  - [ ] Test error messages announced
  - [ ] Test loading states announced

- [ ] **Color Contrast Testing**
  - Use browser extension (e.g., axe DevTools)
  - Check all text meets WCAG AA contrast ratio (≥4.5:1 for text, ≥3:1 for UI)
  - Test in light mode
  - Test in dark mode
  - Fix any violations

- [ ] **ARIA Attributes**
  - [ ] Verify all interactive elements have accessible names
  - [ ] Verify all icons have aria-labels (or sr-only text)
  - [ ] Verify all images have alt text
  - [ ] Verify all form inputs have labels
  - [ ] Verify all dialogs have aria-labelledby
  - [ ] Verify all live regions use aria-live

#### 7.5 Mobile Responsiveness Testing

- [ ] **Test Breakpoints**
  - Open Chrome DevTools responsive mode
  - Test at each breakpoint:
    - [ ] 375px (iPhone SE)
    - [ ] 390px (iPhone 12/13)
    - [ ] 768px (iPad Mini)
    - [ ] 1024px (iPad Pro / Desktop sidebar opens)
    - [ ] 1920px (Desktop)

- [ ] **Test Mobile Features**
  - [ ] Sidebar overlay works (mobile)
  - [ ] Sidebar persists (desktop ≥1024px)
  - [ ] Cards stack vertically (mobile)
  - [ ] Email/schedule/leads readable on small screens
  - [ ] Touch targets ≥44px (tap size)
  - [ ] No horizontal scrolling
  - [ ] Text readable without zoom
  - [ ] Chat interface usable on mobile
  - [ ] Theme toggle accessible on mobile

- [ ] **Real Device Testing**
  - [ ] Test on iPhone (if available)
  - [ ] Test on Android phone (if available)
  - [ ] Test on iPad (if available)
  - [ ] Test on Android tablet (if available)

- [ ] **Cross-browser Testing**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest, macOS/iOS)
  - [ ] Edge (latest)

#### 7.6 Performance Testing

- [ ] **Run Lighthouse Audit**
  - Open Chrome DevTools
  - Run Lighthouse (Performance, Accessibility, Best Practices, SEO)
  - Target scores:
    - Performance: ≥90
    - Accessibility: ≥95
    - Best Practices: ≥95
    - SEO: ≥90

- [ ] **Measure Core Web Vitals**
  - Time to Interactive (TTI): < 3s
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1

- [ ] **Analyze Bundle Size**
  ```bash
  npm run build
  ```
  - Check `dist/` folder size
  - Use `rollup-plugin-visualizer` to identify large dependencies
  - Target: Main bundle < 500KB gzipped

- [ ] **Optimize If Needed**
  - [ ] Lazy load IntegrationsGrid (only when tab active)
  - [ ] Lazy load ContextualChatInterface (only when opened)
  - [ ] Optimize images (use WebP, lazy loading)
  - [ ] Code split routes (React.lazy)
  - [ ] Memoize expensive computations (React.memo, useMemo)

#### 7.7 Security Testing

- [ ] **Authentication Security**
  - [ ] Verify tokens not exposed in localStorage (Kinde handles securely)
  - [ ] Test session expiration and refresh
  - [ ] Test logout clears all sensitive data
  - [ ] Verify AuthGuard protects all routes

- [ ] **API Security**
  - [ ] Verify all API calls include auth headers
  - [ ] Test API calls fail without valid token
  - [ ] Verify no sensitive data in URL params
  - [ ] Verify no sensitive data logged to console

- [ ] **XSS Prevention**
  - [ ] Verify user input sanitized (especially in chat)
  - [ ] Verify no `dangerouslySetInnerHTML` without sanitization
  - [ ] Test entering `<script>` tags in chat → should be escaped

- [ ] **CSRF Prevention**
  - [ ] Verify backend has CSRF protection
  - [ ] Verify all POST requests include CSRF token (if applicable)

#### 7.8 Error Handling & Edge Cases

- [ ] **Network Error Handling**
  - [ ] Disconnect network → verify error states display
  - [ ] Test email fetch failure → verify error message
  - [ ] Test integration connect failure → verify error notification
  - [ ] Test chat message send failure → verify retry option

- [ ] **Loading States**
  - [ ] Verify all data fetches show loading indicators
  - [ ] Test slow network (Chrome DevTools throttling)
  - [ ] Verify skeleton loaders display correctly

- [ ] **Empty States**
  - [ ] Test dashboard with no emails → verify empty state message
  - [ ] Test integrations with none connected → verify prompt to connect
  - [ ] Test chat with no messages → verify welcome message

- [ ] **Edge Cases**
  - [ ] Test very long email subjects → verify truncation
  - [ ] Test very long business names → verify truncation/wrapping
  - [ ] Test special characters in user input
  - [ ] Test rapid theme switching
  - [ ] Test rapid tab switching

#### 7.9 Regression Testing

- [ ] **Test Existing Features**
  - [ ] Navigate to `/emails` → verify EmailIntelligenceDashboard works
  - [ ] Navigate to `/industry` → verify IndustryKnowledgeDashboard works
  - [ ] Navigate to `/chat` → verify full-page ChatInterface works
  - [ ] Test all existing features in each dashboard

- [ ] **Verify No Breaking Changes**
  - [ ] All existing API calls still work
  - [ ] All existing components still render
  - [ ] All existing tests still pass
  - [ ] No console errors or warnings

### Completion Checklist

- [ ] All unit tests passing (`npm run test`)
- [ ] Code coverage ≥80% (`npm run test:coverage`)
- [ ] All Storybook stories created and verified
- [ ] All critical user flows tested and passing
- [ ] All accessibility violations fixed (a11y audit clean)
- [ ] Keyboard navigation working for all interactive elements
- [ ] Screen reader testing completed
- [ ] Color contrast meets WCAG AA standards
- [ ] Mobile responsiveness verified at all breakpoints
- [ ] Real device testing completed (iOS + Android)
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
- [ ] Lighthouse performance scores ≥90
- [ ] Core Web Vitals meeting targets
- [ ] Bundle size optimized (< 500KB gzipped)
- [ ] Security testing completed (auth, API, XSS, CSRF)
- [ ] Error handling tested for all failure scenarios
- [ ] Loading and empty states verified
- [ ] Edge cases tested and handled
- [ ] Regression testing completed (existing features work)
- [ ] No console errors or warnings in production build
- [ ] All changes committed to git
- [ ] Code review completed by team

**✅ Mark Stage 7 Complete**: Once all tasks above are checked, update progress tracking at top of document.

---

## Deployment Plan

### Pre-Deployment Checklist

- [ ] All 7 stages completed (checked off above)
- [ ] Code review completed and approved
- [ ] QA testing completed by QA team
- [ ] User acceptance testing (UAT) completed
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated

### Deployment Steps

1. **Merge to Main**
   ```bash
   git checkout main
   git merge frontend-figma-migration
   git push origin main
   ```

2. **Build Production Bundle**
   ```bash
   npm run build
   ```
   - Verify build succeeds
   - Check bundle size
   - Test production build locally: `npm run preview`

3. **Deploy to Staging**
   - Follow deployment process for staging environment
   - Verify staging deployment successful
   - Run smoke tests on staging

4. **Final Staging Verification**
   - [ ] Authentication works (Kinde production settings)
   - [ ] All API integrations work
   - [ ] Theme switching works
   - [ ] Email intelligence loads real data
   - [ ] Integrations connect successfully
   - [ ] Chat works with context
   - [ ] Mobile responsive
   - [ ] No console errors

5. **Deploy to Production**
   - Follow deployment process for production environment
   - Monitor deployment process
   - Verify production deployment successful

6. **Post-Deployment Verification**
   - [ ] Smoke test critical flows (login, dashboard, email, integrations, chat)
   - [ ] Monitor error logs (check for new errors)
   - [ ] Monitor performance metrics (Lighthouse, Core Web Vitals)
   - [ ] Monitor user analytics (usage patterns)

7. **Rollback Plan** (if needed)
   - If critical bug discovered:
     ```bash
     git revert <migration-merge-commit>
     git push origin main
     # Trigger deployment of reverted version
     ```
   - Communicate with users
   - Fix bug in feature branch
   - Re-test and re-deploy

### Post-Deployment Tasks

- [ ] Gather user feedback
- [ ] Monitor error rates (first 24-48 hours critical)
- [ ] Address urgent bugs immediately
- [ ] Plan improvements based on feedback
- [ ] Document lessons learned
- [ ] Update team on success metrics

---

## Future Work (Post-Migration)

### Backend Redesign

- [ ] **Dashboard API Optimization**
  - Create `GET /api/dashboard/overview` (aggregated stats)
  - Create `GET /api/dashboard/quick-actions` (emails, schedule, leads in one call)
  - Reduce number of API calls from 3-5 to 1-2

- [ ] **AI Insights API**
  - Create `GET /api/insights/recommendations` (AI-powered next best actions)
  - Create `POST /api/chat/contextual` (context-aware chat endpoint)

### Calendar Integration

- [ ] Integrate Google Calendar API
- [ ] Auto-populate "Today's Schedule" from real calendar
- [ ] Travel time calculations (Google Maps API)
- [ ] Smart scheduling suggestions
- [ ] Client meeting prep (link to CRM)

### CRM/Leads Integration

- [ ] Integrate HubSpot or custom CRM
- [ ] Auto-populate "Lead Follow-ups" from CRM
- [ ] Lead scoring automation (AI-powered urgency)
- [ ] Follow-up reminders (push notifications)
- [ ] Deal pipeline tracking

### Analytics Dashboard

- [ ] Build full analytics dashboard (currently placeholder)
- [ ] Revenue tracking (by project, by month)
- [ ] Client acquisition costs
- [ ] Productivity metrics (tasks completed, AI time savings)
- [ ] Business insights (trends, opportunities)
- [ ] Customizable dashboard widgets

### Progressive Web App (PWA)

- [ ] Add service worker (offline support)
- [ ] Create `manifest.json` (installable app)
- [ ] Implement push notifications
- [ ] Background sync for offline actions
- [ ] Test on mobile devices (Add to Home Screen)

### Proactive AI Features

- [ ] "Next Best Action" daily recommendations
- [ ] Morning Brief push notification
- [ ] Overdue follow-up reminders
- [ ] Smart email drafting (AI-written replies)
- [ ] Meeting prep summaries

### User Onboarding

- [ ] Build onboarding flow for new users
- [ ] Business information collection
- [ ] Integration setup wizard
- [ ] AI personality customization
- [ ] Progressive disclosure of features

---

## Technical Decisions & Rationale

### 1. Hybrid Router Approach

**Decision**: Keep React Router for existing pages, add tab-based navigation for new dashboard.

**Rationale**:
- New UI uses single-page app with tabs (no routing)
- Existing app uses React Router for pages
- Hybrid allows preserving existing features while adding new UI
- Gradual migration path with lower risk

**Routes**:
- `/` → LandingPage (unauthenticated)
- `/dashboard` → NEW tab-based dashboard (Dashboard, Integrations, Analytics)
- `/chat` → Full-page ChatInterface (existing)
- `/emails` → EmailIntelligenceDashboard (existing)
- `/industry` → IndustryKnowledgeDashboard (existing)
- `/settings` → Settings page (future)

### 2. Theme System

**Decision**: Adopt new `theme-provider.tsx` from Figma UI.

**Rationale**:
- Simpler implementation
- Already supports system/light/dark
- Matches shadcn-ui standard pattern
- Proven approach

### 3. Component Structure

**Decision**: Maintain co-located component structure (tests + stories alongside components).

**Rationale**:
- Better developer experience
- Easier refactoring (related files stay together)
- Aligns with project guidelines (CLAUDE.md)
- Easier to track test coverage
- Satisfies 80% coverage requirement

### 4. Authentication

**Decision**: Full Kinde OAuth integration, replace localStorage mock.

**Rationale**:
- Security (localStorage insecure for tokens)
- Already integrated in current app
- Professional authentication flow
- Required for production

### 5. Backend Integration

**Decision**: Start with existing APIs, plan future redesign.

**Rationale**:
- Faster initial migration
- Preserves existing functionality
- Lower risk approach
- Backend optimization is separate project
- Allows shipping new UI sooner

### 6. Testing Strategy

**Decision**: Write tests and stories during component migration, not after.

**Rationale**:
- Ensures 80% coverage requirement met
- Easier to test components in isolation
- Prevents technical debt accumulation
- Higher quality with fewer bugs

---

## Risk Mitigation Strategies

### Risk 1: Bundle Size Explosion
**Mitigation**: Code splitting, lazy loading, bundle size monitoring

### Risk 2: Authentication Failures
**Mitigation**: Thorough auth testing, error boundaries, retry logic

### Risk 3: Breaking Existing Features
**Mitigation**: Keep existing components untouched, regression testing, separate routes

### Risk 4: Mobile Issues
**Mitigation**: Mobile-first development, real device testing, responsive design best practices

### Risk 5: Dark Mode Inconsistencies
**Mitigation**: Test all components in dark mode, Storybook dark variants, visual regression testing

### Risk 6: Testing Coverage Gaps
**Mitigation**: Write tests during migration, frequent coverage reports, CI enforcement

### Risk 7: Performance Regression
**Mitigation**: Lighthouse audits, bundle size tracking, lazy loading, performance monitoring

### Risk 8: Scope Creep
**Mitigation**: Stick to migration plan, use "Future Work" for new ideas, time-box stages

---

## Notes for Claude

**How to Use This Plan**:

1. **Read the current stage** in "Progress Tracking" at the top
2. **Check off tasks** as you complete them using `- [x]`
3. **Mark stage complete** when all tasks in that stage are checked
4. **Move to next stage** and repeat
5. **Update progress tracking** at top when stage complete
6. **Commit changes** to this file regularly to track progress

**Stage Execution Guidance**:

- Work sequentially through stages (1 → 2 → 3 → 4 → 5 → 6 → 7)
- Complete all tasks in a stage before moving to next
- Run tests frequently during development
- Use Storybook for visual verification
- Ask for clarification if tasks are unclear
- Document any deviations from plan in git commit messages

**Testing Reminders**:

- Maintain 80%+ code coverage (run `npm run test:coverage`)
- Write Storybook stories for all components
- Test in both light and dark modes
- Test on mobile and desktop breakpoints
- Fix all ESLint violations before committing

**Communication**:

- Update this file with progress
- Check off completed tasks
- Note any blockers or issues
- Suggest improvements to plan if needed

Good luck with the migration! 🚀
