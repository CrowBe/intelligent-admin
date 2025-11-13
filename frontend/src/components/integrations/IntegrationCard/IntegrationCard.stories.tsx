import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Mail, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { IntegrationCard } from './IntegrationCard';

const meta: Meta<typeof IntegrationCard> = {
  title: 'Integrations/IntegrationCard',
  component: IntegrationCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onConnect: { action: 'connect' },
    onDisconnect: { action: 'disconnect' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NotConnected: Story = {
  args: {
    title: 'Gmail',
    description: 'Email integration for seamless communication',
    icon: <Mail className="w-5 h-5 text-blue-600" />,
    connected: false,
    benefits: [
      'Automatic email categorization',
      'Smart priority detection',
      'Real-time sync'
    ],
    onConnect: fn(),
  },
};

export const Connected: Story = {
  args: {
    title: 'Gmail',
    description: 'Email integration for seamless communication',
    icon: <Mail className="w-5 h-5 text-blue-600" />,
    connected: true,
    benefits: [
      'Automatic email categorization',
      'Smart priority detection',
      'Real-time sync'
    ],
    onDisconnect: fn(),
  },
};

export const ComingSoon: Story = {
  args: {
    title: 'QuickBooks',
    description: 'Financial management and invoicing',
    icon: <DollarSign className="w-5 h-5 text-green-600" />,
    connected: false,
    comingSoon: true,
    benefits: [
      'Automated invoicing',
      'Expense tracking',
      'Financial reports'
    ],
  },
};

export const CalendarIntegration: Story = {
  args: {
    title: 'Google Calendar',
    description: 'Schedule management and meeting coordination',
    icon: <Calendar className="w-5 h-5 text-orange-600" />,
    connected: true,
    benefits: [
      'Automatic scheduling',
      'Meeting reminders',
      'Calendar sync'
    ],
    onDisconnect: fn(),
  },
};

export const NoBenefits: Story = {
  args: {
    title: 'Slack',
    description: 'Team communication and collaboration',
    icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
    connected: false,
    onConnect: fn(),
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Gmail',
    description: 'Email integration for seamless communication',
    icon: <Mail className="w-5 h-5 text-blue-400" />,
    connected: false,
    benefits: [
      'Automatic email categorization',
      'Smart priority detection',
      'Real-time sync'
    ],
    onConnect: fn(),
  },
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

export const Mobile: Story = {
  args: {
    title: 'Gmail',
    description: 'Email integration for seamless communication',
    icon: <Mail className="w-5 h-5 text-blue-600" />,
    connected: false,
    benefits: [
      'Automatic email categorization',
      'Smart priority detection',
      'Real-time sync'
    ],
    onConnect: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
