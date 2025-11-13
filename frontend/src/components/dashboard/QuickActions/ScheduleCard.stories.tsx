import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Accordion } from '@/components/ui/accordion';
import { ScheduleCard } from './ScheduleCard';

const meta: Meta<typeof ScheduleCard> = {
  title: 'Dashboard/QuickActions/ScheduleCard',
  component: ScheduleCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Accordion type="multiple" defaultValue={['schedule']} className="w-full max-w-3xl">
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
        <Accordion type="multiple" defaultValue={['schedule']} className="w-full max-w-3xl">
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
