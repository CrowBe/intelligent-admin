import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Progress } from './Progress';

describe('Progress', () => {
  it('renders without crashing', () => {
    const { container } = render(<Progress value={50} />);
    expect(container.querySelector('[data-slot="progress"]')).toBeInTheDocument();
  });

  it('renders with correct value', () => {
    const { container } = render(<Progress value={75} />);
    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveStyle({ transform: 'translateX(-25%)' });
  });

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-progress" />);
    const progress = container.querySelector('[data-slot="progress"]');
    expect(progress).toHaveClass('custom-progress');
  });

  it('handles zero value', () => {
    const { container } = render(<Progress value={0} />);
    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });
});
