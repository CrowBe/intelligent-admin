import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible';

describe('Collapsible', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(container.querySelector('[data-slot="collapsible"]')).toBeInTheDocument();
  });

  it('renders trigger correctly', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Show More</CollapsibleTrigger>
        <CollapsibleContent>Hidden Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Show More')).toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Visible Content')).toBeInTheDocument();
  });

  it('has correct data-slot attributes', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(container.querySelector('[data-slot="collapsible-trigger"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="collapsible-content"]')).toBeInTheDocument();
  });
});
