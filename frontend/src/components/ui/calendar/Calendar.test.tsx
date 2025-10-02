import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  it('renders without crashing', () => {
    const { container } = render(<Calendar />);
    expect(container.querySelector('.rdp')).toBeInTheDocument();
  });

  it('renders with selected date', () => {
    const selected = new Date(2024, 0, 1);
    const { container } = render(<Calendar mode="single" selected={selected} />);
    expect(container.querySelector('[aria-selected="true"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Calendar className="custom-calendar" />);
    const calendar = container.querySelector('.rdp');
    expect(calendar).toHaveClass('custom-calendar');
  });

  it('renders navigation buttons', () => {
    const { container } = render(<Calendar />);
    const navButtons = container.querySelectorAll('button');
    expect(navButtons.length).toBeGreaterThan(0);
  });
});
