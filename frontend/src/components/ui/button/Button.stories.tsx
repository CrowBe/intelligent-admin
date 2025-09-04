import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states for the intelligent admin interface.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
  args: {
    onClick: () => console.log('Button clicked'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Send Message',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Cancel',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Document',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'View Details',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Skip',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Learn More',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: 'Processing...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state - typically used during AI processing or document uploads.',
      },
    },
  },
};

// Mobile responsiveness story
export const MobileView: Story = {
  args: {
    children: 'Chat with AI Assistant',
    className: 'w-full',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Button optimized for mobile devices used by trade professionals on-site.',
      },
    },
  },
};

// Trade business context stories
export const UrgentAction: Story = {
  args: {
    variant: 'destructive',
    children: '🚨 Urgent: Review WorkSafe Notice',
    className: 'w-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button for urgent actions like compliance notices from Australian regulatory bodies.',
      },
    },
  },
};

export const AIAssistant: Story = {
  args: {
    children: '🤖 Ask AI Assistant',
    className: 'bg-blue-600 hover:bg-blue-700',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary action button for interacting with the AI assistant.',
      },
    },
  },
};