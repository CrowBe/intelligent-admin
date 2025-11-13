import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Forms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A checkbox component built on Radix UI for form selections with accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The controlled checked state of the checkbox',
    },
    disabled: {
      control: 'boolean',
      description: 'When true, prevents interaction',
    },
    required: {
      control: 'boolean',
      description: 'When true, indicates the checkbox is required',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default',
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox {...args} />
      <Label htmlFor="default">Accept terms and conditions</Label>
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
      <Checkbox {...args} />
      <Label htmlFor="checked">I agree to the terms</Label>
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
      <Checkbox {...args} />
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
      <Checkbox {...args} />
      <Label htmlFor="disabled-checked">Disabled and checked</Label>
    </div>
  ),
};

export const WithFormValidation: Story = {
  args: {
    id: 'validation',
    'aria-invalid': true,
  },
  render: (args) => (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox {...args} />
        <Label htmlFor="validation">I accept the safety requirements</Label>
      </div>
      <p className="text-sm text-destructive">This field is required</p>
    </div>
  ),
};

export const TradeBusinessSafetyChecklist: Story = {
  render: () => (
    <div className="w-80 space-y-3">
      <h3 className="font-semibold text-sm mb-3">Job Site Safety Checklist</h3>
      <div className="flex items-center space-x-2">
        <Checkbox id="ppe" defaultChecked />
        <Label htmlFor="ppe">PPE equipment verified</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="permits" defaultChecked />
        <Label htmlFor="permits">Work permits obtained</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="hazards" />
        <Label htmlFor="hazards">Hazard assessment complete</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="tools" />
        <Label htmlFor="tools">Tools inspection done</Label>
      </div>
    </div>
  ),
};

export const TradeBusinessInvoiceApproval: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Invoice #INV-2024-0142</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="materials-verified" defaultChecked />
          <Label htmlFor="materials-verified">Materials quantities verified</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="pricing-correct" defaultChecked />
          <Label htmlFor="pricing-correct">Pricing matches quote</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="gst-applied" />
          <Label htmlFor="gst-applied">GST correctly applied (10%)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="ready-payment" />
          <Label htmlFor="ready-payment">Ready for payment approval</Label>
        </div>
      </div>
    </div>
  ),
};

export const TradeBusinessServiceAgreement: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Service Agreement Terms</h3>
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox id="scope" className="mt-1" />
          <Label htmlFor="scope" className="leading-normal">
            I understand the scope of work and timeline (14 business days)
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox id="payment" className="mt-1" />
          <Label htmlFor="payment" className="leading-normal">
            I agree to the payment terms (50% deposit, 50% on completion)
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox id="warranty" className="mt-1" />
          <Label htmlFor="warranty" className="leading-normal">
            I acknowledge the 12-month workmanship warranty
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox id="compliance" className="mt-1" required aria-invalid={true} />
          <Label htmlFor="compliance" className="leading-normal">
            I confirm compliance with Australian Building Code requirements *
          </Label>
        </div>
      </div>
    </div>
  ),
};
