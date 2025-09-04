import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from './ChatMessage';

const meta: Meta<typeof ChatMessage> = {
  title: 'Chat/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Individual chat message component displaying user and AI messages with proper styling and formatting.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: { type: 'select' },
      options: ['user', 'assistant'],
      description: 'Whether the message is from user or AI assistant',
    },
    content: {
      control: 'text',
      description: 'The message content (supports markdown)',
    },
    timestamp: {
      control: 'date',
      description: 'When the message was sent',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: {
    role: 'user',
    content: 'Can you help me understand the new electrical safety regulations for NSW?',
    timestamp: new Date(),
  },
};

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    content: `Based on the latest AS/NZS 3000:2018 standard, here are the key electrical safety regulations for NSW:

**Key Requirements:**
- All electrical work must be performed by licensed electricians
- Compliance certificates required for installations over 20A
- Regular testing and tagging of portable appliances

**Recent Updates:**
- New arc fault protection requirements for residential circuits
- Updated earthing requirements for commercial installations

Would you like me to help you find a licensed electrician in your area?`,
    timestamp: new Date(Date.now() - 30000), // 30 seconds ago
  },
};

export const LongAssistantMessage: Story = {
  args: {
    role: 'assistant',
    content: `I'll help you create a comprehensive safety checklist for your electrical contracting business. Here's what you need to consider:

## Daily Safety Checklist

### Before Starting Work
- [ ] Check all tools and equipment for damage
- [ ] Verify power isolation and lockout/tagout procedures
- [ ] Ensure all team members have appropriate PPE
- [ ] Review site-specific safety requirements

### During Work
- [ ] Use appropriate testing equipment before working on circuits
- [ ] Maintain safe working distances from live parts
- [ ] Ensure proper grounding of all equipment
- [ ] Regular safety meetings with crew

### End of Day
- [ ] Secure all electrical panels and equipment
- [ ] Document any safety incidents or near-misses
- [ ] Ensure all tools are accounted for and stored safely

## Compliance Requirements

According to **WorkSafe NSW** guidelines:
1. All electrical work must comply with AS/NZS 3000:2018
2. Certificate of Compliance required for prescribed electrical work
3. Regular training updates for all licensed electricians

Would you like me to create a customized checklist for your specific type of electrical work?`,
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
  },
};

export const ErrorMessage: Story = {
  args: {
    role: 'assistant',
    content: 'I apologize, but I\'m currently unable to access the latest regulatory information. Please try again in a moment, or contact WorkSafe NSW directly at 13 10 50 for urgent compliance questions.',
    timestamp: new Date(Date.now() - 60000),
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when AI assistant cannot provide information due to service issues.',
      },
    },
  },
};

export const QuickResponse: Story = {
  args: {
    role: 'assistant',
    content: '✅ I\'ve scheduled your electrical inspection for next Tuesday at 9:00 AM with Inspector John Smith. You\'ll receive a confirmation email shortly.',
    timestamp: new Date(Date.now() - 5000), // 5 seconds ago
  },
  parameters: {
    docs: {
      description: {
        story: 'Quick acknowledgment message for completed actions.',
      },
    },
  },
};

export const RegulatoryAlert: Story = {
  args: {
    role: 'assistant',
    content: `🚨 **URGENT REGULATORY UPDATE**

New WorkSafe NSW requirements effective immediately:

**Arc Fault Circuit Interrupters (AFCI) now mandatory for:**
- All new residential bedroom circuits
- Renovations involving bedroom electrical work
- Commercial accommodation facilities

**Action Required:**
- Update your standard installation procedures
- Ensure AFCI devices are in stock
- Brief all team members on new requirements

**Compliance Deadline:** All work commencing after March 1, 2024

Need help updating your procedures? I can create a compliance checklist for your team.`,
    timestamp: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'High-priority regulatory update message requiring immediate attention.',
      },
    },
  },
};

// Mobile view testing
export const MobileUserMessage: Story = {
  args: {
    role: 'user',
    content: 'Quick question about cable sizing for a 32A circuit',
    timestamp: new Date(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'User message optimized for mobile viewing - typical on-site queries.',
      },
    },
  },
};

export const MobileAssistantResponse: Story = {
  args: {
    role: 'assistant',
    content: `For a 32A circuit in standard conditions:

**Cable Size:** 6mm² minimum
**Recommended:** 10mm² for future-proofing
**Protection:** 32A MCB or RCD

**Installation Notes:**
- Use appropriate conduit/trunking
- Consider voltage drop over distance
- Ensure earthing continuity

Need specific cable calculations for your installation distance?`,
    timestamp: new Date(Date.now() - 15000),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Mobile-optimized AI response with concise, actionable information.',
      },
    },
  },
};

// Accessibility testing story
export const AccessibilityTest: Story = {
  args: {
    role: 'assistant',
    content: 'This message tests screen reader compatibility and keyboard navigation support for accessibility compliance.',
    timestamp: new Date(),
  },
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