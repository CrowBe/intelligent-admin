import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './HoverCard';

describe('HoverCard', () => {
  it('renders without crashing', async () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Content</HoverCardContent>
      </HoverCard>
    );

    // Verify trigger is rendered
    const trigger = screen.getByText('Hover me');
    expect(trigger).toBeInTheDocument();

    // Hover over trigger to show content
    await userEvent.hover(trigger);

    // Wait for content to appear after hover
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
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

  it('applies custom className to content', async () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Trigger</HoverCardTrigger>
        <HoverCardContent className="custom-hover-card">
          Content
        </HoverCardContent>
      </HoverCard>
    );

    await waitFor(() => {
      const content = screen.getByText('Content');
      expect(content).toHaveClass('custom-hover-card');
    });
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
