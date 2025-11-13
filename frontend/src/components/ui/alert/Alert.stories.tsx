import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription } from './Alert';

// Icon components for visual demonstrations
const InfoIcon = (): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const AlertTriangleIcon = (): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckCircleIcon = (): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const BellIcon = (): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// Wrapper components for complex stories
const DefaultExample = (): React.ReactElement => (
  <Alert>
    <InfoIcon />
    <AlertTitle>Information</AlertTitle>
    <AlertDescription>This is a default informational alert message.</AlertDescription>
  </Alert>
);

const DestructiveExample = (): React.ReactElement => (
  <Alert variant="destructive">
    <AlertTriangleIcon />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>There was an error processing your request.</AlertDescription>
  </Alert>
);

const TitleOnlyExample = (): React.ReactElement => (
  <Alert>
    <InfoIcon />
    <AlertTitle>Alert with title only</AlertTitle>
  </Alert>
);

const DescriptionOnlyExample = (): React.ReactElement => (
  <Alert>
    <InfoIcon />
    <AlertDescription>This alert has only a description, no title.</AlertDescription>
  </Alert>
);

const NoIconExample = (): React.ReactElement => (
  <Alert>
    <AlertTitle>No Icon Alert</AlertTitle>
    <AlertDescription>This alert does not include an icon.</AlertDescription>
  </Alert>
);

const SuccessExample = (): React.ReactElement => (
  <Alert>
    <CheckCircleIcon />
    <AlertTitle>Success!</AlertTitle>
    <AlertDescription>Your changes have been saved successfully.</AlertDescription>
  </Alert>
);

const WorkSafeNoticeExample = (): React.ReactElement => (
  <Alert variant="destructive">
    <AlertTriangleIcon />
    <AlertTitle>Urgent: WorkSafe Compliance Notice</AlertTitle>
    <AlertDescription>
      A new WorkSafe notice has been issued regarding site safety procedures. Please review and respond within 24
      hours to avoid penalties.
    </AlertDescription>
  </Alert>
);

const ClientReminderExample = (): React.ReactElement => (
  <Alert>
    <BellIcon />
    <AlertTitle>Client Meeting Reminder</AlertTitle>
    <AlertDescription>
      You have a meeting with Johnson Construction in 30 minutes to discuss the Chapel Street project electrical
      installation.
    </AlertDescription>
  </Alert>
);

const QuoteApprovedExample = (): React.ReactElement => (
  <Alert>
    <CheckCircleIcon />
    <AlertTitle>Quote Approved</AlertTitle>
    <AlertDescription>
      Your quote for the Richmond warehouse electrical upgrade (Quote #2024-078) has been approved. Client deposit of
      $12,500 received.
    </AlertDescription>
  </Alert>
);

const LongContentExample = (): React.ReactElement => (
  <Alert>
    <InfoIcon />
    <AlertTitle>Important Safety Update</AlertTitle>
    <AlertDescription>
      <p>
        New safety protocols have been introduced for all electrical installations in Victoria. Key changes include:
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>Enhanced RCD testing requirements</li>
        <li>Updated switchboard labeling standards</li>
        <li>New documentation for commercial installations</li>
      </ul>
      <p className="mt-2">All team members must complete online training by Friday, March 8th.</p>
    </AlertDescription>
  </Alert>
);

const MultipleAlertsExample = (): React.ReactElement => (
  <div className="space-y-4">
    <Alert variant="destructive">
      <AlertTriangleIcon />
      <AlertTitle>Critical</AlertTitle>
      <AlertDescription>Urgent action required on WorkSafe compliance.</AlertDescription>
    </Alert>
    <Alert>
      <BellIcon />
      <AlertTitle>Reminder</AlertTitle>
      <AlertDescription>Meeting in 30 minutes.</AlertDescription>
    </Alert>
    <Alert>
      <CheckCircleIcon />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Quote approved and deposit received.</AlertDescription>
    </Alert>
  </div>
);

const CustomStyledExample = (): React.ReactElement => (
  <Alert className="border-primary bg-primary/5">
    <InfoIcon />
    <AlertTitle className="text-primary">Custom Styled Alert</AlertTitle>
    <AlertDescription className="text-primary/90">
      This alert uses custom styling with primary theme colors.
    </AlertDescription>
  </Alert>
);

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story): React.ReactElement => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (): React.ReactElement => <DefaultExample />,
};

export const Destructive: Story = {
  render: (): React.ReactElement => <DestructiveExample />,
};

export const TitleOnly: Story = {
  render: (): React.ReactElement => <TitleOnlyExample />,
};

export const DescriptionOnly: Story = {
  render: (): React.ReactElement => <DescriptionOnlyExample />,
};

export const NoIcon: Story = {
  render: (): React.ReactElement => <NoIconExample />,
};

export const Success: Story = {
  render: (): React.ReactElement => <SuccessExample />,
};

export const WorkSafeNotice: Story = {
  render: (): React.ReactElement => <WorkSafeNoticeExample />,
};

export const ClientReminder: Story = {
  render: (): React.ReactElement => <ClientReminderExample />,
};

export const QuoteApproved: Story = {
  render: (): React.ReactElement => <QuoteApprovedExample />,
};

export const LongContent: Story = {
  render: (): React.ReactElement => <LongContentExample />,
};

export const MultipleAlerts: Story = {
  render: (): React.ReactElement => <MultipleAlertsExample />,
};

export const CustomStyled: Story = {
  render: (): React.ReactElement => <CustomStyledExample />,
};
