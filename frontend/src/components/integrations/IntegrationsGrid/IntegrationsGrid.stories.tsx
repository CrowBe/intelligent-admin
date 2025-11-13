import type { Meta, StoryObj } from '@storybook/react';
import { IntegrationsGrid } from './IntegrationsGrid';
import * as useIntegrationsHook from '@/hooks/useIntegrations';
import { vi } from 'vitest';

// Mock the hook for Storybook
vi.mock('@/hooks/useIntegrations');

const mockIntegrations = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail account for intelligent email analysis',
    isConnected: true,
    benefits: ['Email urgency detection', 'Smart categorization', 'Quick replies'],
    comingSoon: false
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync your calendar for better scheduling',
    isConnected: true,
    benefits: ['Smart scheduling', 'Travel time calculations', 'Meeting prep'],
    comingSoon: false
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Manage your finances and invoicing',
    isConnected: false,
    benefits: ['Invoice tracking', 'Payment reminders', 'Financial insights'],
    comingSoon: false
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Alternative accounting platform integration',
    isConnected: false,
    benefits: ['Financial reporting', 'Expense tracking', 'Bank reconciliation'],
    comingSoon: false
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM integration for lead management',
    isConnected: false,
    benefits: ['Lead tracking', 'Deal pipeline', 'Contact management'],
    comingSoon: false
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    isConnected: false,
    benefits: ['Real-time notifications', 'Team collaboration', 'Bot commands'],
    comingSoon: true
  }
];

const meta: Meta<typeof IntegrationsGrid> = {
  title: 'Components/Integrations/IntegrationsGrid',
  component: IntegrationsGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IntegrationsGrid>;

export const Default: Story = {
  decorators: [
    (Story) => {
      vi.mocked(useIntegrationsHook.useIntegrations).mockReturnValue({
        integrations: mockIntegrations,
        loading: false,
        error: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        refresh: vi.fn()
      });
      return <Story />;
    }
  ]
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      vi.mocked(useIntegrationsHook.useIntegrations).mockReturnValue({
        integrations: [],
        loading: true,
        error: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        refresh: vi.fn()
      });
      return <Story />;
    }
  ]
};

export const Error: Story = {
  decorators: [
    (Story) => {
      vi.mocked(useIntegrationsHook.useIntegrations).mockReturnValue({
        integrations: [],
        loading: false,
        error: new Error('Failed to load integrations'),
        connect: vi.fn(),
        disconnect: vi.fn(),
        refresh: vi.fn()
      });
      return <Story />;
    }
  ]
};

export const AllConnected: Story = {
  decorators: [
    (Story) => {
      vi.mocked(useIntegrationsHook.useIntegrations).mockReturnValue({
        integrations: mockIntegrations.map(i => ({ ...i, isConnected: true, comingSoon: false })),
        loading: false,
        error: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        refresh: vi.fn()
      });
      return <Story />;
    }
  ]
};

export const NoneConnected: Story = {
  decorators: [
    (Story) => {
      vi.mocked(useIntegrationsHook.useIntegrations).mockReturnValue({
        integrations: mockIntegrations.map(i => ({ ...i, isConnected: false })),
        loading: false,
        error: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        refresh: vi.fn()
      });
      return <Story />;
    }
  ]
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => {
      vi.mocked(useIntegrationsHook.useIntegrations).mockReturnValue({
        integrations: mockIntegrations,
        loading: false,
        error: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        refresh: vi.fn()
      });
      return (
        <div className="dark">
          <Story />
        </div>
      );
    }
  ]
};
