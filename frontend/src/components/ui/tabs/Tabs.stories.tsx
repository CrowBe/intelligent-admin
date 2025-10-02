import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta = {
  title: 'UI/Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password">
        Change your password here.
      </TabsContent>
    </Tabs>
  ),
};

export const ThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        View your overview dashboard here.
      </TabsContent>
      <TabsContent value="analytics">
        Review analytics and metrics.
      </TabsContent>
      <TabsContent value="reports">
        Access detailed reports.
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="home">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </TabsTrigger>
        <TabsTrigger value="settings">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">Home content here.</TabsContent>
      <TabsContent value="settings">Settings content here.</TabsContent>
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Active</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="tab3">Another Active</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">First tab content.</TabsContent>
      <TabsContent value="tab2">Second tab content.</TabsContent>
      <TabsContent value="tab3">Third tab content.</TabsContent>
    </Tabs>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="tab1" className="flex-1">
          Tab 1
        </TabsTrigger>
        <TabsTrigger value="tab2" className="flex-1">
          Tab 2
        </TabsTrigger>
        <TabsTrigger value="tab3" className="flex-1">
          Tab 3
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Full width tab 1 content.</TabsContent>
      <TabsContent value="tab2">Full width tab 2 content.</TabsContent>
      <TabsContent value="tab3">Full width tab 3 content.</TabsContent>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        <TabsTrigger value="tab4">Tab 4</TabsTrigger>
        <TabsTrigger value="tab5">Tab 5</TabsTrigger>
        <TabsTrigger value="tab6">Tab 6</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
      <TabsContent value="tab4">Content 4</TabsContent>
      <TabsContent value="tab5">Content 5</TabsContent>
      <TabsContent value="tab6">Content 6</TabsContent>
    </Tabs>
  ),
};

export const WithRichContent: Story = {
  render: () => (
    <Tabs defaultValue="description" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="space-y-2">
        <h3 className="text-lg font-semibold">Product Description</h3>
        <p className="text-sm text-muted-foreground">
          This is a detailed description of the product with multiple
          paragraphs and rich content.
        </p>
      </TabsContent>
      <TabsContent value="specifications" className="space-y-2">
        <h3 className="text-lg font-semibold">Technical Specifications</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          <li>Dimension: 10 x 20 x 5 cm</li>
          <li>Weight: 500g</li>
          <li>Material: Aluminum</li>
        </ul>
      </TabsContent>
      <TabsContent value="reviews" className="space-y-2">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <p className="text-sm text-muted-foreground">
          Average rating: 4.5/5 stars
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: function ControlledTabs() {
    const [value, setValue] = React.useState('tab1');

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Current tab: {value}
        </div>
        <Tabs value={value} onValueChange={setValue} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Controlled tab 1 content.</TabsContent>
          <TabsContent value="tab2">Controlled tab 2 content.</TabsContent>
          <TabsContent value="tab3">Controlled tab 3 content.</TabsContent>
        </Tabs>
        <div className="flex gap-2">
          <button
            onClick={() => setValue('tab1')}
            className="px-3 py-1 text-sm border rounded"
          >
            Go to Tab 1
          </button>
          <button
            onClick={() => setValue('tab2')}
            className="px-3 py-1 text-sm border rounded"
          >
            Go to Tab 2
          </button>
          <button
            onClick={() => setValue('tab3')}
            className="px-3 py-1 text-sm border rounded"
          >
            Go to Tab 3
          </button>
        </div>
      </div>
    );
  },
};
