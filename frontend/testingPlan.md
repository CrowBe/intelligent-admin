# Frontend Testing Plan

## Overview

The frontend module provides the React-based user interface for the AI-powered administrative assistant. This testing plan covers component testing, user interaction testing, accessibility validation, and service integration testing.

## Architecture Under Test

### Key Components
- **ChatInterface**: Main AI chat component with message handling
- **Dashboard**: Overview and analytics display
- **DocumentUpload**: File upload with drag-and-drop functionality
- **Authentication**: Kinde-based auth integration
- **Navigation**: Mobile-first responsive navigation

### Services & APIs
- **API Service**: HTTP client for backend communication
- **Document Service**: File upload and processing
- **Auth Context**: Authentication state management
- **Chat Context**: Message state and history

## Testing Strategy

### Test Types & Distribution
- **Unit Tests**: 45% (individual components, utilities)
- **Integration Tests**: 25% (component + service interactions)
- **Visual Testing**: 20% (Storybook component stories and visual regression)
- **Accessibility Tests**: 10% (a11y compliance)

### Coverage Requirements
- **Lines**: 70% minimum
- **Functions**: 70% minimum  
- **Branches**: 70% minimum
- **Statements**: 70% minimum

## Component Testing Standards

### React Component Tests

#### Basic Structure
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('ComponentName', () => {
  it('should render with required props', () => {
    // Test component renders correctly
  });

  it('should handle user interactions', async () => {
    // Test user events and state changes
  });

  it('should display error states appropriately', () => {
    // Test error handling and display
  });
});
```

#### Required Test Cases
1. **Rendering**: Component renders with default props
2. **Props**: Handles all prop combinations correctly
3. **User Interaction**: Click, input, form submission, keyboard navigation
4. **State Management**: Component state updates correctly
5. **Error States**: Error boundaries and fallback UI
6. **Loading States**: Skeleton screens and spinners
7. **Accessibility**: Screen reader compatibility, keyboard navigation

### Chat Interface Testing

#### Core Scenarios
```typescript
describe('ChatInterface', () => {
  it('displays welcome message on initial load', () => {
    // Test initial state and onboarding
  });

  it('sends messages and displays responses', async () => {
    // Test message sending and AI response display
  });

  it('handles API errors gracefully', async () => {
    // Test network failure scenarios
  });

  it('maintains message history across sessions', () => {
    // Test persistence and state management
  });

  it('supports mobile touch interactions', async () => {
    // Test mobile-specific interactions
  });
});
```

### Document Upload Testing

#### File Handling Scenarios
```typescript
describe('DocumentUpload', () => {
  it('accepts valid file types', async () => {
    // Test PDF, DOC, image uploads
  });

  it('rejects invalid file types with clear error', async () => {
    // Test file type validation
  });

  it('handles drag and drop interactions', async () => {
    // Test drag/drop file upload
  });

  it('shows upload progress and completion', async () => {
    // Test progress indicators and success states
  });

  it('handles file size limits', async () => {
    // Test large file rejection
  });
});
```

## Service Integration Testing

### API Service Testing
```typescript
describe('API Service', () => {
  it('makes authenticated requests correctly', async () => {
    // Test auth headers and token handling
  });

  it('handles rate limiting gracefully', async () => {
    // Test 429 responses and retry logic
  });

  it('transforms response data correctly', async () => {
    // Test data mapping and validation
  });
});
```

### Context Testing
```typescript
describe('ChatContext', () => {
  it('manages message state correctly', () => {
    // Test state management
  });

  it('persists conversation history', () => {
    // Test localStorage integration
  });
});
```

## Visual Testing with Storybook

### Overview
Storybook v9.1.3 provides comprehensive visual testing, component documentation, and interaction testing for the frontend components. It serves as both a development tool and testing platform for isolated component behavior.

### Storybook Configuration

#### Story Organization
- **Co-located Stories**: Stories live alongside components (e.g., `button/Button.stories.tsx`)
- **No Central Stories Folder**: Removed `src/stories/` - all stories are component-specific
- **Business Context Focus**: Stories tailored for Australian trade business scenarios
- **Real Components Only**: No generic example components, only production components

#### Key Features Enabled
- **Component Stories**: Isolated component rendering and testing
- **Accessibility Testing**: Built-in a11y addon with WCAG compliance checking
- **Interactive Testing**: User interaction simulation with @storybook/addon-vitest
- **Documentation**: Auto-generated docs from component props and stories
- **Visual Regression**: Chromatic integration for visual diff detection (future)

#### Setup
```bash
npm run storybook          # Development server (port 6006)
npm run build-storybook    # Build static Storybook
npm run test:storybook     # Run Storybook tests with Vitest
```

### Co-located Testing Guidelines

#### File Naming Convention
```
ComponentName.tsx        # Component implementation
ComponentName.stories.tsx # Storybook stories
ComponentName.test.tsx   # Vitest unit tests
index.ts                 # Re-exports for clean imports
```

#### Import Guidelines
```typescript
// ✅ Correct: Use relative imports within component folder
import { Button } from './Button';

// ✅ Correct: External components use path aliases
import { Badge } from '@/components/ui/badge';

// ❌ Avoid: Don't mix relative and alias imports inconsistently
```

#### Benefits of Co-location
- **Easier Navigation**: Related files are physically close
- **Better Maintenance**: Changes affect localized files
- **Clear Dependencies**: Component-specific tests and stories
- **Team Collaboration**: Developers work in focused areas
- **Refactoring Safety**: Moving components moves all related files

### Story Writing Guidelines

#### Basic Story Structure
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered', // or 'padded', 'fullscreen'
    docs: {
      description: {
        component: 'Component description for documentation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for component props
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

#### Trade Business Context Stories
Each component should include stories relevant to Australian trade businesses:

```typescript
// Mobile-first stories (primary use case)
export const MobileView: Story = {
  args: { /* mobile-optimized props */ },
  parameters: {
    viewport: { defaultViewport: 'mobile' },
    docs: {
      description: {
        story: 'Optimized for trade professionals using mobile devices on-site.',
      },
    },
  },
};

// Urgent scenarios (safety/compliance)
export const UrgentAlert: Story = {
  args: {
    variant: 'destructive',
    children: '🚨 Urgent: WorkSafe NSW Inspection Required',
  },
  parameters: {
    docs: {
      description: {
        story: 'High-priority alerts for safety and compliance issues.',
      },
    },
  },
};

// Industry-specific content
export const ElectricalCompliance: Story = {
  args: {
    content: 'AS/NZS 3000:2018 compliance check required for installation...',
  },
};
```

### Component Organization & Co-location

#### Recommended Structure (Compatible with shadcn-ui)
```
src/components/ui/
├── button/
│   ├── index.ts              # Re-exports for clean imports
│   ├── Button.tsx            # Component implementation  
│   ├── Button.stories.tsx    # Storybook stories
│   └── Button.test.tsx       # Component tests
├── card/
│   ├── index.ts
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   └── Card.test.tsx
```

#### shadcn-ui Compatibility ✅
- **Import Paths**: `import { Button } from '@/components/ui/button'` works unchanged
- **CLI Commands**: `npx shadcn add button` continues to work
- **Path Aliases**: `@/components` alias maintained
- **File Extensions**: `.tsx` requirements preserved

#### Component Categories

##### UI Components (`src/components/ui/`)
- **button/**: All variants, sizes, states, and industry contexts
- **card/**: Information display, dashboards, document summaries
- **input/**: Form fields, search, chat input
- **alert/**: Safety notices, compliance alerts, system messages
- **badge/**: Status indicators, urgency levels, categories

#### Chat Components (`src/components/chat/`)
- **ChatMessage**: User and AI messages, markdown rendering, timestamps
- **ChatInput**: Message composition, file attachment, voice input
- **TypingIndicator**: AI processing states, loading animations
- **ActionButton**: Quick actions, suggested responses

#### Document Components (`src/components/documents/`)
- **DocumentUpload**: Drag-and-drop, file validation, progress indicators
- **DocumentList**: Grid/list views, filtering, search
- **DocumentCard**: Preview, metadata, actions

### Visual Testing Scenarios

#### Responsive Design Testing
```typescript
// Test component across all viewports
export const ResponsiveTest: Story = {
  args: { /* component props */ },
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1024px', height: '768px' } },
      },
    },
  },
};
```

#### Theme and Color Testing
```typescript
// Test component with different backgrounds
export const ThemeVariations: Story = {
  parameters: {
    backgrounds: {
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'trade-blue', value: '#1e40af' },
      ],
    },
  },
};
```

### Interactive Testing

#### User Interaction Stories
```typescript
import { userEvent, within, expect } from '@storybook/test';

export const InteractiveTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test user interactions
    await userEvent.click(button);
    await expect(canvas.getByText('Expected result')).toBeInTheDocument();
  },
};
```

#### Form Validation Stories
```typescript
export const FormValidation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');
    
    // Test invalid input
    await userEvent.type(input, 'invalid-email');
    await userEvent.tab(); // Trigger blur
    
    await expect(canvas.getByText('Please enter a valid email')).toBeInTheDocument();
  },
};
```

### Accessibility Testing Integration

#### Built-in A11y Checks
```typescript
export const AccessibilityTest: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'screen-reader', enabled: true },
        ],
      },
    },
  },
};
```

#### Keyboard Navigation Testing
```typescript
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test keyboard navigation
    await userEvent.keyboard('{Tab}');
    await expect(canvas.getByRole('button')).toHaveFocus();
    
    await userEvent.keyboard('{Enter}');
    // Test expected behavior
  },
};
```

### Visual Regression Testing

#### Chromatic Integration (Future)
```typescript
// Stories optimized for visual regression testing
export const VisualRegression: Story = {
  parameters: {
    // Disable animations for consistent snapshots
    chromatic: { 
      delay: 300,
      pauseAnimationAtEnd: true,
    },
  },
};
```

### Documentation Standards

#### Story Documentation
Each story should include:
- **Purpose**: What the story demonstrates
- **Context**: When this variant would be used
- **Business Value**: Why this matters for trade businesses
- **Accessibility**: Any a11y considerations
- **Mobile**: Mobile-specific behavior notes

#### Component Documentation
Auto-generated from JSDoc comments:
```typescript
/**
 * Button component for user interactions
 * 
 * @param variant - Visual style variant
 * @param size - Button size
 * @param disabled - Whether button is disabled
 * @param children - Button content
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Send Message to AI
 * </Button>
 * ```
 */
export const Button = ({ variant, size, disabled, children, ...props }) => {
  // Component implementation
};
```

### Performance Testing in Storybook

#### Render Performance
```typescript
export const PerformanceTest: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Tests component render performance with large datasets.',
      },
    },
  },
  args: {
    // Large dataset for performance testing
    items: Array(1000).fill(null).map((_, i) => ({
      id: i,
      name: `Item ${i}`,
    })),
  },
};
```

### Integration with Vitest

#### Storybook + Vitest Testing
The `@storybook/addon-vitest` integration allows running component tests within Storybook:

```typescript
// Automatically test all stories
import { test, expect } from 'vitest';
import { composeStory } from '@storybook/react';
import * as stories from './Component.stories';

// Test each story renders without errors
Object.entries(stories).forEach(([name, story]) => {
  if (name !== 'default') {
    test(`${name} renders`, () => {
      const Component = composeStory(story, stories.default);
      expect(() => render(<Component />)).not.toThrow();
    });
  }
});
```

### CI/CD Integration

#### Automated Testing Pipeline
1. **Build Storybook**: Verify all stories compile
2. **Accessibility Tests**: Run a11y checks on all stories  
3. **Visual Regression**: Compare screenshots (with Chromatic)
4. **Interaction Tests**: Run play functions and validate behavior
5. **Performance Tests**: Measure render times for complex components

#### Commands
```bash
npm run build-storybook     # Build for CI
npm run test:storybook      # Run story tests
npm run storybook:ci        # CI-optimized Storybook build
```

## Accessibility Testing

### Requirements
- **WCAG 2.1 AA Compliance**: Meet accessibility guidelines
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Focus Management**: Visible focus indicators

### Testing Approach
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Mobile Testing

### Responsive Design Tests
- **Breakpoints**: Test major breakpoints (320px, 768px, 1024px, 1920px)
- **Touch Targets**: Minimum 44px touch targets
- **Viewport**: Proper viewport handling and scaling
- **Orientation**: Portrait and landscape support

### Mobile-Specific Features
```typescript
describe('Mobile Interactions', () => {
  it('handles touch events correctly', async () => {
    // Test touch interactions
  });

  it('adapts UI for small screens', () => {
    // Test responsive layout changes
  });
});
```

## Performance Testing

### Metrics to Track
- **Component Mount Time**: < 100ms
- **Re-render Performance**: Minimal unnecessary re-renders
- **Bundle Size**: Track component bundle impact
- **Memory Usage**: No memory leaks in long-running sessions

### Testing Approach
```typescript
import { renderHook } from '@testing-library/react';
import { performance } from 'perf_hooks';

describe('Performance', () => {
  it('renders within performance budget', () => {
    const start = performance.now();
    render(<LargeComponent />);
    const end = performance.now();
    expect(end - start).toBeLessThan(100);
  });
});
```

## Mock Strategy

### External Dependencies
```typescript
// Mock API calls
vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock authentication
vi.mock('../../contexts/KindeAuthContext', () => ({
  useAppAuth: () => ({
    isAuthenticated: true,
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));
```

### File Upload Mocking
```typescript
const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
const mockFileList = [mockFile] as any;

// Mock drag and drop events
const mockDragEvent = {
  preventDefault: vi.fn(),
  dataTransfer: { files: mockFileList },
};
```

## Test Data & Fixtures

### Business Context Data
```typescript
// Australian trade business scenarios
const mockBusinessData = {
  businessType: 'electrical_contractor',
  location: 'Sydney, NSW',
  regulations: ['AS/NZS 3000:2018'],
  typical_queries: [
    'Schedule safety inspection',
    'Check compliance requirements',
    'Draft quote for commercial job',
  ],
};
```

### User Personas
```typescript
const mockUsers = {
  tradie_owner: {
    name: 'Mike Johnson',
    business: 'Johnson Electrical',
    experience_level: 'expert',
    tech_comfort: 'medium',
  },
  office_admin: {
    name: 'Sarah Chen', 
    role: 'administrator',
    experience_level: 'intermediate',
    tech_comfort: 'high',
  },
};
```

## Error Scenarios

### Network Errors
- Connection timeouts
- Server errors (500, 502, 503)
- Authentication failures (401, 403)
- Rate limiting (429)

### User Input Errors
- Invalid file types
- File size limits exceeded
- Form validation failures
- Empty or malformed data

### Edge Cases
- Slow network connections
- Offline scenarios
- Browser compatibility issues
- Memory constraints on mobile devices

## Tools & Configuration

### Testing Libraries
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/user-event": "^14.4.3",
  "@testing-library/jest-dom": "^6.1.4",
  "vitest": "^1.0.0",
  "jsdom": "^22.1.0",
  "jest-axe": "^8.0.0"
}
```

### Vitest Configuration
```typescript
// vitest.config.ts highlights
{
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      thresholds: {
        global: { lines: 70, functions: 70, branches: 70 }
      }
    }
  }
}
```

## CI/CD Integration

### Test Execution Order
1. **Lint**: ESLint with React/accessibility rules
2. **Type Check**: TypeScript compilation
3. **Unit Tests**: Fast component and utility tests
4. **Integration Tests**: Service and context tests
5. **Accessibility Tests**: a11y validation
6. **Coverage Report**: Generate and validate coverage

### Failure Handling
- **Flaky Tests**: Retry up to 2 times
- **Coverage Failures**: Block deployment if below threshold
- **Accessibility Failures**: Block deployment for violations
- **Performance Regressions**: Warning alerts for performance degradation

## Maintenance & Monitoring

### Regular Tasks
- **Weekly**: Review test execution times and flaky tests
- **Sprint**: Add tests for new features and fix coverage gaps
- **Monthly**: Update dependencies and review performance metrics
- **Quarterly**: Accessibility audit and mobile device testing

### Metrics Dashboard
- Test execution time trends
- Coverage progression over time
- Flaky test identification
- Performance regression tracking

---

*Last Updated: {{ current_date }}*
*Framework: React 18 with Vite and Vitest*
*Target Coverage: 70% minimum*