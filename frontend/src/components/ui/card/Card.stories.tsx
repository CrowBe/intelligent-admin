import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardAction } from './Card';

// Wrapper component for complex stories to satisfy ESLint
const BasicCardExample = (): React.ReactElement => (
  <Card>
    <CardContent>
      <p>This is a basic card with just content.</p>
    </CardContent>
  </Card>
);

const WithHeaderExample = (): React.ReactElement => (
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>This is a card description that provides additional context.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Card content goes here with detailed information about the card.</p>
    </CardContent>
  </Card>
);

const CompleteExample = (): React.ReactElement => (
  <Card>
    <CardHeader>
      <CardTitle>Complete Card</CardTitle>
      <CardDescription>A card with all sections included.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>This card demonstrates all available sections: header, title, description, content, and footer.</p>
    </CardContent>
    <CardFooter>
      <button type="button" className="text-sm text-primary">
        Learn More
      </button>
    </CardFooter>
  </Card>
);

const WithActionExample = (): React.ReactElement => (
  <Card>
    <CardHeader>
      <CardTitle>Card with Action</CardTitle>
      <CardDescription>This card has an action button in the header.</CardDescription>
      <CardAction>
        <button type="button" className="text-sm text-primary">
          Edit
        </button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <p>The action button appears in the top-right corner of the card header.</p>
    </CardContent>
  </Card>
);

const WorkSafeNoticeExample = (): React.ReactElement => (
  <Card className="border-destructive">
    <CardHeader>
      <CardTitle className="text-destructive">Urgent: WorkSafe Compliance Notice</CardTitle>
      <CardDescription>Received 2 hours ago - Requires immediate attention</CardDescription>
    </CardHeader>
    <CardContent>
      <p>
        A new WorkSafe notice has been issued regarding site safety procedures. Please review and respond within 24
        hours.
      </p>
    </CardContent>
    <CardFooter className="gap-2">
      <button type="button" className="rounded-md bg-destructive px-4 py-2 text-sm text-white">
        Review Notice
      </button>
      <button type="button" className="rounded-md border px-4 py-2 text-sm">
        Schedule Review
      </button>
    </CardFooter>
  </Card>
);

const ClientMessageExample = (): React.ReactElement => (
  <Card>
    <CardHeader>
      <CardTitle>New Message from Johnson Construction</CardTitle>
      <CardDescription>Received 15 minutes ago</CardDescription>
      <CardAction>
        <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">New</span>
      </CardAction>
    </CardHeader>
    <CardContent>
      <p>
        Hi, we need to discuss the electrical installation schedule for the Chapel Street project. Can we meet this
        week?
      </p>
    </CardContent>
    <CardFooter className="gap-2">
      <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
        Reply
      </button>
      <button type="button" className="rounded-md border px-4 py-2 text-sm">
        Schedule Meeting
      </button>
    </CardFooter>
  </Card>
);

const JobSummaryExample = (): React.ReactElement => (
  <Card>
    <CardHeader>
      <CardTitle>Chapel Street Commercial Fit-out</CardTitle>
      <CardDescription>Job #2024-045 - In Progress</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Client:</span>
        <span>Johnson Construction</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Due Date:</span>
        <span>March 15, 2024</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress:</span>
        <span className="text-primary">65%</span>
      </div>
    </CardContent>
    <CardFooter className="gap-2">
      <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
        View Details
      </button>
      <button type="button" className="rounded-md border px-4 py-2 text-sm">
        Update Status
      </button>
    </CardFooter>
  </Card>
);

const DarkModeExample = (): React.ReactElement => (
  <div className="dark">
    <Card>
      <CardHeader>
        <CardTitle>Dark Mode Card</CardTitle>
        <CardDescription>This card adapts to dark mode automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>The background, text, and border colors adjust based on the theme.</p>
      </CardContent>
      <CardFooter>
        <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Action Button
        </button>
      </CardFooter>
    </Card>
  </div>
);

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story): React.ReactElement => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (): React.ReactElement => <BasicCardExample />,
};

export const WithHeader: Story = {
  render: (): React.ReactElement => <WithHeaderExample />,
};

export const Complete: Story = {
  render: (): React.ReactElement => <CompleteExample />,
};

export const WithAction: Story = {
  render: (): React.ReactElement => <WithActionExample />,
};

export const WorkSafeNotice: Story = {
  render: (): React.ReactElement => <WorkSafeNoticeExample />,
};

export const ClientMessage: Story = {
  render: (): React.ReactElement => <ClientMessageExample />,
};

export const JobSummary: Story = {
  render: (): React.ReactElement => <JobSummaryExample />,
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: (): React.ReactElement => <DarkModeExample />,
};
