import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DashboardHeader } from './DashboardHeader';
import type { AppUser } from '@/contexts/KindeAuthContext';

// Mock the auth context for Storybook
const mockUser: AppUser = {
  id: '123',
  email: 'john@smithrenovations.com.au',
  firstName: 'John',
  lastName: 'Smith',
  fullName: 'John Smith',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  businessName: 'Smith Renovations',
  businessType: 'renovation',
  preferences: {
    notifications: { email: true, push: false, sms: false },
    ai: { personality: 'professional', proactiveMode: true, autoSuggestions: true },
    integrations: { autoConnect: false },
  },
};

const mockUserWithoutPicture: AppUser = {
  ...mockUser,
  picture: undefined,
};

const mockUserMinimalData: AppUser = {
  id: '456',
  email: 'user@example.com',
  firstName: 'User',
  lastName: '',
  fullName: 'User',
  preferences: {
    notifications: { email: true, push: false, sms: false },
    ai: { personality: 'professional', proactiveMode: true, autoSuggestions: true },
    integrations: { autoConnect: false },
  },
};

// Create a decorator to mock the useAppAuth hook
const withMockAuth = (user: AppUser | null) => (Story: any) => {
  // Mock the useAppAuth hook
  const mockUseAppAuth = () => ({
    user,
    logout: fn(),
    isAuthenticated: !!user,
    isLoading: false,
    login: fn(),
    register: fn(),
  });

  // Override the module for this story
  const originalModule = require('@/contexts/KindeAuthContext');
  (originalModule as any).useAppAuth = mockUseAppAuth;

  return <Story />;
};

const meta: Meta<typeof DashboardHeader> = {
  title: 'Layout/DashboardHeader',
  component: DashboardHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dashboard header with user information, notifications, settings, and theme toggle. Integrates with Kinde authentication.',
      },
    },
  },
  argTypes: {
    onMenuToggle: {
      description: 'Callback fired when the mobile menu toggle is clicked',
      action: 'menu toggled',
    },
    onSettingsClick: {
      description: 'Callback fired when the settings button is clicked',
      action: 'settings clicked',
    },
    onNotificationsClick: {
      description: 'Callback fired when the notifications button is clicked',
      action: 'notifications clicked',
    },
  },
  args: {
    onMenuToggle: fn(),
    onSettingsClick: fn(),
    onNotificationsClick: fn(),
  },
  decorators: [withMockAuth(mockUser)],
};

export default meta;
type Story = StoryObj<typeof DashboardHeader>;

/**
 * Default dashboard header with authenticated user
 */
export const Default: Story = {};

/**
 * Dashboard header in dark mode
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * Dashboard header with user without profile picture
 */
export const WithoutProfilePicture: Story = {
  decorators: [withMockAuth(mockUserWithoutPicture)],
};

/**
 * Dashboard header with minimal user data
 */
export const MinimalUserData: Story = {
  decorators: [withMockAuth(mockUserMinimalData)],
};

/**
 * Dashboard header on mobile viewport
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Dashboard header on tablet viewport
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Interactive example with all callbacks enabled
 */
export const Interactive: Story = {
  args: {
    onMenuToggle: fn(() => console.log('Menu toggled')),
    onSettingsClick: fn(() => console.log('Settings clicked')),
    onNotificationsClick: fn(() => console.log('Notifications clicked')),
  },
};

/**
 * Dark mode on mobile
 */
export const DarkMobile: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * Header with long business name (testing truncation)
 */
export const LongBusinessName: Story = {
  decorators: [
    withMockAuth({
      ...mockUser,
      businessName: 'Smith & Sons Premium Renovation and Construction Services',
      fullName: 'Christopher Alexander Smith',
    }),
  ],
};
