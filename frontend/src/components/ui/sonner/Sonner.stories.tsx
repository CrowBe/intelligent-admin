import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from './Sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const meta: Meta<typeof Toaster> = {
  title: 'UI/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <ThemeProvider>
      <Toaster />
      <Button onClick={() => toast('Event has been created')}>
        Show Toast
      </Button>
    </ThemeProvider>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <ThemeProvider defaultTheme="dark">
      <div className="dark">
        <Toaster />
        <Button onClick={() => toast.success('Operation completed')}>
          Show Success Toast
        </Button>
      </div>
    </ThemeProvider>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
