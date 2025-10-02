import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const meta = {
  title: 'UI/Forms/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A label component built on Radix UI for form field labeling with accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: 'text',
      description: 'The id of the form element this label is associated with',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label text',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col space-y-2 w-64">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="flex flex-col space-y-2 w-64">
      <Label htmlFor="company">
        Company name <span className="text-destructive">*</span>
      </Label>
      <Input id="company" required placeholder="Enter company name" />
    </div>
  ),
};

export const WithHelpText: Story = {
  render: () => (
    <div className="flex flex-col space-y-2 w-80">
      <Label htmlFor="abn">Australian Business Number (ABN)</Label>
      <Input id="abn" placeholder="XX XXX XXX XXX" />
      <p className="text-xs text-muted-foreground">
        Your 11-digit ABN for tax and invoicing purposes
      </p>
    </div>
  ),
};

export const TradeBusinessClientForm: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg mb-2">New Client Details</h3>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="client-name">
          Client name <span className="text-destructive">*</span>
        </Label>
        <Input id="client-name" required placeholder="John Smith" />
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="client-phone">Phone number</Label>
        <Input id="client-phone" type="tel" placeholder="04XX XXX XXX" />
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="client-address">Site address</Label>
        <Input id="client-address" placeholder="123 Main St, Sydney NSW" />
      </div>
    </div>
  ),
};

export const TradeBusinessQuoteForm: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg mb-2">Quote Details</h3>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="quote-title">
          Project title <span className="text-destructive">*</span>
        </Label>
        <Input id="quote-title" required placeholder="Kitchen renovation" />
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="quote-amount">
          Quote amount (ex GST)
        </Label>
        <Input id="quote-amount" type="number" placeholder="10000.00" />
        <p className="text-xs text-muted-foreground">
          GST (10%) will be calculated automatically
        </p>
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="quote-valid">Valid until</Label>
        <Input id="quote-valid" type="date" />
      </div>
    </div>
  ),
};

export const TradeBusinessJobSchedule: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg mb-2">Schedule Job</h3>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="job-date">
          Start date <span className="text-destructive">*</span>
        </Label>
        <Input id="job-date" type="date" required />
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="job-time">Estimated start time</Label>
        <Input id="job-time" type="time" defaultValue="08:00" />
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="job-duration">Duration (hours)</Label>
        <Input id="job-duration" type="number" min="1" defaultValue="4" />
      </div>

      <div className="flex items-start space-x-2 mt-4">
        <Checkbox id="site-access" className="mt-1" />
        <Label htmlFor="site-access">
          Confirmed site access and parking available
        </Label>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col space-y-2 w-64" data-disabled="true">
      <Label htmlFor="disabled-input">Disabled field</Label>
      <Input id="disabled-input" disabled placeholder="Cannot edit" />
    </div>
  ),
};
