import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip content</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithLongText: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Long content</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a longer tooltip with more detailed information for the user.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Dark mode tooltip</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip in dark mode</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
