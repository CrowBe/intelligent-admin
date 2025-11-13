import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A badge component for displaying status indicators, priority labels, and notification counts in the intelligent admin interface.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual style variant of the badge',
    },
    asChild: {
      control: 'boolean',
      description: 'Use Radix Slot for rendering as a different element',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

// Trade Business Context Stories

export const UrgentStatus: Story = {
  args: {
    variant: 'destructive',
    children: 'Urgent',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge for urgent items like WorkSafe notices or compliance deadlines.',
      },
    },
  },
};

export const HighPriority: Story = {
  args: {
    variant: 'destructive',
    children: 'High Priority',
    className: 'bg-orange-600',
  },
  parameters: {
    docs: {
      description: {
        story: 'High priority emails or tasks requiring immediate attention.',
      },
    },
  },
};

export const MediumPriority: Story = {
  args: {
    variant: 'secondary',
    children: 'Medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium priority tasks or emails that should be addressed soon.',
      },
    },
  },
};

export const LowPriority: Story = {
  args: {
    variant: 'outline',
    children: 'Low Priority',
  },
  parameters: {
    docs: {
      description: {
        story: 'Low priority items that can be handled when time permits.',
      },
    },
  },
};

export const NewLead: Story = {
  args: {
    variant: 'default',
    children: 'New Lead',
    className: 'bg-blue-600',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge for new customer leads or inquiries.',
      },
    },
  },
};

export const PendingReview: Story = {
  args: {
    variant: 'secondary',
    children: 'Pending Review',
  },
  parameters: {
    docs: {
      description: {
        story: 'Documents or quotes awaiting review.',
      },
    },
  },
};

export const Approved: Story = {
  args: {
    variant: 'default',
    children: 'Approved',
    className: 'bg-green-600',
  },
  parameters: {
    docs: {
      description: {
        story: 'Approved quotes, invoices, or compliance documents.',
      },
    },
  },
};

export const Rejected: Story = {
  args: {
    variant: 'destructive',
    children: 'Rejected',
  },
  parameters: {
    docs: {
      description: {
        story: 'Rejected items or failed compliance checks.',
      },
    },
  },
};

export const InProgress: Story = {
  args: {
    variant: 'secondary',
    children: 'In Progress',
    className: 'bg-yellow-600',
  },
  parameters: {
    docs: {
      description: {
        story: 'Work orders or projects currently in progress.',
      },
    },
  },
};

export const Completed: Story = {
  args: {
    variant: 'default',
    children: 'Completed',
    className: 'bg-green-600',
  },
  parameters: {
    docs: {
      description: {
        story: 'Completed jobs or tasks.',
      },
    },
  },
};

// Notification Counts

export const NotificationCount: Story = {
  args: {
    variant: 'destructive',
    children: '3',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge for displaying notification counts.',
      },
    },
  },
};

export const LargeCount: Story = {
  args: {
    variant: 'destructive',
    children: '99+',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge for large notification counts.',
      },
    },
  },
};

export const UnreadEmails: Story = {
  args: {
    variant: 'default',
    children: '12 Unread',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge showing unread email count.',
      },
    },
  },
};

// Mobile Optimized

export const MobileView: Story = {
  args: {
    variant: 'default',
    children: 'Mobile Badge',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Badge optimized for mobile devices used by trade professionals on-site.',
      },
    },
  },
};

// Dark Mode Variants

export const DarkModeDefault: Story = {
  args: {
    children: 'Dark Mode',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Badge appearance in dark mode.',
      },
    },
  },
};

export const DarkModeDestructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Urgent',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Destructive badge appearance in dark mode with proper contrast.',
      },
    },
  },
};

// Industry Specific

export const WorkSafeNotice: Story = {
  args: {
    variant: 'destructive',
    children: '🚨 WorkSafe Notice',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge for Australian regulatory compliance notices.',
      },
    },
  },
};

export const ComplianceDue: Story = {
  args: {
    variant: 'destructive',
    children: 'Compliance Due: 3 days',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge showing upcoming compliance deadlines.',
      },
    },
  },
};

export const CertificationExpiring: Story = {
  args: {
    variant: 'secondary',
    children: 'Cert Expiring Soon',
    className: 'bg-amber-600',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge for trade certifications or licenses expiring soon.',
      },
    },
  },
};

// Combined with Icons

export const WithIcon: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
        New
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge with an icon (icon sizing handled automatically).',
      },
    },
  },
};

// Multiple Badges

export const MultipleBadges: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="destructive">Urgent</Badge>
      <Badge variant="default">High Priority</Badge>
      <Badge variant="secondary">Medium</Badge>
      <Badge variant="outline">Low</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple badges displayed together for email filtering or task categorization.',
      },
    },
  },
};

// Edge Cases

export const LongText: Story = {
  args: {
    children: 'Very Long Badge Text That Should Wrap Appropriately',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge handling long text with proper whitespace-nowrap behavior.',
      },
    },
  },
};

export const EmptyBadge: Story = {
  args: {
    children: '',
    'aria-label': 'Empty badge',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge with no content (should still render with proper spacing).',
      },
    },
  },
};
