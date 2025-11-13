import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { QuickActions } from './QuickActions';

const meta: Meta<typeof QuickActions> = {
  title: 'Dashboard/QuickActions/QuickActions',
  component: QuickActions,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onChatAbout: { action: 'chatAbout' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChatAbout: fn(),
  },
};

export const DarkMode: Story = {
  args: {
    onChatAbout: fn(),
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

export const WithoutChatHandler: Story = {
  args: {},
};

export const Mobile: Story = {
  args: {
    onChatAbout: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const AllExpanded: Story = {
  args: {
    onChatAbout: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'All accordion sections expanded by default (emails, schedule, leads).',
      },
    },
  },
};

export const Desktop: Story = {
  args: {
    onChatAbout: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
