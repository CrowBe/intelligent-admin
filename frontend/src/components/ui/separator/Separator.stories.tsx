import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './Separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium">shadcn/ui</h4>
        <p className="text-sm text-muted-foreground">
          Beautifully designed components.
        </p>
      </div>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <Separator orientation="horizontal" />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-24 items-center">
      <div className="px-4">
        <span className="text-sm">Item 1</span>
      </div>
      <Separator orientation="vertical" />
      <div className="px-4">
        <span className="text-sm">Item 2</span>
      </div>
      <Separator orientation="vertical" />
      <div className="px-4">
        <span className="text-sm">Item 3</span>
      </div>
    </div>
  ),
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="w-64 dark">
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-white">Dark Mode Content</h4>
        <p className="text-sm text-gray-400">
          Separator appears lighter on dark backgrounds.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-white">More Content</h4>
        <p className="text-sm text-gray-400">
          Automatic contrast adjustment.
        </p>
      </div>
    </div>
  ),
};

export const JobDetailsSections: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold">Job #1234</h3>
        <p className="text-sm text-muted-foreground">Plumbing Installation</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium mb-2">Client Details</h4>
        <p className="text-sm">John Smith</p>
        <p className="text-sm text-muted-foreground">123 Main St, Sydney</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium mb-2">Schedule</h4>
        <p className="text-sm">Monday, 9:00 AM - 11:00 AM</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium mb-2">Notes</h4>
        <p className="text-sm text-muted-foreground">
          Customer requested specific fixtures
        </p>
      </div>
    </div>
  ),
};

export const MenuDivider: Story = {
  render: () => (
    <div className="w-56 border rounded-md p-2 space-y-1">
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
        Edit Job
      </div>
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
        View Details
      </div>
      <Separator className="my-1" />
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
        Share
      </div>
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">
        Export
      </div>
      <Separator className="my-1" />
      <div className="px-2 py-1.5 text-sm text-destructive hover:bg-accent rounded cursor-pointer">
        Delete Job
      </div>
    </div>
  ),
};

export const InvoiceSections: Story = {
  render: () => (
    <div className="w-96 border rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold">Invoice #INV-2024-001</h2>
        <p className="text-sm text-muted-foreground">Due: Oct 15, 2025</p>
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Labour (4 hours)</span>
          <span>$400.00</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Materials</span>
          <span>$150.00</span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between font-bold">
        <span>Total (inc. GST)</span>
        <span>$605.00</span>
      </div>
    </div>
  ),
};

export const ToolbarDividers: Story = {
  render: () => (
    <div className="flex items-center h-12 px-2 border rounded-md gap-2">
      <button className="px-3 py-1 text-sm hover:bg-accent rounded">
        New Job
      </button>
      <Separator orientation="vertical" className="h-6" />
      <button className="px-3 py-1 text-sm hover:bg-accent rounded">
        Filter
      </button>
      <button className="px-3 py-1 text-sm hover:bg-accent rounded">
        Sort
      </button>
      <Separator orientation="vertical" className="h-6" />
      <button className="px-3 py-1 text-sm hover:bg-accent rounded">
        Export
      </button>
    </div>
  ),
};

export const CustomSpacing: Story = {
  render: () => (
    <div className="w-64 space-y-6">
      <div>
        <p className="text-sm">Tight spacing</p>
        <Separator className="my-2" />
        <p className="text-sm">Content below</p>
      </div>
      <div>
        <p className="text-sm">Medium spacing</p>
        <Separator className="my-4" />
        <p className="text-sm">Content below</p>
      </div>
      <div>
        <p className="text-sm">Large spacing</p>
        <Separator className="my-8" />
        <p className="text-sm">Content below</p>
      </div>
    </div>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <div>
        <p className="text-sm">Default border color</p>
        <Separator className="my-2" />
        <p className="text-sm">Content below</p>
      </div>
      <div>
        <p className="text-sm">Primary color</p>
        <Separator className="my-2 bg-primary" />
        <p className="text-sm">Content below</p>
      </div>
      <div>
        <p className="text-sm">Destructive color</p>
        <Separator className="my-2 bg-destructive" />
        <p className="text-sm">Content below</p>
      </div>
    </div>
  ),
};

export const NonDecorative: Story = {
  render: () => (
    <div className="w-64">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Section 1</h4>
        <p className="text-sm text-muted-foreground">
          First section content
        </p>
      </div>
      <Separator decorative={false} className="my-4" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Section 2</h4>
        <p className="text-sm text-muted-foreground">
          Second section content (separator is accessible)
        </p>
      </div>
    </div>
  ),
};

export const ClientListGrouping: Story = {
  render: () => (
    <div className="w-80 border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Recent Clients</h3>
      <div className="space-y-3">
        <div>
          <p className="font-medium text-sm">ABC Construction</p>
          <p className="text-xs text-muted-foreground">3 active jobs</p>
        </div>
        <Separator />
        <div>
          <p className="font-medium text-sm">Smith Builders</p>
          <p className="text-xs text-muted-foreground">1 active job</p>
        </div>
        <Separator />
        <div>
          <p className="font-medium text-sm">Jones Plumbing</p>
          <p className="text-xs text-muted-foreground">5 active jobs</p>
        </div>
      </div>
    </div>
  ),
};

export const DashboardWidget: Story = {
  render: () => (
    <div className="w-96 border rounded-lg p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Today&apos;s Overview</h3>
        <p className="text-sm text-muted-foreground">Monday, Oct 1, 2025</p>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold">8</p>
          <p className="text-xs text-muted-foreground">Scheduled Jobs</p>
        </div>
        <div>
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-muted-foreground">Urgent Tasks</p>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold">$2,450</p>
          <p className="text-xs text-muted-foreground">Today&apos;s Revenue</p>
        </div>
        <div>
          <p className="text-2xl font-bold">95%</p>
          <p className="text-xs text-muted-foreground">On-Time Rate</p>
        </div>
      </div>
    </div>
  ),
};
