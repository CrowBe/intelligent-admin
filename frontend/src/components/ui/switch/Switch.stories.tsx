import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Forms/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle switch component built on Radix UI for binary on/off selections with accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The controlled checked state of the switch',
    },
    disabled: {
      control: 'boolean',
      description: 'When true, prevents interaction',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default',
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <Label htmlFor="default">Enable notifications</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    id: 'checked',
    defaultChecked: true,
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <Label htmlFor="checked">Enabled by default</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    id: 'disabled',
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <Label htmlFor="disabled">Disabled option</Label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  args: {
    id: 'disabled-checked',
    disabled: true,
    defaultChecked: true,
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <Label htmlFor="disabled-checked">Disabled and on</Label>
    </div>
  ),
};

export const TradeBusinessNotificationSettings: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Notification Preferences</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="urgent-jobs" className="flex-1">
            Urgent job alerts
          </Label>
          <Switch id="urgent-jobs" defaultChecked />
        </div>
        <p className="text-xs text-muted-foreground ml-0">
          Get notified immediately for urgent jobs
        </p>

        <div className="flex items-center justify-between mt-4">
          <Label htmlFor="payment-reminders" className="flex-1">
            Payment reminders
          </Label>
          <Switch id="payment-reminders" defaultChecked />
        </div>
        <p className="text-xs text-muted-foreground ml-0">
          Remind clients about overdue invoices
        </p>

        <div className="flex items-center justify-between mt-4">
          <Label htmlFor="weekly-summary" className="flex-1">
            Weekly summary email
          </Label>
          <Switch id="weekly-summary" />
        </div>
        <p className="text-xs text-muted-foreground ml-0">
          Receive a weekly report every Monday
        </p>
      </div>
    </div>
  ),
};

export const TradeBusinessJobSettings: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Job Management Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="auto-schedule">Auto-schedule jobs</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically assign jobs to available time slots
            </p>
          </div>
          <Switch id="auto-schedule" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="travel-time">Include travel time</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Add buffer time for travel between jobs
            </p>
          </div>
          <Switch id="travel-time" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="send-confirmation">Send confirmations</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Email clients 24h before scheduled jobs
            </p>
          </div>
          <Switch id="send-confirmation" />
        </div>
      </div>
    </div>
  ),
};

export const TradeBusinessInvoiceAutomation: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Invoice Automation</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="auto-invoice">Auto-generate invoices</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Create invoices automatically on job completion
            </p>
          </div>
          <Switch id="auto-invoice" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="include-gst">Apply GST (10%)</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically add GST to all invoices
            </p>
          </div>
          <Switch id="include-gst" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="late-fees">Charge late fees</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Add 2% monthly fee for overdue payments
            </p>
          </div>
          <Switch id="late-fees" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="email-invoice">Email invoices</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Send invoices directly to client email
            </p>
          </div>
          <Switch id="email-invoice" defaultChecked />
        </div>
      </div>
    </div>
  ),
};

export const TradeBusinessPrivacySettings: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Privacy & Data Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="share-location">Share location with clients</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Let clients track your arrival time
            </p>
          </div>
          <Switch id="share-location" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="public-profile">Public business profile</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Make your profile visible to new clients
            </p>
          </div>
          <Switch id="public-profile" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="testimonials">Show testimonials</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Display client reviews on your profile
            </p>
          </div>
          <Switch id="testimonials" defaultChecked />
        </div>
      </div>
    </div>
  ),
};

export const TradeBusinessFeatureToggles: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Beta Features</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Try out new features before they're officially released
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="ai-scheduling">AI-powered scheduling</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Let AI optimize your job schedule
            </p>
          </div>
          <Switch id="ai-scheduling" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="voice-notes">Voice notes for jobs</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Add voice memos to job records
            </p>
          </div>
          <Switch id="voice-notes" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="photo-recognition">Photo recognition</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-categorize job site photos
            </p>
          </div>
          <Switch id="photo-recognition" />
        </div>
      </div>
    </div>
  ),
};
