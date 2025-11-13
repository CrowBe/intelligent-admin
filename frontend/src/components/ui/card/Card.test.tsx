import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardAction } from './Card';

describe('Card', () => {
  describe('Card Component', () => {
    it('renders correctly', () => {
      render(
        <Card data-testid="card">
          <p>Card content</p>
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <Card>
          <p>Test content</p>
        </Card>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('has correct data-slot attribute', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('applies base classes', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
      expect(card).toHaveClass('flex');
      expect(card).toHaveClass('flex-col');
      expect(card).toHaveClass('gap-6');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('shadow-sm');
    });

    it('merges custom className', () => {
      render(
        <Card data-testid="card" className="custom-class">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-card'); // base class still present
    });

    it('accepts custom props', () => {
      render(
        <Card data-testid="card" id="custom-id" data-custom="value">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'custom-id');
      expect(card).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('CardHeader Component', () => {
    it('renders correctly', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent('Header content');
    });

    it('has correct data-slot attribute', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('data-slot', 'card-header');
    });

    it('applies base classes', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('grid');
      expect(header).toHaveClass('auto-rows-min');
      expect(header).toHaveClass('items-start');
      expect(header).toHaveClass('gap-1.5');
      expect(header).toHaveClass('px-6');
      expect(header).toHaveClass('pt-6');
    });

    it('merges custom className', () => {
      render(
        <CardHeader data-testid="header" className="custom-header">
          Header
        </CardHeader>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('grid');
    });

    it('accepts custom props', () => {
      render(
        <CardHeader data-testid="header" role="banner">
          Header
        </CardHeader>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('role', 'banner');
    });
  });

  describe('CardTitle Component', () => {
    it('renders correctly', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('uses h4 element', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H4');
    });

    it('has correct data-slot attribute', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('data-slot', 'card-title');
    });

    it('applies base classes', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
    });

    it('merges custom className', () => {
      render(
        <CardTitle data-testid="title" className="text-primary">
          Title
        </CardTitle>
      );
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-primary');
      expect(title).toHaveClass('font-semibold');
    });

    it('accepts custom props', () => {
      render(
        <CardTitle data-testid="title" id="main-title">
          Title
        </CardTitle>
      );
      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('id', 'main-title');
    });
  });

  describe('CardDescription Component', () => {
    it('renders correctly', () => {
      render(<CardDescription>Card description text</CardDescription>);
      expect(screen.getByText('Card description text')).toBeInTheDocument();
    });

    it('uses p element', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description.tagName).toBe('P');
    });

    it('has correct data-slot attribute', () => {
      render(<CardDescription data-testid="description">Description</CardDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveAttribute('data-slot', 'card-description');
    });

    it('applies base classes', () => {
      render(<CardDescription data-testid="description">Description</CardDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveClass('text-sm');
    });

    it('merges custom className', () => {
      render(
        <CardDescription data-testid="description" className="custom-desc">
          Description
        </CardDescription>
      );
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('custom-desc');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('accepts custom props', () => {
      render(
        <CardDescription data-testid="description" lang="en">
          Description
        </CardDescription>
      );
      const description = screen.getByTestId('description');
      expect(description).toHaveAttribute('lang', 'en');
    });
  });

  describe('CardAction Component', () => {
    it('renders correctly', () => {
      render(<CardAction data-testid="action">Action button</CardAction>);
      const action = screen.getByTestId('action');
      expect(action).toBeInTheDocument();
      expect(action).toHaveTextContent('Action button');
    });

    it('has correct data-slot attribute', () => {
      render(<CardAction data-testid="action">Action</CardAction>);
      const action = screen.getByTestId('action');
      expect(action).toHaveAttribute('data-slot', 'card-action');
    });

    it('applies base classes', () => {
      render(<CardAction data-testid="action">Action</CardAction>);
      const action = screen.getByTestId('action');
      expect(action).toHaveClass('col-start-2');
      expect(action).toHaveClass('row-span-2');
      expect(action).toHaveClass('row-start-1');
      expect(action).toHaveClass('self-start');
      expect(action).toHaveClass('justify-self-end');
    });

    it('merges custom className', () => {
      render(
        <CardAction data-testid="action" className="custom-action">
          Action
        </CardAction>
      );
      const action = screen.getByTestId('action');
      expect(action).toHaveClass('custom-action');
      expect(action).toHaveClass('col-start-2');
    });

    it('accepts custom props', () => {
      render(
        <CardAction data-testid="action" role="button">
          Action
        </CardAction>
      );
      const action = screen.getByTestId('action');
      expect(action).toHaveAttribute('role', 'button');
    });
  });

  describe('CardContent Component', () => {
    it('renders correctly', () => {
      render(<CardContent data-testid="content">Content text</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Content text');
    });

    it('has correct data-slot attribute', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-slot', 'card-content');
    });

    it('applies base classes', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('px-6');
    });

    it('merges custom className', () => {
      render(
        <CardContent data-testid="content" className="py-4">
          Content
        </CardContent>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('py-4');
      expect(content).toHaveClass('px-6');
    });

    it('accepts custom props', () => {
      render(
        <CardContent data-testid="content" aria-label="Main content">
          Content
        </CardContent>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('aria-label', 'Main content');
    });
  });

  describe('CardFooter Component', () => {
    it('renders correctly', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveTextContent('Footer content');
    });

    it('has correct data-slot attribute', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });

    it('applies base classes', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('px-6');
      expect(footer).toHaveClass('pb-6');
    });

    it('merges custom className', () => {
      render(
        <CardFooter data-testid="footer" className="justify-end">
          Footer
        </CardFooter>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('justify-end');
      expect(footer).toHaveClass('flex');
    });

    it('accepts custom props', () => {
      render(
        <CardFooter data-testid="footer" role="contentinfo">
          Footer
        </CardFooter>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });
  });

  describe('Complete Card Composition', () => {
    it('renders all components together', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Test Title</CardTitle>
            <CardDescription data-testid="description">Test Description</CardDescription>
          </CardHeader>
          <CardContent data-testid="content">Test Content</CardContent>
          <CardFooter data-testid="footer">Test Footer</CardFooter>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders with action in header', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
            <CardAction data-testid="action">Edit</CardAction>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByTestId('action')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  describe('Trade Business Context', () => {
    it('renders WorkSafe urgent notice card', () => {
      render(
        <Card className="border-destructive" data-testid="card">
          <CardHeader>
            <CardTitle className="text-destructive">Urgent: WorkSafe Compliance Notice</CardTitle>
            <CardDescription>Received 2 hours ago - Requires immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A new WorkSafe notice has been issued regarding site safety procedures.</p>
          </CardContent>
          <CardFooter>
            <button type="button">Review Notice</button>
          </CardFooter>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('border-destructive');
      expect(screen.getByText(/Urgent: WorkSafe Compliance Notice/i)).toHaveClass('text-destructive');
      expect(screen.getByText(/WorkSafe notice has been issued/i)).toBeInTheDocument();
    });

    it('renders client message card with new badge', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>New Message from Johnson Construction</CardTitle>
            <CardDescription>Received 15 minutes ago</CardDescription>
            <CardAction>
              <span data-testid="badge">New</span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Hi, we need to discuss the electrical installation schedule.</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText(/New Message from Johnson Construction/i)).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toHaveTextContent('New');
      expect(screen.getByText(/electrical installation schedule/i)).toBeInTheDocument();
    });

    it('renders job summary card with details', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Chapel Street Commercial Fit-out</CardTitle>
            <CardDescription>Job #2024-045 - In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div data-testid="job-details">
              <div>Client: Johnson Construction</div>
              <div>Due Date: March 15, 2024</div>
              <div>Progress: 65%</div>
            </div>
          </CardContent>
          <CardFooter>
            <button type="button">View Details</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText(/Chapel Street Commercial Fit-out/i)).toBeInTheDocument();
      expect(screen.getByText(/Job #2024-045/i)).toBeInTheDocument();
      expect(screen.getByTestId('job-details')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports semantic HTML structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content</p>
          </CardContent>
        </Card>
      );

      const title = screen.getByText('Title');
      const description = screen.getByText('Description');
      expect(title.tagName).toBe('H4');
      expect(description.tagName).toBe('P');
    });

    it('supports aria attributes', () => {
      render(
        <Card aria-label="Information card" data-testid="card">
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-label', 'Information card');
    });

    it('supports role attributes', () => {
      render(
        <Card role="article" data-testid="card">
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'article');
    });
  });

  describe('Edge Cases', () => {
    it('renders card with only content', () => {
      render(
        <Card>
          <CardContent data-testid="content">Only content</CardContent>
        </Card>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders empty card', () => {
      render(<Card data-testid="card" />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders card with empty strings', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>{''}</CardTitle>
            <CardDescription>{''}</CardDescription>
          </CardHeader>
          <CardContent>{''}</CardContent>
        </Card>
      );

      expect(screen.getByText('', { selector: 'h4' })).toBeInTheDocument();
    });

    it('handles multiple custom classes correctly', () => {
      render(
        <Card data-testid="card" className="class-1 class-2 class-3">
          Content
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('class-1');
      expect(card).toHaveClass('class-2');
      expect(card).toHaveClass('class-3');
      expect(card).toHaveClass('bg-card'); // base class still present
    });

    it('renders card with complex nested content', () => {
      render(
        <Card>
          <CardContent>
            <div data-testid="nested">
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
              <p>Nested paragraph</p>
            </div>
          </CardContent>
        </Card>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
    });
  });
});
