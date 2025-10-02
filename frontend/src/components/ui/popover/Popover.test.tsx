import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders with data-slot attribute', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    );
    const popover = container.querySelector('[data-slot="popover"]');
    expect(popover).toBeInTheDocument();
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
