import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders without crashing', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('can be toggled on by clicking', async () => {
    const user = userEvent.setup();
    render(<Switch />);
    const switchElement = screen.getByRole('switch');

    expect(switchElement).toHaveAttribute('aria-checked', 'false');
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('can be toggled off after being on', async () => {
    const user = userEvent.setup();
    render(<Switch defaultChecked />);
    const switchElement = screen.getByRole('switch');

    expect(switchElement).toHaveAttribute('aria-checked', 'true');
    await user.click(switchElement);
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole('switch');

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('respects disabled prop', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Switch disabled onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole('switch');

    expect(switchElement).toBeDisabled();
    await user.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders as checked when defaultChecked is true', () => {
    render(<Switch defaultChecked />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('can be controlled with checked prop', () => {
    const { rerender } = render(<Switch checked={false} onCheckedChange={vi.fn()} />);
    const switchElement = screen.getByRole('switch');

    expect(switchElement).toHaveAttribute('aria-checked', 'false');

    rerender(<Switch checked={true} onCheckedChange={vi.fn()} />);
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('supports required attribute', () => {
    render(<Switch required />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-required', 'true');
  });

  it('supports aria-label for accessibility', () => {
    render(<Switch aria-label="Enable notifications" />);
    const switchElement = screen.getByRole('switch', { name: 'Enable notifications' });
    expect(switchElement).toBeInTheDocument();
  });

  it('applies focus styles when focused', async () => {
    const user = userEvent.setup();
    render(<Switch />);
    const switchElement = screen.getByRole('switch');

    await user.tab();
    expect(switchElement).toHaveFocus();
  });

  it('can be toggled with keyboard (Space)', async () => {
    const user = userEvent.setup();
    render(<Switch />);
    const switchElement = screen.getByRole('switch');

    await user.tab();
    expect(switchElement).toHaveFocus();

    await user.keyboard(' ');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');

    await user.keyboard(' ');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('can be toggled with keyboard (Enter)', async () => {
    const user = userEvent.setup();
    render(<Switch />);
    const switchElement = screen.getByRole('switch');

    await user.tab();
    expect(switchElement).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('maintains peer styling class for form integration', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('peer');
  });

  it('applies data-slot attribute', () => {
    render(<Switch data-testid="custom-switch" />);
    const switchElement = screen.getByTestId('custom-switch');
    expect(switchElement).toHaveAttribute('data-slot', 'switch');
  });

  it('supports data attributes', () => {
    render(<Switch data-testid="custom-switch" data-custom="value" />);
    const switchElement = screen.getByTestId('custom-switch');
    expect(switchElement).toHaveAttribute('data-custom', 'value');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Switch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('has correct data-state attribute when checked', () => {
    render(<Switch defaultChecked />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('has correct data-state attribute when unchecked', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('renders switch thumb element', () => {
    const { container } = render(<Switch />);
    const thumb = container.querySelector('[data-slot="switch-thumb"]');
    expect(thumb).toBeInTheDocument();
  });

  it('applies disabled styles when disabled', () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('disabled:cursor-not-allowed');
    expect(switchElement).toHaveClass('disabled:opacity-50');
  });

  it('applies transition classes for smooth animation', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('transition-all');
  });

  it('supports id prop for label association', () => {
    render(
      <div>
        <Switch id="my-switch" />
        <label htmlFor="my-switch">My Switch</label>
      </div>
    );
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('id', 'my-switch');
  });
});
