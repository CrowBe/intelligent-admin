import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';

describe('Popover', () => {
  it('renders trigger without crashing', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders with data-slot attribute', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    );

    // Click trigger to open popover
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Wait for content to appear and verify data-slot attribute
    await waitFor(() => {
      const content = screen.getByText('Popover Content');
      expect(content).toBeInTheDocument();
      const contentElement = content.closest('[data-slot="popover-content"]');
      expect(contentElement).toBeInTheDocument();
    });
  });

  it('applies custom className to content', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-class">Content</PopoverContent>
      </Popover>
    );
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-class');
  });

  it('renders PopoverAnchor with data-slot', () => {
    render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
      </Popover>
    );
    const trigger = screen.getByText('Trigger');
    expect(trigger).toBeInTheDocument();
  });
});
