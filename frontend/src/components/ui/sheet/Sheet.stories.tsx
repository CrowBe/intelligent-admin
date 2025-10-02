import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Sheet';

const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a basic sheet sliding from the right.</SheetDescription>
        </SheetHeader>
        <div className='py-4'>
          <p className='text-sm'>Sheet content goes here.</p>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const FromRight: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open from Right</Button>
      </SheetTrigger>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>Job Details</SheetTitle>
          <SheetDescription>View and edit job information</SheetDescription>
        </SheetHeader>
        <div className='space-y-4 py-4'>
          <div>
            <label className='text-sm font-medium'>Job Number</label>
            <p className='mt-1 text-sm text-muted-foreground'>#2024-045</p>
          </div>
          <div>
            <label className='text-sm font-medium'>Client</label>
            <p className='mt-1 text-sm text-muted-foreground'>ABC Electrical Services</p>
          </div>
          <div>
            <label className='text-sm font-medium'>Status</label>
            <p className='mt-1 text-sm text-muted-foreground'>In Progress</p>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const FromLeft: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open from Left</Button>
      </SheetTrigger>
      <SheetContent side='left'>
        <SheetHeader>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Access all sections</SheetDescription>
        </SheetHeader>
        <nav className='flex flex-col gap-2 py-4'>
          <a href='#' className='rounded-md px-3 py-2 text-sm hover:bg-accent'>
            Dashboard
          </a>
          <a href='#' className='rounded-md px-3 py-2 text-sm hover:bg-accent'>
            Jobs
          </a>
          <a href='#' className='rounded-md px-3 py-2 text-sm hover:bg-accent'>
            Clients
          </a>
          <a href='#' className='rounded-md px-3 py-2 text-sm hover:bg-accent'>
            Invoices
          </a>
          <a href='#' className='rounded-md px-3 py-2 text-sm hover:bg-accent'>
            Reports
          </a>
          <a href='#' className='rounded-md px-3 py-2 text-sm hover:bg-accent'>
            Settings
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const FromTop: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open from Top</Button>
      </SheetTrigger>
      <SheetContent side='top'>
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>Common tasks for trade professionals</SheetDescription>
        </SheetHeader>
        <div className='grid grid-cols-2 gap-4 py-4 sm:grid-cols-4'>
          <Button variant='outline' className='h-20 flex-col gap-2'>
            <span>New Job</span>
          </Button>
          <Button variant='outline' className='h-20 flex-col gap-2'>
            <span>Create Quote</span>
          </Button>
          <Button variant='outline' className='h-20 flex-col gap-2'>
            <span>Add Client</span>
          </Button>
          <Button variant='outline' className='h-20 flex-col gap-2'>
            <span>Send Invoice</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const FromBottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Open from Bottom</Button>
      </SheetTrigger>
      <SheetContent side='bottom'>
        <SheetHeader>
          <SheetTitle>Filter Jobs</SheetTitle>
          <SheetDescription>Apply filters to find specific jobs</SheetDescription>
        </SheetHeader>
        <div className='grid gap-4 py-4'>
          <div>
            <label className='text-sm font-medium'>Status</label>
            <select className='mt-1.5 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'>
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className='text-sm font-medium'>Date Range</label>
            <input type='date' className='mt-1.5 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm' />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant='outline'>Clear Filters</Button>
          </SheetClose>
          <Button>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const JobTimesheet: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Record Hours</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Job Timesheet</SheetTitle>
          <SheetDescription>Job #2024-045 - Electrical Installation</SheetDescription>
        </SheetHeader>
        <div className='space-y-4 py-4'>
          <div className='grid gap-2'>
            <label htmlFor='date' className='text-sm font-medium'>
              Date
            </label>
            <input
              id='date'
              type='date'
              className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <label htmlFor='start' className='text-sm font-medium'>
                Start Time
              </label>
              <input
                id='start'
                type='time'
                className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
              />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='end' className='text-sm font-medium'>
                End Time
              </label>
              <input
                id='end'
                type='time'
                className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
              />
            </div>
          </div>
          <div className='grid gap-2'>
            <label htmlFor='notes' className='text-sm font-medium'>
              Work Notes
            </label>
            <textarea
              id='notes'
              placeholder='Describe work completed...'
              className='flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            />
          </div>
          <div className='rounded-md bg-muted p-3'>
            <p className='text-sm font-medium'>Total Hours: 0.0</p>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant='outline'>Cancel</Button>
          </SheetClose>
          <Button>Save Hours</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const MaterialsList: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>Materials</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Materials Required</SheetTitle>
          <SheetDescription>Job #2024-045 materials list</SheetDescription>
        </SheetHeader>
        <div className='flex-1 space-y-3 overflow-auto py-4'>
          <div className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-sm font-medium'>15A Circuit Breaker</p>
              <p className='text-xs text-muted-foreground'>Qty: 4</p>
            </div>
            <p className='text-sm font-semibold'>$120.00</p>
          </div>
          <div className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-sm font-medium'>2.5mm² Cable (Red)</p>
              <p className='text-xs text-muted-foreground'>Qty: 50m</p>
            </div>
            <p className='text-sm font-semibold'>$85.00</p>
          </div>
          <div className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-sm font-medium'>GPO Single</p>
              <p className='text-xs text-muted-foreground'>Qty: 8</p>
            </div>
            <p className='text-sm font-semibold'>$64.00</p>
          </div>
          <div className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-sm font-medium'>Junction Box</p>
              <p className='text-xs text-muted-foreground'>Qty: 6</p>
            </div>
            <p className='text-sm font-semibold'>$42.00</p>
          </div>
        </div>
        <div className='border-t pt-4'>
          <div className='flex items-center justify-between'>
            <span className='font-semibold'>Total Materials:</span>
            <span className='text-lg font-bold'>$311.00</span>
          </div>
        </div>
        <SheetFooter className='mt-4'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button>Order Materials</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const ClientNotes: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>View Notes</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Client Notes</SheetTitle>
          <SheetDescription>ABC Electrical Services</SheetDescription>
        </SheetHeader>
        <div className='space-y-3 py-4'>
          <div className='rounded-md border p-3'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-xs font-medium'>2024-03-15</span>
              <span className='text-xs text-muted-foreground'>John Smith</span>
            </div>
            <p className='text-sm'>Prefers morning appointments. Always call 30 mins before arrival.</p>
          </div>
          <div className='rounded-md border p-3'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-xs font-medium'>2024-02-28</span>
              <span className='text-xs text-muted-foreground'>Sarah Jones</span>
            </div>
            <p className='text-sm'>Site has restricted parking. Use loading zone on Smith Street.</p>
          </div>
          <div className='rounded-md border p-3'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-xs font-medium'>2024-01-12</span>
              <span className='text-xs text-muted-foreground'>Mike Brown</span>
            </div>
            <p className='text-sm'>Regular client - discount rate applies. Invoice monthly.</p>
          </div>
        </div>
        <div className='mt-4 grid gap-2'>
          <label className='text-sm font-medium'>Add New Note</label>
          <textarea
            placeholder='Type your note here...'
            className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          />
        </div>
        <SheetFooter className='mt-4'>
          <SheetClose asChild>
            <Button variant='outline'>Cancel</Button>
          </SheetClose>
          <Button>Add Note</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const MobileResponsive: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button className='w-full sm:w-auto'>Mobile Menu</Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-[90%] sm:max-w-sm'>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navigation and settings</SheetDescription>
        </SheetHeader>
        <nav className='flex flex-col gap-3 py-6'>
          <a href='#' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent'>
            <span>Dashboard</span>
          </a>
          <a href='#' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent'>
            <span>Active Jobs</span>
          </a>
          <a href='#' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent'>
            <span>Clients</span>
          </a>
          <a href='#' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent'>
            <span>Invoices</span>
          </a>
          <div className='my-2 border-t' />
          <a href='#' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent'>
            <span>Settings</span>
          </a>
          <a href='#' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent'>
            <span>Sign Out</span>
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div className='dark'>
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Dark Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Dark Mode Sheet</SheetTitle>
            <SheetDescription>Optimized for low light conditions</SheetDescription>
          </SheetHeader>
          <div className='py-4'>
            <p className='text-sm'>
              Sheet components automatically adapt to dark mode, ensuring readability for trade
              professionals working in various lighting environments.
            </p>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant='outline'>Close</Button>
            </SheetClose>
            <Button>Confirm</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  ),
};

export const ControlledSheet: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={(): void => setOpen(true)}>Open Controlled Sheet</Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Controlled Sheet</SheetTitle>
              <SheetDescription>Sheet state managed by parent component</SheetDescription>
            </SheetHeader>
            <div className='py-4'>
              <p className='text-sm'>This sheet is controlled via React state.</p>
            </div>
            <SheetFooter>
              <Button variant='outline' onClick={(): void => setOpen(false)}>
                Close
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>
    );
  },
};

export const PhotoAttachments: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>View Photos</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Job Photos</SheetTitle>
          <SheetDescription>Before and after documentation</SheetDescription>
        </SheetHeader>
        <div className='grid grid-cols-2 gap-3 py-4'>
          <div className='aspect-square rounded-md bg-muted' />
          <div className='aspect-square rounded-md bg-muted' />
          <div className='aspect-square rounded-md bg-muted' />
          <div className='aspect-square rounded-md bg-muted' />
        </div>
        <div className='mt-4'>
          <Button variant='outline' className='w-full'>
            Add Photo
          </Button>
        </div>
        <SheetFooter className='mt-4'>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const ComplianceChecklist: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Safety Checklist</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>AS/NZS 3000:2018 Compliance</SheetTitle>
          <SheetDescription>Pre-work safety verification</SheetDescription>
        </SheetHeader>
        <div className='space-y-3 py-4'>
          <div className='flex items-start gap-3'>
            <input type='checkbox' id='ppe' className='mt-0.5 h-4 w-4' />
            <label htmlFor='ppe' className='text-sm'>
              PPE verified (safety glasses, gloves, boots)
            </label>
          </div>
          <div className='flex items-start gap-3'>
            <input type='checkbox' id='isolation' className='mt-0.5 h-4 w-4' />
            <label htmlFor='isolation' className='text-sm'>
              Isolation procedures confirmed
            </label>
          </div>
          <div className='flex items-start gap-3'>
            <input type='checkbox' id='testing' className='mt-0.5 h-4 w-4' />
            <label htmlFor='testing' className='text-sm'>
              Testing equipment calibrated
            </label>
          </div>
          <div className='flex items-start gap-3'>
            <input type='checkbox' id='permits' className='mt-0.5 h-4 w-4' />
            <label htmlFor='permits' className='text-sm'>
              Work permits obtained
            </label>
          </div>
          <div className='flex items-start gap-3'>
            <input type='checkbox' id='emergency' className='mt-0.5 h-4 w-4' />
            <label htmlFor='emergency' className='text-sm'>
              Emergency procedures briefed
            </label>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant='outline'>Save Draft</Button>
          </SheetClose>
          <Button>Complete Checklist</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
