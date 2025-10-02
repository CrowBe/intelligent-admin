import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Forms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A select dropdown component built on Radix UI with support for grouping, separators, and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col space-y-2 w-64">
      <Label htmlFor="select-with-label">Choose an option</Label>
      <Select>
        <SelectTrigger id="select-with-label">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]" size="sm">
        <SelectValue placeholder="Small select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const TradeBusinessJobStatus: Story = {
  render: () => (
    <div className="w-96 p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Update Job Status</h3>
      <div className="flex flex-col space-y-2">
        <Label htmlFor="job-status">Current status</Label>
        <Select defaultValue="in-progress">
          <SelectTrigger id="job-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">📅 Scheduled</SelectItem>
            <SelectItem value="in-progress">🔨 In Progress</SelectItem>
            <SelectItem value="pending-materials">⏳ Pending Materials</SelectItem>
            <SelectItem value="on-hold">⏸️ On Hold</SelectItem>
            <SelectItem value="completed">✅ Completed</SelectItem>
            <SelectItem value="cancelled">❌ Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const TradeBusinessStateSelector: Story = {
  render: () => (
    <div className="w-96 p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Service Location</h3>
      <div className="flex flex-col space-y-2">
        <Label htmlFor="state">Australian state/territory</Label>
        <Select defaultValue="nsw">
          <SelectTrigger id="state">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>States</SelectLabel>
              <SelectItem value="nsw">New South Wales</SelectItem>
              <SelectItem value="vic">Victoria</SelectItem>
              <SelectItem value="qld">Queensland</SelectItem>
              <SelectItem value="wa">Western Australia</SelectItem>
              <SelectItem value="sa">South Australia</SelectItem>
              <SelectItem value="tas">Tasmania</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Territories</SelectLabel>
              <SelectItem value="act">Australian Capital Territory</SelectItem>
              <SelectItem value="nt">Northern Territory</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const TradeBusinessInvoiceTerms: Story = {
  render: () => (
    <div className="w-96 p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Invoice Settings</h3>
      <div className="flex flex-col space-y-2">
        <Label htmlFor="payment-terms">Payment terms</Label>
        <Select defaultValue="net30">
          <SelectTrigger id="payment-terms">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due-on-receipt">Due on receipt</SelectItem>
            <SelectItem value="net7">Net 7 days</SelectItem>
            <SelectItem value="net14">Net 14 days</SelectItem>
            <SelectItem value="net30">Net 30 days</SelectItem>
            <SelectItem value="net60">Net 60 days</SelectItem>
            <SelectItem value="net90">Net 90 days</SelectItem>
            <SelectSeparator />
            <SelectItem value="custom">Custom terms</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const TradeBusinessPriorityFilter: Story = {
  render: () => (
    <div className="w-96 p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Filter Jobs</h3>
      <div className="flex space-x-4">
        <div className="flex-1 flex flex-col space-y-2">
          <Label htmlFor="priority-filter">Priority level</Label>
          <Select>
            <SelectTrigger id="priority-filter" size="sm">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectSeparator />
              <SelectItem value="urgent">🔴 Urgent</SelectItem>
              <SelectItem value="high">🟡 High</SelectItem>
              <SelectItem value="normal">🟢 Normal</SelectItem>
              <SelectItem value="low">⚪ Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 flex flex-col space-y-2">
          <Label htmlFor="date-filter">Date range</Label>
          <Select>
            <SelectTrigger id="date-filter" size="sm">
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  ),
};

export const TradeBusinessTradeType: Story = {
  render: () => (
    <div className="w-96 p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Business Registration</h3>
      <div className="flex flex-col space-y-2">
        <Label htmlFor="trade-type">
          Trade type <span className="text-destructive">*</span>
        </Label>
        <Select>
          <SelectTrigger id="trade-type">
            <SelectValue placeholder="Select your trade" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Building Trades</SelectLabel>
              <SelectItem value="builder">Builder / Carpenter</SelectItem>
              <SelectItem value="plumber">Plumber</SelectItem>
              <SelectItem value="electrician">Electrician</SelectItem>
              <SelectItem value="painter">Painter / Decorator</SelectItem>
              <SelectItem value="plasterer">Plasterer</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Mechanical Trades</SelectLabel>
              <SelectItem value="hvac">HVAC Technician</SelectItem>
              <SelectItem value="mechanic">Mechanic</SelectItem>
              <SelectItem value="refrigeration">Refrigeration Tech</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Specialist Trades</SelectLabel>
              <SelectItem value="landscaper">Landscaper</SelectItem>
              <SelectItem value="tiler">Tiler</SelectItem>
              <SelectItem value="roofer">Roofer</SelectItem>
              <SelectItem value="glazier">Glazier</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};
