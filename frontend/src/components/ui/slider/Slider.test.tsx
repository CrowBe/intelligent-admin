import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders without crashing', () => {
    const { container } = render(<Slider defaultValue={[50]} />);
    expect(container.querySelector('[data-slot="slider"]')).toBeInTheDocument();
  });

  it('renders with single value', () => {
    const { container } = render(<Slider defaultValue={[50]} max={100} />);
    const slider = container.querySelector('[data-slot="slider"]');
    expect(slider).toBeInTheDocument();
  });

  it('renders with range values', () => {
    const { container } = render(<Slider defaultValue={[25, 75]} max={100} />);
    const thumbs = container.querySelectorAll('[data-slot="slider-thumb"]');
    expect(thumbs).toHaveLength(2);
  });

  it('applies custom className', () => {
    const { container } = render(<Slider defaultValue={[50]} className="custom-slider" />);
    const slider = container.querySelector('[data-slot="slider"]');
    expect(slider).toHaveClass('custom-slider');
  });
});
