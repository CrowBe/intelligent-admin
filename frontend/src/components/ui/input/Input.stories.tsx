/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile input component for forms with support for multiple input types, validation states, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date'],
      description: 'HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    'aria-invalid': {
      control: 'boolean',
      description: 'Whether the input has validation errors',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'your.email@example.com',
  },
  parameters: {
    docs: {
      description: {
        story: 'Email input with proper validation type for email addresses.',
      },
    },
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
  parameters: {
    docs: {
      description: {
        story: 'Password input with masked text entry.',
      },
    },
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
  parameters: {
    docs: {
      description: {
        story: 'Number input with numeric keyboard on mobile devices.',
      },
    },
  },
};

export const Telephone: Story = {
  args: {
    type: 'tel',
    placeholder: '(02) 1234 5678',
  },
  parameters: {
    docs: {
      description: {
        story: 'Telephone input optimized for phone number entry.',
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Search documents...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with helpful placeholder text to guide user input.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled input that prevents user interaction.',
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Pre-filled value',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with a pre-filled default value.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    placeholder: 'Enter valid email',
    'aria-invalid': true,
    'aria-describedby': 'error-message',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
        <p id="error-message" style={{ color: 'hsl(var(--destructive))', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Please enter a valid email address
        </p>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Input in error state with validation message for user feedback.',
      },
    },
  },
};

export const CustomClassName: Story = {
  args: {
    placeholder: 'Custom styled input',
    className: 'font-bold text-lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input with custom className for additional styling.',
      },
    },
  },
};

// Trade Business Context Stories

export const BusinessName: Story = {
  args: {
    type: 'text',
    placeholder: 'ABC Plumbing Services Pty Ltd',
    'aria-label': 'Business name',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input for Australian business name entry during onboarding.',
      },
    },
  },
};

export const ABN: Story = {
  args: {
    type: 'text',
    placeholder: '12 345 678 901',
    maxLength: 14,
    pattern: '\\d{2} \\d{3} \\d{3} \\d{3}',
    'aria-label': 'Australian Business Number (ABN)',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input for Australian Business Number (ABN) with validation pattern.',
      },
    },
  },
};

export const ClientEmail: Story = {
  args: {
    type: 'email',
    placeholder: 'client@example.com',
    'aria-label': 'Client email address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Email input for client contact information in trade business CRM.',
      },
    },
  },
};

export const ClientPhone: Story = {
  args: {
    type: 'tel',
    placeholder: '0412 345 678',
    'aria-label': 'Client phone number',
  },
  parameters: {
    docs: {
      description: {
        story: 'Phone number input for Australian mobile numbers.',
      },
    },
  },
};

export const JobAddress: Story = {
  args: {
    type: 'text',
    placeholder: '123 Main St, Sydney NSW 2000',
    'aria-label': 'Job site address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Address input for job site location in trade business workflow.',
      },
    },
  },
};

export const QuoteAmount: Story = {
  args: {
    type: 'number',
    placeholder: '0.00',
    min: '0',
    step: '0.01',
    'aria-label': 'Quote amount (AUD)',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>$</span>
        <Story />
        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>AUD</span>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Currency input for quote amounts in Australian dollars.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    type: 'text',
    placeholder: 'Search...',
    className: 'w-full',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Input optimized for mobile devices used by trade professionals on-site.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    placeholder: 'Dark mode input',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Input component in dark mode theme.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: '2rem', backgroundColor: 'hsl(var(--background))' }}>
        <Story />
      </div>
    ),
  ],
};

export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search emails, documents, contacts...',
    'aria-label': 'Search',
  },
  parameters: {
    docs: {
      description: {
        story: 'Search input for AI assistant queries and document search.',
      },
    },
  },
};
