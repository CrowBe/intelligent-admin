import { render, screen } from '@testing-library/react';
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

  it('applies custom className to TooltipContent', () => {
    const { container } = render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent className="custom-class">Tooltip content</TooltipContent>
      </Tooltip>
    );

    const tooltipContent = container.querySelector('[data-slot="tooltip-content"]');
    expect(tooltipContent).toHaveClass('custom-class');
  });

  it('renders with custom sideOffset', () => {
    const { container } = render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent sideOffset={10}>Tooltip content</TooltipContent>
      </Tooltip>
    );

    const tooltipContent = container.querySelector('[data-slot="tooltip-content"]');
    expect(tooltipContent).toBeInTheDocument();
  });
});
