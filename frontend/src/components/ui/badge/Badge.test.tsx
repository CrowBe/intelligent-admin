import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with default variant', () => {
      render(<Badge>Test Badge</Badge>);
      const badge = screen.getByText('Test Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Test Badge');
    });

    it('renders with custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('renders children correctly', () => {
      render(
        <Badge>
          <span data-testid="icon">Icon</span>
          <span>Text</span>
        </Badge>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('renders as span by default', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Variants', () => {
    it('renders default variant correctly', () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-primary');
      expect(badge).toHaveClass('text-primary-foreground');
      expect(badge).toHaveClass('border-transparent');
    });

    it('renders secondary variant correctly', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-secondary');
      expect(badge).toHaveClass('text-secondary-foreground');
      expect(badge).toHaveClass('border-transparent');
    });

    it('renders destructive variant correctly', () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      const badge = screen.getByText('Destructive');
      expect(badge).toHaveClass('bg-destructive');
      expect(badge).toHaveClass('text-white');
      expect(badge).toHaveClass('border-transparent');
    });

    it('renders outline variant correctly', () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('text-foreground');
    });

    it('uses default variant when variant is undefined', () => {
      render(<Badge variant={undefined}>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('bg-primary');
    });
  });

  describe('Base Styles', () => {
    it('applies base badge styles', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('justify-center');
      expect(badge).toHaveClass('rounded-md');
      expect(badge).toHaveClass('border');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('py-0.5');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('font-medium');
      expect(badge).toHaveClass('w-fit');
      expect(badge).toHaveClass('whitespace-nowrap');
      expect(badge).toHaveClass('shrink-0');
    });

    it('has transition styles', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('transition-[color,box-shadow]');
    });

    it('has overflow hidden', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('overflow-hidden');
    });
  });

  describe('Focus and Invalid States', () => {
    it('applies focus-visible styles', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('focus-visible:border-ring');
      expect(badge).toHaveClass('focus-visible:ring-ring/50');
      expect(badge).toHaveClass('focus-visible:ring-[3px]');
    });

    it('supports aria-invalid attribute', () => {
      render(<Badge aria-invalid="true">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('aria-invalid', 'true');
      expect(badge).toHaveClass('aria-invalid:ring-destructive/20');
      expect(badge).toHaveClass('aria-invalid:border-destructive');
    });

    it('has dark mode invalid styles', () => {
      render(<Badge aria-invalid="true">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('dark:aria-invalid:ring-destructive/40');
    });
  });

  describe('HTML Attributes', () => {
    it('supports id attribute', () => {
      render(<Badge id="test-badge">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('id', 'test-badge');
    });

    it('supports title attribute', () => {
      render(<Badge title="Badge tooltip">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('title', 'Badge tooltip');
    });

    it('supports data attributes', () => {
      render(
        <Badge data-testid="custom-badge" data-priority="high">
          Badge
        </Badge>
      );
      const badge = screen.getByTestId('custom-badge');
      expect(badge).toHaveAttribute('data-priority', 'high');
    });

    it('supports aria-label', () => {
      render(<Badge aria-label="Custom label">Badge</Badge>);
      const badge = screen.getByLabelText('Custom label');
      expect(badge).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Badge aria-describedby="description">Badge</Badge>
          <div id="description">Badge description</div>
        </>
      );
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('asChild Prop', () => {
    it('renders as span when asChild is false', () => {
      render(<Badge asChild={false}>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.tagName).toBe('SPAN');
    });

    it('renders with Slot when asChild is true', () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );
      const badge = screen.getByText('Link Badge');
      expect(badge.tagName).toBe('A');
      expect(badge).toHaveAttribute('href', '/test');
    });
  });

  describe('Trade Business Context', () => {
    it('renders urgent status badge', () => {
      render(<Badge variant="destructive">Urgent</Badge>);
      const badge = screen.getByText('Urgent');
      expect(badge).toHaveClass('bg-destructive');
      expect(badge).toHaveTextContent('Urgent');
    });

    it('renders priority labels', () => {
      const { rerender } = render(<Badge variant="destructive">High Priority</Badge>);
      expect(screen.getByText('High Priority')).toBeInTheDocument();

      rerender(<Badge variant="secondary">Medium</Badge>);
      expect(screen.getByText('Medium')).toBeInTheDocument();

      rerender(<Badge variant="outline">Low Priority</Badge>);
      expect(screen.getByText('Low Priority')).toBeInTheDocument();
    });

    it('renders notification counts', () => {
      render(<Badge variant="destructive">3</Badge>);
      const badge = screen.getByText('3');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('renders large notification counts', () => {
      render(<Badge variant="destructive">99+</Badge>);
      const badge = screen.getByText('99+');
      expect(badge).toHaveTextContent('99+');
    });

    it('renders WorkSafe notice badge', () => {
      render(<Badge variant="destructive">🚨 WorkSafe Notice</Badge>);
      const badge = screen.getByText(/WorkSafe Notice/i);
      expect(badge).toHaveClass('bg-destructive');
    });

    it('renders compliance due badge', () => {
      render(<Badge variant="destructive">Compliance Due: 3 days</Badge>);
      const badge = screen.getByText(/Compliance Due/i);
      expect(badge).toBeInTheDocument();
    });

    it('renders status badges for trade workflows', () => {
      const { rerender } = render(<Badge>New Lead</Badge>);
      expect(screen.getByText('New Lead')).toBeInTheDocument();

      rerender(<Badge variant="secondary">Pending Review</Badge>);
      expect(screen.getByText('Pending Review')).toBeInTheDocument();

      rerender(<Badge>Approved</Badge>);
      expect(screen.getByText('Approved')).toBeInTheDocument();

      rerender(<Badge variant="destructive">Rejected</Badge>);
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    it('renders badge with icon', () => {
      render(
        <Badge>
          <svg data-testid="icon" viewBox="0 0 16 16">
            <path d="M8 8" />
          </svg>
          New
        </Badge>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('has icon sizing classes', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('[&>svg]:size-3');
    });

    it('has icon pointer-events-none class', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('[&>svg]:pointer-events-none');
    });

    it('has gap for icon spacing', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('gap-1');
    });
  });

  describe('Dark Mode Support', () => {
    it('has dark mode destructive styles', () => {
      render(<Badge variant="destructive">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('dark:bg-destructive/60');
      expect(badge).toHaveClass('dark:focus-visible:ring-destructive/40');
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty children', () => {
      render(<Badge>{''}</Badge>);
      const badge = screen.getByText('', { selector: 'span[data-slot="badge"]' });
      expect(badge).toBeInTheDocument();
    });

    it('renders with whitespace children', () => {
      render(<Badge>   </Badge>);
      const badge = screen.getByText('', { selector: 'span[data-slot="badge"]' });
      expect(badge).toBeInTheDocument();
    });

    it('handles multiple class names correctly', () => {
      render(<Badge className="class-1 class-2 class-3">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('class-1');
      expect(badge).toHaveClass('class-2');
      expect(badge).toHaveClass('class-3');
    });

    it('handles long text correctly', () => {
      render(<Badge>Very Long Badge Text That Should Not Wrap</Badge>);
      const badge = screen.getByText(/Very Long Badge Text/i);
      expect(badge).toHaveClass('whitespace-nowrap');
    });

    it('handles special characters in text', () => {
      render(<Badge>Badge & Text &lt; &gt;</Badge>);
      const badge = screen.getByText(/Badge & Text/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('ClassName Merging', () => {
    it('merges custom className with base classes', () => {
      render(<Badge className="bg-blue-500">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('bg-blue-500');
      // Base classes should still be present
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
    });

    it('allows overriding variant classes with className', () => {
      render(<Badge variant="default" className="bg-green-600">Override</Badge>);
      const badge = screen.getByText('Override');
      expect(badge).toHaveClass('bg-green-600');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic role as span', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.tagName).toBe('SPAN');
    });

    it('supports aria-label for accessibility', () => {
      render(<Badge aria-label="3 unread messages">3</Badge>);
      const badge = screen.getByLabelText('3 unread messages');
      expect(badge).toHaveTextContent('3');
    });

    it('supports role attribute', () => {
      render(<Badge role="status">New</Badge>);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
    });

    it('supports aria-live for dynamic content', () => {
      render(<Badge aria-live="polite">3</Badge>);
      const badge = screen.getByText('3');
      expect(badge).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Display Name', () => {
    it('has displayName set', () => {
      expect(Badge.displayName).toBe('Badge');
    });
  });

  describe('Variant Combinations with Custom Styles', () => {
    it('renders default variant with custom background', () => {
      render(<Badge variant="default" className="bg-blue-600">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('bg-blue-600');
    });

    it('renders destructive variant with custom styles', () => {
      render(
        <Badge variant="destructive" className="font-bold">
          Urgent
        </Badge>
      );
      const badge = screen.getByText('Urgent');
      expect(badge).toHaveClass('bg-destructive');
      expect(badge).toHaveClass('font-bold');
    });

    it('renders outline variant with hover styles', () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('[a&]:hover:bg-accent');
      expect(badge).toHaveClass('[a&]:hover:text-accent-foreground');
    });
  });
});
