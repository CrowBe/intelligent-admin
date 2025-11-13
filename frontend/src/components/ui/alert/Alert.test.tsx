import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './Alert';

describe('Alert', () => {
  describe('Alert Component', () => {
    it('renders correctly', () => {
      render(
        <Alert data-testid="alert">
          <p>Alert content</p>
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <Alert>
          <p>Test content</p>
        </Alert>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('has correct role attribute', () => {
      render(<Alert data-testid="alert">Content</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('has correct data-slot attribute', () => {
      render(<Alert data-testid="alert">Content</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('data-slot', 'alert');
    });

    it('applies base classes', () => {
      render(<Alert data-testid="alert">Content</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('relative');
      expect(alert).toHaveClass('w-full');
      expect(alert).toHaveClass('rounded-lg');
      expect(alert).toHaveClass('border');
      expect(alert).toHaveClass('px-4');
      expect(alert).toHaveClass('py-3');
      expect(alert).toHaveClass('text-sm');
    });

    it('applies default variant classes', () => {
      render(<Alert data-testid="alert">Content</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('bg-card');
      expect(alert).toHaveClass('text-card-foreground');
    });

    it('applies destructive variant classes', () => {
      render(
        <Alert data-testid="alert" variant="destructive">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('text-destructive');
      expect(alert).toHaveClass('bg-card');
    });

    it('merges custom className', () => {
      render(
        <Alert data-testid="alert" className="custom-class">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('custom-class');
      expect(alert).toHaveClass('bg-card');
    });

    it('accepts custom props', () => {
      render(
        <Alert data-testid="alert" id="custom-id" data-custom="value">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('id', 'custom-id');
      expect(alert).toHaveAttribute('data-custom', 'value');
    });

    it('renders with icon correctly', () => {
      render(
        <Alert data-testid="alert">
          <svg data-testid="icon">
            <circle />
          </svg>
          <AlertTitle>Title</AlertTitle>
        </Alert>
      );
      const icon = screen.getByTestId('icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('AlertTitle Component', () => {
    it('renders correctly', () => {
      render(<AlertTitle data-testid="title">Alert Title</AlertTitle>);
      const title = screen.getByTestId('title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Alert Title');
    });

    it('has correct data-slot attribute', () => {
      render(<AlertTitle data-testid="title">Title</AlertTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('data-slot', 'alert-title');
    });

    it('applies base classes', () => {
      render(<AlertTitle data-testid="title">Title</AlertTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('col-start-2');
      expect(title).toHaveClass('line-clamp-1');
      expect(title).toHaveClass('min-h-4');
      expect(title).toHaveClass('font-medium');
      expect(title).toHaveClass('tracking-tight');
    });

    it('merges custom className', () => {
      render(
        <AlertTitle data-testid="title" className="text-primary">
          Title
        </AlertTitle>
      );
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-primary');
      expect(title).toHaveClass('font-medium');
    });

    it('accepts custom props', () => {
      render(
        <AlertTitle data-testid="title" id="main-title">
          Title
        </AlertTitle>
      );
      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('id', 'main-title');
    });

    it('truncates long text with line-clamp', () => {
      render(
        <AlertTitle data-testid="title">
          This is a very long alert title that should be truncated with ellipsis
        </AlertTitle>
      );
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('line-clamp-1');
    });
  });

  describe('AlertDescription Component', () => {
    it('renders correctly', () => {
      render(<AlertDescription data-testid="description">Alert description text</AlertDescription>);
      const description = screen.getByTestId('description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Alert description text');
    });

    it('has correct data-slot attribute', () => {
      render(<AlertDescription data-testid="description">Description</AlertDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveAttribute('data-slot', 'alert-description');
    });

    it('applies base classes', () => {
      render(<AlertDescription data-testid="description">Description</AlertDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveClass('col-start-2');
      expect(description).toHaveClass('grid');
      expect(description).toHaveClass('justify-items-start');
      expect(description).toHaveClass('gap-1');
      expect(description).toHaveClass('text-sm');
    });

    it('merges custom className', () => {
      render(
        <AlertDescription data-testid="description" className="custom-desc">
          Description
        </AlertDescription>
      );
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('custom-desc');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('accepts custom props', () => {
      render(
        <AlertDescription data-testid="description" lang="en">
          Description
        </AlertDescription>
      );
      const description = screen.getByTestId('description');
      expect(description).toHaveAttribute('lang', 'en');
    });

    it('renders complex content with paragraphs', () => {
      render(
        <AlertDescription data-testid="description">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>
      );
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });

  describe('Complete Alert Composition', () => {
    it('renders all components together', () => {
      render(
        <Alert data-testid="alert">
          <AlertTitle data-testid="title">Test Title</AlertTitle>
          <AlertDescription data-testid="description">Test Description</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
    });

    it('renders with icon and content', () => {
      render(
        <Alert data-testid="alert">
          <svg data-testid="icon">
            <circle />
          </svg>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders destructive alert with all components', () => {
      render(
        <Alert data-testid="alert" variant="destructive">
          <AlertTitle data-testid="title">Error</AlertTitle>
          <AlertDescription data-testid="description">Something went wrong</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('text-destructive');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Trade Business Context', () => {
    it('renders WorkSafe compliance alert', () => {
      render(
        <Alert variant="destructive" data-testid="alert">
          <AlertTitle>Urgent: WorkSafe Compliance Notice</AlertTitle>
          <AlertDescription>
            A new WorkSafe notice has been issued regarding site safety procedures. Please review and respond within 24
            hours.
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('text-destructive');
      expect(screen.getByText(/Urgent: WorkSafe Compliance Notice/i)).toBeInTheDocument();
      expect(screen.getByText(/WorkSafe notice has been issued/i)).toBeInTheDocument();
    });

    it('renders client reminder alert', () => {
      render(
        <Alert>
          <AlertTitle>Client Meeting Reminder</AlertTitle>
          <AlertDescription>
            You have a meeting with Johnson Construction in 30 minutes to discuss the Chapel Street project.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText(/Client Meeting Reminder/i)).toBeInTheDocument();
      expect(screen.getByText(/Johnson Construction/i)).toBeInTheDocument();
    });

    it('renders quote approval alert', () => {
      render(
        <Alert>
          <AlertTitle>Quote Approved</AlertTitle>
          <AlertDescription>
            Your quote for the Richmond warehouse electrical upgrade (Quote #2024-078) has been approved.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText(/Quote Approved/i)).toBeInTheDocument();
      expect(screen.getByText(/Quote #2024-078/i)).toBeInTheDocument();
    });

    it('renders safety update alert with complex content', () => {
      render(
        <Alert>
          <AlertTitle>Important Safety Update</AlertTitle>
          <AlertDescription>
            <p>New safety protocols have been introduced.</p>
            <ul>
              <li>Enhanced RCD testing</li>
              <li>Updated labeling standards</li>
            </ul>
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText(/Important Safety Update/i)).toBeInTheDocument();
      expect(screen.getByText(/Enhanced RCD testing/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has alert role for screen readers', () => {
      render(<Alert data-testid="alert">Content</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('supports aria attributes', () => {
      render(
        <Alert aria-label="Important notification" data-testid="alert">
          <AlertDescription>Content</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('aria-label', 'Important notification');
    });

    it('supports aria-live for dynamic alerts', () => {
      render(
        <Alert aria-live="assertive" data-testid="alert">
          <AlertDescription>Urgent message</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('supports aria-atomic for complete announcements', () => {
      render(
        <Alert aria-atomic="true" data-testid="alert">
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('renders alert with only title', () => {
      render(
        <Alert>
          <AlertTitle data-testid="title">Only title</AlertTitle>
        </Alert>
      );

      expect(screen.getByTestId('title')).toBeInTheDocument();
    });

    it('renders alert with only description', () => {
      render(
        <Alert>
          <AlertDescription data-testid="description">Only description</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('description')).toBeInTheDocument();
    });

    it('renders empty alert', () => {
      render(<Alert data-testid="alert" />);
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });

    it('renders alert with empty strings', () => {
      render(
        <Alert>
          <AlertTitle>{''}</AlertTitle>
          <AlertDescription>{''}</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('', { selector: '[data-slot="alert-title"]' })).toBeInTheDocument();
    });

    it('handles multiple custom classes correctly', () => {
      render(
        <Alert data-testid="alert" className="class-1 class-2 class-3">
          Content
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('class-1');
      expect(alert).toHaveClass('class-2');
      expect(alert).toHaveClass('class-3');
      expect(alert).toHaveClass('bg-card');
    });

    it('renders alert without icon', () => {
      render(
        <Alert data-testid="alert">
          <AlertTitle>No Icon</AlertTitle>
          <AlertDescription>This alert has no icon</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText('No Icon')).toBeInTheDocument();
    });

    it('renders multiple alerts sequentially', () => {
      render(
        <div>
          <Alert data-testid="alert-1">
            <AlertTitle>First Alert</AlertTitle>
          </Alert>
          <Alert data-testid="alert-2">
            <AlertTitle>Second Alert</AlertTitle>
          </Alert>
          <Alert data-testid="alert-3">
            <AlertTitle>Third Alert</AlertTitle>
          </Alert>
        </div>
      );

      expect(screen.getByTestId('alert-1')).toBeInTheDocument();
      expect(screen.getByTestId('alert-2')).toBeInTheDocument();
      expect(screen.getByTestId('alert-3')).toBeInTheDocument();
    });

    it('handles very long content gracefully', () => {
      const longText = 'A'.repeat(1000);
      render(
        <Alert>
          <AlertDescription data-testid="description">{longText}</AlertDescription>
        </Alert>
      );

      const description = screen.getByTestId('description');
      expect(description).toHaveTextContent(longText);
    });
  });

  describe('Variant Behavior', () => {
    it('renders with explicit default variant', () => {
      render(
        <Alert data-testid="alert" variant="default">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('bg-card');
      expect(alert).toHaveClass('text-card-foreground');
    });

    it('renders with destructive variant', () => {
      render(
        <Alert data-testid="alert" variant="destructive">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('text-destructive');
    });

    it('applies destructive description styling correctly', () => {
      render(
        <Alert variant="destructive">
          <AlertDescription data-testid="description">Error message</AlertDescription>
        </Alert>
      );
      const description = screen.getByTestId('description');
      expect(description).toHaveAttribute('data-slot', 'alert-description');
    });
  });
});
