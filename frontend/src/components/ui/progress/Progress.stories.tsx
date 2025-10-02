import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => (
    <div className="w-96">
      <Progress value={60} />
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark">
      <div className="w-96">
        <Progress value={75} />
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
