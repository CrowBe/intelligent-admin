import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

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

describe('Sheet', () => {
  it('renders trigger button', () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    expect(screen.getByRole('button', { name: /open sheet/i })).toBeInTheDocument();
  });

  it('opens sheet when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('displays sheet title and description', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Job Details</SheetTitle>
            <SheetDescription>View job information</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      expect(screen.getByText('Job Details')).toBeInTheDocument();
      expect(screen.getByText('View job information')).toBeInTheDocument();
    });
  });

  it('closes sheet when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders from right side by default', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('right-0');
    });
  });

  it('renders from left side when specified', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side='left'>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('left-0');
    });
  });

  it('renders from top when specified', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side='top'>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('top-0');
    });
  });

  it('renders from bottom when specified', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent side='bottom'>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('bottom-0');
    });
  });

  it('renders footer with action buttons', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant='outline'>Cancel</Button>
            </SheetClose>
            <Button>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  it('handles controlled open state', async () => {
    const user = userEvent.setup();

    const ControlledSheet = (): JSX.Element => {
      const [open, setOpen] = React.useState(false);

      return (
        <>
          <Button onClick={(): void => setOpen(true)}>Open Controlled</Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
              <SheetTitle>Controlled Sheet</SheetTitle>
              <Button onClick={(): void => setOpen(false)}>Close Manually</Button>
            </SheetContent>
          </Sheet>
        </>
      );
    };

    render(<ControlledSheet />);

    await user.click(screen.getByRole('button', { name: /open controlled/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /close manually/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders custom content in sheet body', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Job Details</SheetTitle>
          <div data-testid='custom-content'>
            <p>Job Number: #2024-045</p>
            <p>Client: ABC Electrical</p>
          </div>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      const customContent = screen.getByTestId('custom-content');
      expect(customContent).toBeInTheDocument();
      expect(screen.getByText(/job number: #2024-045/i)).toBeInTheDocument();
      expect(screen.getByText(/client: abc electrical/i)).toBeInTheDocument();
    });
  });

  it('applies custom className to SheetContent', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent className='custom-sheet-class'>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-sheet-class');
    });
  });

  it('closes on SheetClose button click', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
          <SheetFooter>
            <SheetClose asChild>
              <Button>Done</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

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
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  it('renders without description', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title Only</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
  });

  it('supports trade business workflow - timesheet entry', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Record Hours</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Job Timesheet</SheetTitle>
            <SheetDescription>Record hours worked</SheetDescription>
          </SheetHeader>
          <div>
            <input type='date' aria-label='Date' />
            <input type='time' aria-label='Start time' />
            <input type='time' aria-label='End time' />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant='outline'>Cancel</Button>
            </SheetClose>
            <Button onClick={onSave}>Save Hours</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /record hours/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /save hours/i }));
    expect(onSave).toHaveBeenCalled();
  });

  it('supports all four side variants', async () => {
    const user = userEvent.setup();
    const sides: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];

    for (const side of sides) {
      const { unmount } = render(
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open {side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetTitle>Test Sheet {side}</SheetTitle>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: new RegExp(`open ${side}`, 'i') }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveClass(`${side}-0`);
      });

      unmount();
    }
  });

  it('renders overlay when open', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByRole('button', { name: /open sheet/i }));

    await waitFor(() => {
      const overlay = document.querySelector('[data-state="open"]');
      expect(overlay).toBeInTheDocument();
    });
  });
});
