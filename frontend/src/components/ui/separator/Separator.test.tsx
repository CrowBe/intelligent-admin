import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from './Separator';

describe('Separator - Rendering', () => {
  describe('Basic rendering', () => {
    it('should render a separator', () => {
      const { container } = render(<Separator />);
      const separator = container.querySelector('[role="none"]');
      expect(separator).toBeInTheDocument();
    });

    it('should render with horizontal orientation by default', () => {
      const { container } = render(<Separator />);
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toBeInTheDocument();
    });

    it('should render with vertical orientation when specified', () => {
      const { container } = render(<Separator orientation="vertical" />);
      const separator = container.querySelector('[data-orientation="vertical"]');
      expect(separator).toBeInTheDocument();
    });

    it('should be decorative by default', () => {
      const { container } = render(<Separator />);
      const separator = container.querySelector('[role="none"]');
      expect(separator).toBeInTheDocument();
    });

    it('should render as non-decorative when specified', () => {
      const { container } = render(<Separator decorative={false} />);
      const separator = container.querySelector('[role="separator"]');
      expect(separator).toBeInTheDocument();
    });
  });
});

describe('Separator - Styling', () => {
  describe('Default classes', () => {
    it('should apply default classes for horizontal separator', () => {
      const { container } = render(<Separator />);
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toHaveClass('shrink-0');
      expect(separator).toHaveClass('bg-border');
      expect(separator).toHaveClass('h-[1px]');
      expect(separator).toHaveClass('w-full');
    });

    it('should apply default classes for vertical separator', () => {
      const { container } = render(<Separator orientation="vertical" />);
      const separator = container.querySelector('[data-orientation="vertical"]');
      expect(separator).toHaveClass('shrink-0');
      expect(separator).toHaveClass('bg-border');
      expect(separator).toHaveClass('h-full');
      expect(separator).toHaveClass('w-[1px]');
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<Separator className="my-custom-class" />);
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toHaveClass('my-custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<Separator className="my-4 bg-primary" />);
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toHaveClass('my-4');
      expect(separator).toHaveClass('bg-primary');
      expect(separator).toHaveClass('shrink-0');
    });
  });
});

describe('Separator - Props', () => {
  describe('Additional props', () => {
    it('should forward additional props', () => {
      render(<Separator data-testid="custom-separator" />);
      const separator = screen.getByTestId('custom-separator');
      expect(separator).toBeInTheDocument();
    });

    it('should accept and apply aria attributes', () => {
      render(<Separator decorative={false} aria-label="Content divider" />);
      const separator = screen.getByRole('separator', { name: 'Content divider' });
      expect(separator).toBeInTheDocument();
    });
  });
});

describe('Separator - Ref Forwarding', () => {
  describe('Ref behavior', () => {
    it('should forward ref to the separator element', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Separator ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should allow accessing DOM methods through ref', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<Separator ref={ref} />);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.getAttribute('data-orientation')).toBe('horizontal');
    });
  });
});

describe('Separator - Accessibility', () => {
  describe('ARIA roles', () => {
    it('should have role="none" when decorative', () => {
      const { container } = render(<Separator decorative={true} />);
      const separator = container.querySelector('[role="none"]');
      expect(separator).toBeInTheDocument();
    });

    it('should have role="separator" when not decorative', () => {
      const { container } = render(<Separator decorative={false} />);
      const separator = container.querySelector('[role="separator"]');
      expect(separator).toBeInTheDocument();
    });

    it('should have proper orientation attribute', () => {
      const { container: horizontalContainer } = render(<Separator orientation="horizontal" />);
      const horizontalSeparator = horizontalContainer.querySelector('[data-orientation="horizontal"]');
      expect(horizontalSeparator).toBeInTheDocument();

      const { container: verticalContainer } = render(<Separator orientation="vertical" />);
      const verticalSeparator = verticalContainer.querySelector('[data-orientation="vertical"]');
      expect(verticalSeparator).toBeInTheDocument();
    });
  });

  describe('ARIA attributes', () => {
    it('should support aria-label for non-decorative separators', () => {
      render(<Separator decorative={false} aria-label="Section divider" />);
      const separator = screen.getByRole('separator', { name: 'Section divider' });
      expect(separator).toBeInTheDocument();
    });

    it('should support aria-orientation for vertical separators', () => {
      const { container } = render(
        <Separator orientation="vertical" decorative={false} aria-orientation="vertical" />
      );
      const separator = container.querySelector('[aria-orientation="vertical"]');
      expect(separator).toBeInTheDocument();
    });
  });
});

describe('Separator - Edge Cases', () => {
  describe('ClassName handling', () => {
    it('should handle null className', () => {
      const { container } = render(<Separator className={undefined} />);
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('bg-border');
    });

    it('should handle empty className', () => {
      const { container } = render(<Separator className="" />);
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('bg-border');
    });

    it('should handle multiple className values', () => {
      const { container } = render(
        <Separator className="my-2 mx-4 bg-primary opacity-50" />
      );
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toHaveClass('my-2');
      expect(separator).toHaveClass('mx-4');
      expect(separator).toHaveClass('bg-primary');
      expect(separator).toHaveClass('opacity-50');
    });
  });
});

describe('Separator - Display Name', () => {
  describe('Component metadata', () => {
    it('should have correct display name', () => {
      expect(Separator.displayName).toBe('Separator');
    });
  });
});

describe('Separator - Integration', () => {
  describe('Usage contexts', () => {
    it('should work in a list context', () => {
      const { container } = render(
        <div>
          <div>Item 1</div>
          <Separator />
          <div>Item 2</div>
          <Separator />
          <div>Item 3</div>
        </div>
      );
      const separators = container.querySelectorAll('[role="none"]');
      expect(separators).toHaveLength(2);
    });

    it('should work in a toolbar context with vertical orientation', () => {
      const { container } = render(
        <div className="flex">
          <button>Button 1</button>
          <Separator orientation="vertical" />
          <button>Button 2</button>
          <Separator orientation="vertical" />
          <button>Button 3</button>
        </div>
      );
      const separators = container.querySelectorAll('[data-orientation="vertical"]');
      expect(separators).toHaveLength(2);
    });

    it('should work with custom styling in trade business context', () => {
      const { container } = render(
        <div>
          <h3>Job Details</h3>
          <Separator className="my-4" />
          <div>Client: John Smith</div>
          <Separator className="my-4" />
          <div>Date: Oct 1, 2025</div>
        </div>
      );
      const separators = container.querySelectorAll('[role="none"]');
      expect(separators).toHaveLength(2);
      separators.forEach(separator => {
        expect(separator).toHaveClass('my-4');
      });
    });
  });
});
