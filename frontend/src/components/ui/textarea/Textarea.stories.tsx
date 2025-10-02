import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Textarea placeholder="Type your message..." />,
};

export const WithValue: Story = {
  render: () => (
    <Textarea
      defaultValue="This is some example text in the textarea component."
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Textarea
      disabled
      placeholder="This textarea is disabled"
      defaultValue="You cannot edit this text"
    />
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <label htmlFor="message" className="text-sm font-medium">
        Message
      </label>
      <Textarea id="message" placeholder="Enter your message here..." />
    </div>
  ),
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark w-96">
      <Textarea
        placeholder="Type in dark mode..."
        defaultValue="This is how the textarea looks in dark mode"
      />
    </div>
  ),
};

export const JobNotes: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <label htmlFor="job-notes" className="text-sm font-medium">
        Job Notes
      </label>
      <Textarea
        id="job-notes"
        placeholder="Enter job details, requirements, or special instructions..."
        rows={6}
        defaultValue="Customer requested specific fixtures for bathroom installation.
Access through side gate.
Materials ordered - ETA Thursday.
Need to confirm final measurements on site."
      />
      <p className="text-xs text-muted-foreground">
        Add any important details about this job
      </p>
    </div>
  ),
};

export const ClientMessage: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <label htmlFor="client-message" className="text-sm font-medium">
        Message to Client
      </label>
      <Textarea
        id="client-message"
        placeholder="Type your message to the client..."
        rows={5}
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          This will be sent via email
        </p>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          Send
        </button>
      </div>
    </div>
  ),
};

export const QuoteDescription: Story = {
  render: () => (
    <div className="w-full max-w-2xl border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Create Quote</h3>
      <div className="space-y-2">
        <label htmlFor="quote-desc" className="text-sm font-medium">
          Work Description
        </label>
        <Textarea
          id="quote-desc"
          placeholder="Describe the work to be completed..."
          rows={8}
          defaultValue="Complete bathroom renovation including:
- Remove existing fixtures and tiles
- Install new plumbing for walk-in shower
- Tile floor and walls
- Install new vanity and toilet
- Paint ceiling and install exhaust fan

Materials to be supplied by customer.
Estimated duration: 5-7 working days."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Labour Cost</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="$0.00"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Materials Cost</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="$0.00"
          />
        </div>
      </div>
    </div>
  ),
};

export const InvoiceNotes: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <label htmlFor="invoice-notes" className="text-sm font-medium">
        Invoice Notes
      </label>
      <Textarea
        id="invoice-notes"
        placeholder="Add payment terms, thank you message, or other notes..."
        rows={4}
        defaultValue="Payment due within 14 days.
Bank transfer details: BSB 123-456, Account 78901234

Thank you for your business!"
      />
    </div>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <label htmlFor="error-textarea" className="text-sm font-medium">
        Description
      </label>
      <Textarea
        id="error-textarea"
        placeholder="Enter description..."
        aria-invalid={true}
        defaultValue="This is too short"
      />
      <p className="text-xs text-destructive">
        Description must be at least 50 characters
      </p>
    </div>
  ),
};

export const CharacterCount: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    const maxLength = 500;

    return (
      <div className="w-96 space-y-2">
        <label htmlFor="char-count" className="text-sm font-medium">
          Job Description
        </label>
        <Textarea
          id="char-count"
          placeholder="Enter job description..."
          rows={6}
          maxLength={maxLength}
          onChange={(e) => setCount(e.target.value.length)}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Maximum {maxLength} characters
          </p>
          <p className={`text-xs ${count > maxLength * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {count} / {maxLength}
          </p>
        </div>
      </div>
    );
  },
};

export const AutoGrow: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <label htmlFor="auto-grow" className="text-sm font-medium">
        Notes (Auto-grow)
      </label>
      <Textarea
        id="auto-grow"
        placeholder="Start typing and this will grow..."
        className="min-h-16 max-h-96"
        rows={3}
      />
      <p className="text-xs text-muted-foreground">
        This textarea will grow as you type
      </p>
    </div>
  ),
};

export const CustomRows: Story = {
  render: () => (
    <div className="w-96 space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Small (3 rows)</label>
        <Textarea rows={3} placeholder="Short message..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Medium (6 rows)</label>
        <Textarea rows={6} placeholder="Medium length message..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Large (10 rows)</label>
        <Textarea rows={10} placeholder="Long detailed message..." />
      </div>
    </div>
  ),
};

export const FullWidthForm: Story = {
  render: () => (
    <div className="w-full max-w-4xl border rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold">New Job Request</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Client Name</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="Enter client name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Job Type</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="e.g., Plumbing, Electrical"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="full-desc" className="text-sm font-medium">
          Full Description
        </label>
        <Textarea
          id="full-desc"
          placeholder="Enter complete job description, requirements, and any special notes..."
          rows={8}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button className="px-4 py-2 border rounded-md">Cancel</button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Submit Request
        </button>
      </div>
    </div>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <label htmlFor="readonly" className="text-sm font-medium">
        Completed Job Notes (Read Only)
      </label>
      <Textarea
        id="readonly"
        readOnly
        rows={5}
        defaultValue="Job completed successfully on schedule.
All materials used as per specification.
Customer satisfied with the work.
Invoice INV-2024-001 sent.
Payment received in full."
        className="bg-muted cursor-default"
      />
    </div>
  ),
};

export const RequiredField: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <label htmlFor="required" className="text-sm font-medium">
        Safety Notes <span className="text-destructive">*</span>
      </label>
      <Textarea
        id="required"
        required
        placeholder="Enter any safety concerns or requirements..."
        rows={4}
      />
      <p className="text-xs text-muted-foreground">
        This field is required
      </p>
    </div>
  ),
};
