import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip';

describe('Tooltip', () => {
  it('renders tooltip trigger', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('applies custom className to TooltipContent', async () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent className="custom-class">Tooltip content</TooltipContent>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltipContent = document.querySelector('[data-slot="tooltip-content"]');
      expect(tooltipContent).toHaveClass('custom-class');
    });
  });

  it('renders with custom sideOffset', async () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent sideOffset={10}>Tooltip content</TooltipContent>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    await userEvent.hover(trigger);

    await waitFor(() => {
      const tooltipContent = document.querySelector('[data-slot="tooltip-content"]');
      expect(tooltipContent).toBeInTheDocument();
    });
  });
});
