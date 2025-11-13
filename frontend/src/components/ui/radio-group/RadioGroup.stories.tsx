import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Forms/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A radio group component built on Radix UI for mutually exclusive selections with accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'The controlled value of the radio group',
    },
    disabled: {
      control: 'boolean',
      description: 'When true, prevents interaction with all radio buttons',
    },
    required: {
      control: 'boolean',
      description: 'When true, indicates the radio group is required',
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="r1" />
        <Label htmlFor="r1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="r2" />
        <Label htmlFor="r2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="r3" />
        <Label htmlFor="r3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="r1-disabled" />
        <Label htmlFor="r1-disabled">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="r2-disabled" />
        <Label htmlFor="r2-disabled">Option 2</Label>
      </div>
    </RadioGroup>
  ),
};

export const DisabledItem: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="r1-enabled" />
        <Label htmlFor="r1-enabled">Enabled option</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="r2-disabled-item" disabled />
        <Label htmlFor="r2-disabled-item">Disabled option</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="r3-enabled" />
        <Label htmlFor="r3-enabled">Another enabled option</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <div className="space-y-2">
      <RadioGroup required>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="r-yes" aria-invalid={true} />
          <Label htmlFor="r-yes">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="r-no" aria-invalid={true} />
          <Label htmlFor="r-no">No</Label>
        </div>
      </RadioGroup>
      <p className="text-sm text-destructive">Please select an option</p>
    </div>
  ),
};

export const TradeBusinessPaymentMethod: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Payment Method</h3>
      <RadioGroup defaultValue="bank-transfer">
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="bank-transfer" id="bank-transfer" className="mt-1" />
          <Label htmlFor="bank-transfer" className="leading-normal">
            <div>
              <div className="font-semibold">Bank Transfer</div>
              <div className="text-sm text-muted-foreground">
                Direct deposit to business account (no fees)
              </div>
            </div>
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="credit-card" id="credit-card" className="mt-1" />
          <Label htmlFor="credit-card" className="leading-normal">
            <div>
              <div className="font-semibold">Credit Card</div>
              <div className="text-sm text-muted-foreground">
                Visa, Mastercard, Amex (1.5% surcharge applies)
              </div>
            </div>
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="cash" id="cash" className="mt-1" />
          <Label htmlFor="cash" className="leading-normal">
            <div>
              <div className="font-semibold">Cash</div>
              <div className="text-sm text-muted-foreground">
                Payment on completion
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const TradeBusinessPriority: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Job Priority Level</h3>
      <RadioGroup defaultValue="normal">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="urgent" id="urgent" />
          <Label htmlFor="urgent">
            🔴 Urgent - Same day service required
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="high" id="high" />
          <Label htmlFor="high">
            🟡 High - Within 2-3 business days
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="normal" id="normal" />
          <Label htmlFor="normal">
            🟢 Normal - Within 1 week
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="low" id="low" />
          <Label htmlFor="low">
            ⚪ Low - Flexible timing
          </Label>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const TradeBusinessInvoiceSchedule: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Invoice Schedule</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select when to send invoices to clients
      </p>
      <RadioGroup defaultValue="completion">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="completion" id="completion" />
          <Label htmlFor="completion">On job completion</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="weekly" id="weekly" />
          <Label htmlFor="weekly">Weekly batch (every Friday)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="monthly" id="monthly" />
          <Label htmlFor="monthly">End of month</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="manual" id="manual" />
          <Label htmlFor="manual">Manual approval required</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const TradeBusinessGSTHandling: Story = {
  render: () => (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">GST Tax Treatment</h3>
      <RadioGroup defaultValue="gst-registered">
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="gst-registered" id="gst-registered" className="mt-1" />
          <Label htmlFor="gst-registered" className="leading-normal">
            <div>
              <div className="font-semibold">GST Registered</div>
              <div className="text-sm text-muted-foreground">
                Add 10% GST to all invoices
              </div>
            </div>
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="not-registered" id="not-registered" className="mt-1" />
          <Label htmlFor="not-registered" className="leading-normal">
            <div>
              <div className="font-semibold">Not GST Registered</div>
              <div className="text-sm text-muted-foreground">
                Turnover under $75,000 threshold
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  ),
};
