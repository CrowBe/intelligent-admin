import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
  it('renders without crashing', () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Label className="custom-class">Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('custom-class');
  });

  it('associates with form elements using htmlFor', () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </div>
    );
    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('applies data-slot attribute', () => {
    render(<Label data-testid="label">Label</Label>);
    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('data-slot', 'label');
  });

  it('renders children content', () => {
    render(
      <Label>
        Name <span className="text-destructive">*</span>
      </Label>
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('supports peer-disabled styling', () => {
    render(
      <div>
        <input disabled className="peer" />
        <Label>Disabled field</Label>
      </div>
    );
    const label = screen.getByText('Disabled field');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
    expect(label).toHaveClass('peer-disabled:opacity-50');
  });

  it('supports group-data disabled styling', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('group-data-[disabled=true]:pointer-events-none');
    expect(label).toHaveClass('group-data-[disabled=true]:opacity-50');
  });

  it('has correct text styling classes', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
    expect(label).toHaveClass('leading-none');
  });

  it('has flexbox layout classes', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('flex');
    expect(label).toHaveClass('items-center');
    expect(label).toHaveClass('gap-2');
  });

  it('has select-none class for better UX', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('select-none');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Label ref={ref}>Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('spreads additional props', () => {
    render(
      <Label data-testid="custom-label" aria-label="Custom aria label">
        Label
      </Label>
    );
    const label = screen.getByTestId('custom-label');
    expect(label).toHaveAttribute('aria-label', 'Custom aria label');
  });

  it('works with complex children', () => {
    render(
      <Label htmlFor="complex">
        <span>Email</span>
        <span className="text-muted-foreground">(required)</span>
      </Label>
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('(required)')).toBeInTheDocument();
  });

  it('maintains consistent spacing with gap utility', () => {
    render(
      <Label>
        <span>First</span>
        <span>Second</span>
      </Label>
    );
    const label = screen.getByText('First').parentElement;
    expect(label).toHaveClass('gap-2');
  });
});
