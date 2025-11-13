import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>This is a basic dialog with a title and description.</DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm'>Dialog content goes here.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ClientInformation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Client Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Client Information</DialogTitle>
          <DialogDescription>Complete details for John Smith - Electrical Services</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <span className='text-sm font-medium'>Name:</span>
            <span className='col-span-3 text-sm'>John Smith</span>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <span className='text-sm font-medium'>Business:</span>
            <span className='col-span-3 text-sm'>ABC Electrical Services</span>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <span className='text-sm font-medium'>Phone:</span>
            <span className='col-span-3 text-sm'>0412 345 678</span>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <span className='text-sm font-medium'>Email:</span>
            <span className='col-span-3 text-sm'>john@abcelectrical.com.au</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
          <Button>Edit Client</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const JobQuoteForm: Story = {
  render: () => {
    const [jobType, setJobType] = useState('');

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create Quote</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Job Quote</DialogTitle>
            <DialogDescription>Create a quote for a new trade job</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <label htmlFor='client' className='text-sm font-medium'>
                Client
              </label>
              <select id='client' className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'>
                <option value=''>Select client...</option>
                <option value='1'>ABC Electrical Services</option>
                <option value='2'>XYZ Plumbing</option>
                <option value='3'>Quality Carpentry</option>
              </select>
            </div>
            <div className='grid gap-2'>
              <label htmlFor='jobType' className='text-sm font-medium'>
                Job Type
              </label>
              <select
                id='jobType'
                value={jobType}
                onChange={(e): void => setJobType(e.target.value)}
                className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
              >
                <option value=''>Select job type...</option>
                <option value='installation'>Installation</option>
                <option value='repair'>Repair</option>
                <option value='maintenance'>Maintenance</option>
                <option value='inspection'>Inspection</option>
              </select>
            </div>
            <div className='grid gap-2'>
              <label htmlFor='description' className='text-sm font-medium'>
                Description
              </label>
              <textarea
                id='description'
                className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Describe the job requirements...'
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button>Generate Quote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const DeleteConfirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='destructive'>Delete Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Invoice #2024-001</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the invoice from your records.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button variant='destructive'>Delete Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>View Safety Guidelines</Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Australian Electrical Safety Guidelines</DialogTitle>
          <DialogDescription>AS/NZS 3000:2018 Wiring Rules Summary</DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4 text-sm'>
          <section>
            <h3 className='font-semibold'>1. General Requirements</h3>
            <p className='mt-2 text-muted-foreground'>
              All electrical installations must comply with AS/NZS 3000:2018. Work must be carried
              out by licensed electricians in accordance with state regulations.
            </p>
          </section>
          <section>
            <h3 className='font-semibold'>2. Circuit Protection</h3>
            <p className='mt-2 text-muted-foreground'>
              Circuit breakers and RCDs must be installed according to the standards. Maximum
              disconnection time for RCDs is 40ms under fault conditions.
            </p>
          </section>
          <section>
            <h3 className='font-semibold'>3. Earthing and Bonding</h3>
            <p className='mt-2 text-muted-foreground'>
              Main earthing conductor must be adequate for fault current. All metalwork must be
              bonded to the main earthing terminal.
            </p>
          </section>
          <section>
            <h3 className='font-semibold'>4. Cable Selection</h3>
            <p className='mt-2 text-muted-foreground'>
              Cables must be selected based on current carrying capacity, voltage drop, and
              installation method. Minimum cable sizes apply for different applications.
            </p>
          </section>
          <section>
            <h3 className='font-semibold'>5. Testing and Verification</h3>
            <p className='mt-2 text-muted-foreground'>
              All installations must be tested before energization. Test results must be documented
              and certificates of compliance issued.
            </p>
          </section>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Understood</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const MobileResponsive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='w-full sm:w-auto'>Schedule Job (Mobile)</Button>
      </DialogTrigger>
      <DialogContent className='w-[calc(100%-2rem)] sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Schedule New Job</DialogTitle>
          <DialogDescription>Book a job for a client at their location</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Date</label>
            <input type='date' className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm' />
          </div>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Time</label>
            <input type='time' className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm' />
          </div>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Location</label>
            <input
              type='text'
              placeholder='Enter job site address...'
              className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
            />
          </div>
        </div>
        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          <DialogClose asChild>
            <Button variant='outline' className='w-full sm:w-auto'>
              Cancel
            </Button>
          </DialogClose>
          <Button className='w-full sm:w-auto'>Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div className='dark'>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dark Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dark Mode Dialog</DialogTitle>
            <DialogDescription>This dialog demonstrates dark mode styling</DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <p className='text-sm'>
              The dialog automatically adapts to dark mode with appropriate contrast and colors for
              trade professionals working in various lighting conditions.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Quick Action</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Job Complete</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm'>Are you sure you want to mark this job as complete?</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button>Complete Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ControlledDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={(): void => setOpen(true)}>Open Controlled Dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <DialogDescription>This dialog is controlled via state</DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <p className='text-sm'>The dialog open state is managed by the parent component.</p>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={(): void => setOpen(false)}>
                Close
              </Button>
              <Button onClick={(): void => setOpen(false)}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const InvoicePayment: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Record Payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Invoice Payment</DialogTitle>
          <DialogDescription>Invoice #2024-045 - ABC Electrical Services</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='text-sm font-medium'>Total Amount:</span>
              <p className='text-lg font-semibold'>$2,450.00</p>
            </div>
            <div>
              <span className='text-sm font-medium'>Outstanding:</span>
              <p className='text-lg font-semibold text-orange-600'>$2,450.00</p>
            </div>
          </div>
          <div className='grid gap-2'>
            <label htmlFor='amount' className='text-sm font-medium'>
              Payment Amount
            </label>
            <input
              id='amount'
              type='number'
              placeholder='0.00'
              className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
            />
          </div>
          <div className='grid gap-2'>
            <label htmlFor='method' className='text-sm font-medium'>
              Payment Method
            </label>
            <select id='method' className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'>
              <option value=''>Select method...</option>
              <option value='bank'>Bank Transfer</option>
              <option value='cash'>Cash</option>
              <option value='card'>Credit Card</option>
              <option value='cheque'>Cheque</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button>Record Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const EquipmentChecklist: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Pre-Job Checklist</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Equipment Safety Checklist</DialogTitle>
          <DialogDescription>Complete before starting work on site</DialogDescription>
        </DialogHeader>
        <div className='space-y-3 py-4'>
          <div className='flex items-center gap-3'>
            <input type='checkbox' id='ppe' className='h-4 w-4' />
            <label htmlFor='ppe' className='text-sm'>
              All PPE equipment present and in good condition
            </label>
          </div>
          <div className='flex items-center gap-3'>
            <input type='checkbox' id='tools' className='h-4 w-4' />
            <label htmlFor='tools' className='text-sm'>
              Tools inspected and tested
            </label>
          </div>
          <div className='flex items-center gap-3'>
            <input type='checkbox' id='permits' className='h-4 w-4' />
            <label htmlFor='permits' className='text-sm'>
              Work permits and licenses verified
            </label>
          </div>
          <div className='flex items-center gap-3'>
            <input type='checkbox' id='site' className='h-4 w-4' />
            <label htmlFor='site' className='text-sm'>
              Site hazards assessed
            </label>
          </div>
          <div className='flex items-center gap-3'>
            <input type='checkbox' id='emergency' className='h-4 w-4' />
            <label htmlFor='emergency' className='text-sm'>
              Emergency contacts and procedures confirmed
            </label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Save Draft</Button>
          </DialogClose>
          <Button>Start Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
