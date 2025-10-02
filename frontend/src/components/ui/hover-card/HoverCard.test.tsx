import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './HoverCard';

describe('HoverCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Content</HoverCardContent>
      </HoverCard>
    );
    expect(container.querySelector('[data-slot="hover-card"]')).toBeInTheDocument();
  });

  it('renders trigger correctly', () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover trigger</HoverCardTrigger>
        <HoverCardContent>Card content</HoverCardContent>
      </HoverCard>
    );
    expect(screen.getByText('Hover trigger')).toBeInTheDocument();
  });

  it('applies custom className to content', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardContent className="custom-hover-card">
          Content
        </HoverCardContent>
      </HoverCard>
    );
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-hover-card');
  });

  it('has correct data-slot attributes', () => {
    const { container } = render(
      <HoverCard>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardContent>Content</HoverCardContent>
      </HoverCard>
    );
    expect(container.querySelector('[data-slot="hover-card-trigger"]')).toBeInTheDocument();
  });
});
