import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Accordion } from '@/components/ui/accordion';
import { LeadsCard } from './LeadsCard';

const meta: Meta<typeof LeadsCard> = {
  title: 'Dashboard/QuickActions/LeadsCard',
  component: LeadsCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Accordion type="multiple" defaultValue={['leads']} className="w-full max-w-3xl">
        <Story />
      </Accordion>
    ),
  ],
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
        <Accordion type="multiple" defaultValue={['leads']} className="w-full max-w-3xl">
          <Story />
        </Accordion>
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
