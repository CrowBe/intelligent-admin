import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton - Rendering', () => {
  describe('Basic Rendering', () => {
    it('should render a skeleton element', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton?.tagName).toBe('DIV');
    });

    it('should render with data-slot attribute', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    });
  });
});

describe('Skeleton - Styling', () => {
  describe('Default and Custom Classes', () => {
    it('should apply default classes', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('bg-accent');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="w-64 h-12" />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('w-64');
      expect(skeleton).toHaveClass('h-12');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<Skeleton className="w-32 h-8 bg-primary" />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('w-32');
      expect(skeleton).toHaveClass('h-8');
      expect(skeleton).toHaveClass('bg-primary');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('should support rounded-full for circular skeletons', () => {
      const { container } = render(<Skeleton className="w-12 h-12 rounded-full" />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('should support custom dimensions', () => {
      const { container } = render(<Skeleton className="w-96 h-64" />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('w-96');
      expect(skeleton).toHaveClass('h-64');
    });
  });
});

describe('Skeleton - Props and Attributes', () => {
  describe('Props', () => {
    it('should forward additional props', () => {
      render(<Skeleton data-testid="custom-skeleton" />);
      const skeleton = screen.getByTestId('custom-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('should support aria attributes', () => {
      render(<Skeleton aria-label="Loading content" />);
      const skeleton = screen.getByLabelText('Loading content');
      expect(skeleton).toBeInTheDocument();
    });

    it('should support role attribute', () => {
      const { container } = render(<Skeleton role="status" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('should support custom data attributes', () => {
      const { container } = render(<Skeleton data-loading="true" />);
      const skeleton = container.querySelector('[data-loading="true"]');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible as a loading indicator', () => {
      render(
        <Skeleton role="status" aria-label="Loading..." />
      );
      const skeleton = screen.getByRole('status', { name: 'Loading...' });
      expect(skeleton).toBeInTheDocument();
    });

    it('should support aria-busy attribute', () => {
      const { container } = render(<Skeleton aria-busy="true" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('should be visible to screen readers when needed', () => {
      render(
        <Skeleton aria-label="Loading job details" />
      );
      const skeleton = screen.getByLabelText('Loading job details');
      expect(skeleton).toBeInTheDocument();
    });
  });
});

describe('Skeleton - Animation and Edge Cases', () => {
  describe('Animation', () => {
    it('should have animate-pulse class for animation', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should allow custom animation classes', () => {
      const { container } = render(
        <Skeleton className="animate-pulse [animation-duration:2s]" />
      );
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null className', () => {
      const { container } = render(<Skeleton className={undefined} />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-accent');
    });

    it('should handle empty className', () => {
      const { container } = render(<Skeleton className="" />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-accent');
    });

    it('should handle multiple className values', () => {
      const { container } = render(
        <Skeleton className="w-32 h-8 my-4 mx-2 opacity-50" />
      );
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('w-32');
      expect(skeleton).toHaveClass('h-8');
      expect(skeleton).toHaveClass('my-4');
      expect(skeleton).toHaveClass('mx-2');
      expect(skeleton).toHaveClass('opacity-50');
    });

    it('should handle zero dimensions', () => {
      const { container } = render(<Skeleton className="w-0 h-0" />);
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('w-0');
      expect(skeleton).toHaveClass('h-0');
    });
  });
});

describe('Skeleton - Metadata', () => {
  describe('Display Name', () => {
    it('should have correct display name', () => {
      expect(Skeleton.displayName).toBe('Skeleton');
    });
  });
});

describe('Skeleton - Integration Contexts', () => {
  describe('Integration', () => {
    it('should work in loading card context', () => {
      const { container } = render(
        <div>
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-32 h-4 mt-2" />
          <Skeleton className="w-24 h-3 mt-1" />
        </div>
      );
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should work in loading list context', () => {
      const { container } = render(
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="w-full h-16" />
            </div>
          ))}
        </div>
      );
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should work in loading dashboard context', () => {
      const { container } = render(
        <div>
          <Skeleton className="w-48 h-8 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
          </div>
        </div>
      );
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(4);
    });
  });
});

describe('Skeleton - Trade Business Context', () => {
  describe('Trade Business Context', () => {
    it('should support loading job card', () => {
      const { container } = render(
        <div className="border rounded-lg p-4">
          <Skeleton className="w-32 h-5 mb-2" />
          <Skeleton className="w-48 h-4 mb-2" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      );
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should support loading client profile', () => {
      const { container } = render(
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="w-40 h-5 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
      );
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should support loading invoice', () => {
      const { container } = render(
        <div className="space-y-2">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-24 h-6 mt-4" />
        </div>
      );
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons).toHaveLength(4);
    });
  });
});

describe('Skeleton - Responsive Behavior', () => {
  describe('Responsive Behavior', () => {
    it('should support responsive width classes', () => {
      const { container } = render(
        <Skeleton className="w-full md:w-1/2 lg:w-1/3" />
      );
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('md:w-1/2');
      expect(skeleton).toHaveClass('lg:w-1/3');
    });

    it('should support responsive height classes', () => {
      const { container } = render(
        <Skeleton className="h-12 md:h-16 lg:h-20" />
      );
      const skeleton = container.querySelector('[data-slot="skeleton"]');
      expect(skeleton).toHaveClass('h-12');
      expect(skeleton).toHaveClass('md:h-16');
      expect(skeleton).toHaveClass('lg:h-20');
    });
  });
});
