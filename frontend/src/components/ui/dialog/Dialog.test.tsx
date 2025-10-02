import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

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

describe('Dialog', () => {
  it('renders trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>This is a test dialog</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('displays dialog title and description', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Information</DialogTitle>
            <DialogDescription>View client details</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      expect(screen.getByText('Client Information')).toBeInTheDocument();
      expect(screen.getByText('View client details')).toBeInTheDocument();
    });
  });

  it('closes dialog when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders footer with action buttons', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  it('handles controlled open state', async () => {
    const user = userEvent.setup();

    const ControlledDialog = (): JSX.Element => {
      const [open, setOpen] = React.useState(false);

      return (
        <>
          <Button onClick={(): void => setOpen(true)}>Open Controlled</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <Button onClick={(): void => setOpen(false)}>Close Manually</Button>
            </DialogContent>
          </Dialog>
        </>
      );
    };

    render(<ControlledDialog />);

    await user.click(screen.getByRole('button', { name: /open controlled/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /close manually/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders custom content in dialog body', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Job Details</DialogTitle>
          <div data-testid='custom-content'>
            <p>Client: ABC Electrical</p>
            <p>Location: 123 Main St</p>
          </div>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      const customContent = screen.getByTestId('custom-content');
      expect(customContent).toBeInTheDocument();
      expect(screen.getByText(/client: abc electrical/i)).toBeInTheDocument();
      expect(screen.getByText(/location: 123 main st/i)).toBeInTheDocument();
    });
  });

  it('applies custom className to DialogContent', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className='custom-dialog-class'>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-dialog-class');
    });
  });

  it('renders without description', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title Only</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByText('This is a test dialog')).not.toBeInTheDocument();
    });
  });

  it('closes on DialogClose button click', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /done/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('has accessible close button with screen reader text', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  it('renders DialogOverlay when open', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    await waitFor(() => {
      const overlay = document.querySelector('[data-state="open"]');
      expect(overlay).toBeInTheDocument();
    });
  });

  it('supports trade business workflow - job quote form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create Quote</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Job Quote</DialogTitle>
            <DialogDescription>Create a quote for a trade job</DialogDescription>
          </DialogHeader>
          <div>
            <input type='text' placeholder='Client name' aria-label='Client name' />
            <input type='text' placeholder='Job type' aria-label='Job type' />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button onClick={onSubmit}>Generate Quote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: /create quote/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/job type/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /generate quote/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
