import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollArea } from './ScrollArea';

describe('ScrollArea', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.querySelector('[data-slot="scroll-area"]')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <ScrollArea>
        <div>Scrollable Content</div>
      </ScrollArea>
    );
    expect(getByText('Scrollable Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ScrollArea className="custom-class">
        <div>Content</div>
      </ScrollArea>
    );
    const scrollArea = container.querySelector('[data-slot="scroll-area"]');
    expect(scrollArea).toHaveClass('custom-class');
  });

  it('renders scrollbar with data-slot', () => {
    const { container } = render(
      <ScrollArea>
        <div>Content</div>
      </ScrollArea>
    );
    expect(container.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeInTheDocument();
  });
});
