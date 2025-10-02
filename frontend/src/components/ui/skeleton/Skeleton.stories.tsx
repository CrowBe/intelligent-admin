import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="w-64 h-12" />,
};

export const Circle: Story = {
  render: () => <Skeleton className="w-12 h-12 rounded-full" />,
};

export const Rectangle: Story = {
  render: () => <Skeleton className="w-64 h-32" />,
};

export const Text: Story = {
  render: () => (
    <div className="space-y-2">
      <Skeleton className="w-64 h-4" />
      <Skeleton className="w-48 h-4" />
      <Skeleton className="w-56 h-4" />
    </div>
  ),
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark space-y-4">
      <Skeleton className="w-64 h-12" />
      <Skeleton className="w-48 h-8" />
      <Skeleton className="w-32 h-6" />
    </div>
  ),
};

export const LoadingCard: Story = {
  render: () => (
    <div className="w-80 border rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
      <Skeleton className="w-full h-32" />
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-4/5 h-4" />
      </div>
    </div>
  ),
};

export const LoadingJobList: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-48 h-4" />
            </div>
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const LoadingDashboard: Story = {
  render: () => (
    <div className="w-full max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-32 h-10 rounded-md" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-32 h-3" />
          </div>
        ))}
      </div>
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="w-40 h-6" />
        <Skeleton className="w-full h-64" />
      </div>
    </div>
  ),
};

export const LoadingClientCard: Story = {
  render: () => (
    <div className="w-96 border rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-40 h-5" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="w-24 h-8 rounded-md" />
        <Skeleton className="w-24 h-8 rounded-md" />
      </div>
    </div>
  ),
};

export const LoadingInvoice: Story = {
  render: () => (
    <div className="w-96 border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-24 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
      </div>
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-24 h-6" />
        </div>
      </div>
    </div>
  ),
};

export const LoadingTable: Story = {
  render: () => (
    <div className="w-full max-w-4xl space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-accent/50 p-4">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-t">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const LoadingChatMessage: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs space-y-2 ${i % 2 === 0 ? 'items-end' : 'items-start'} flex flex-col`}>
            <Skeleton className="w-32 h-4" />
            <Skeleton className={`${i % 2 === 0 ? 'w-48' : 'w-56'} h-16 rounded-lg`} />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const LoadingProfile: Story = {
  render: () => (
    <div className="w-80 border rounded-lg p-6 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="w-40 h-6" />
        <Skeleton className="w-32 h-4" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
    </div>
  ),
};

export const LoadingNotifications: Story = {
  render: () => (
    <div className="w-80 border rounded-lg divide-y">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 space-y-2">
          <div className="flex items-start space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-3" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const SmallVariants: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="w-4 h-4 rounded-full" />
      <Skeleton className="w-6 h-6 rounded-full" />
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="w-10 h-10 rounded-full" />
      <Skeleton className="w-12 h-12 rounded-full" />
    </div>
  ),
};

export const CustomAnimation: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="w-64 h-12" />
      <Skeleton className="w-64 h-12 animate-pulse [animation-duration:1s]" />
      <Skeleton className="w-64 h-12 animate-pulse [animation-duration:2s]" />
    </div>
  ),
};
