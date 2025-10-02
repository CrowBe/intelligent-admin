import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';

describe('AlertDialog', () => {
  it('renders trigger button', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    );

    expect(screen.getByRole('button', { name: /open alert/i })).toBeInTheDocument();
  });

  it('opens alert dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogDescription>This is a test alert</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  it('displays alert title and description', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete?</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete?')).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogDescription>Test Description</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('closes dialog when action button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    const actionButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(actionButton);

    expect(onAction).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('renders footer with cancel and action buttons', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });
  });

  it('handles controlled open state', async () => {
    const user = userEvent.setup();

    const ControlledAlertDialog = (): JSX.Element => {
      const [open, setOpen] = React.useState(false);

      return (
        <>
          <Button onClick={(): void => setOpen(true)}>Open Controlled</Button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogTitle>Controlled Alert</AlertDialogTitle>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(): void => setOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={(): void => setOpen(false)}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    };

    render(<ControlledAlertDialog />);

    await user.click(screen.getByRole('button', { name: /open controlled/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('applies destructive styling to action button', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Item</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className='bg-destructive text-destructive-foreground'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toHaveClass('bg-destructive');
    });
  });

  it('applies custom className to AlertDialogContent', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className='custom-alert-class'>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveClass('custom-alert-class');
    });
  });

  it('renders without description', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Title Only</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByText('This is a test alert')).not.toBeInTheDocument();
    });
  });

  it('supports trade business workflow - delete job confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='destructive'>Delete Job</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job #2024-045?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className='bg-destructive text-destructive-foreground'
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /delete job/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText(/delete job #2024-045/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /delete job/i, hidden: false }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('supports trade business workflow - complete job', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Mark Complete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Job as Complete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the job to your completed jobs list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction onClick={onComplete}>Mark Complete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /mark complete/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /mark complete/i, hidden: false }));
    expect(onComplete).toHaveBeenCalled();
  });

  it('supports trade business workflow - send invoice', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Send Invoice</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Invoice to Client?</AlertDialogTitle>
            <AlertDialogDescription>
              Invoice #2024-089 for $2,450.00 will be emailed to the client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review First</AlertDialogCancel>
            <AlertDialogAction onClick={onSend}>Send Invoice</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText(/\$2,450\.00/)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /send invoice/i, hidden: false }));
    expect(onSend).toHaveBeenCalled();
  });

  it('renders overlay when open', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      const overlay = document.querySelector('[data-state="open"]');
      expect(overlay).toBeInTheDocument();
    });
  });

  it('prevents accidental dismissal - requires explicit action', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    // Alert dialogs require explicit action - verify both buttons are present
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('executes action handlers correctly', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Open Alert</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();

    // Open again and test confirm
    await user.click(screen.getByRole('button', { name: /open alert/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
