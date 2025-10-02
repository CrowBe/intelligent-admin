/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('renders with default value', () => {
      render(<Input defaultValue="Initial value" />);
      const input = screen.getByDisplayValue('Initial value');
      expect(input).toBeInTheDocument();
    });

    it('has data-slot attribute', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('renders with correct base classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('h-9');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('border');
    });
  });

  describe('Input Types', () => {
    it('renders as text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      // Input element exists and behaves as textbox (browser defaults to 'text')
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('renders as email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders as password input', () => {
      render(<Input type="password" />);
      // eslint-disable-next-line no-undef
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders as number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders as tel input', () => {
      render(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders as search input', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('renders as url input', () => {
      render(<Input type="url" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('renders as date input', () => {
      render(<Input type="date" />);
      // eslint-disable-next-line no-undef
      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'date');
    });
  });

  describe('States', () => {
    it('renders disabled state correctly', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:pointer-events-none');
      expect(input).toHaveClass('disabled:opacity-50');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('does not allow input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(input).toHaveValue('');
    });

    it('renders readonly state correctly', () => {
      render(<Input readOnly value="Read only value" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('Read only value');
    });

    it('does not allow editing when readonly', async () => {
      const user = userEvent.setup();
      render(<Input readOnly defaultValue="readonly" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      // Readonly inputs cannot be typed into
      await user.type(input, 'test');
      expect(input).toHaveValue('readonly');
    });
  });

  describe('Interactions', () => {
    it('calls onChange handler when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // One for each character
    });

    it('updates value when typing', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Hello World');
      expect(input.value).toBe('Hello World');
    });

    it('calls onFocus handler when focused', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      await user.click(input);
      expect(handleFocus).toHaveBeenCalledOnce();
    });

    it('calls onBlur handler when blurred', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // Move focus away
      expect(handleBlur).toHaveBeenCalledOnce();
    });

    it('calls onKeyDown handler on key press', async () => {
      const handleKeyDown = vi.fn();
      const user = userEvent.setup();
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      input.focus();
      await user.keyboard('a');
      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Email address" />);
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    });

    it('supports aria-labelledby', () => {
      render(
        <>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label id="email-label">Email</label>
          <Input aria-labelledby="email-label" />
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-labelledby', 'email-label');
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="helper-text" />
          <div id="helper-text">Enter your email address</div>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('supports aria-invalid for error state', () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveClass('aria-invalid:ring-destructive/20');
      expect(input).toHaveClass('aria-invalid:border-destructive');
    });

    it('supports aria-required', () => {
      render(<Input aria-required="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('supports required attribute', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('HTML Attributes', () => {
    it('supports name attribute', () => {
      render(<Input name="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('supports id attribute', () => {
      render(<Input id="email-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('supports maxLength attribute', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('supports minLength attribute', () => {
      render(<Input minLength={5} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
    });

    it('supports pattern attribute', () => {
      render(<Input pattern="[0-9]*" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });

    it('supports autoComplete attribute', () => {
      render(<Input autoComplete="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });

    it('supports autoFocus attribute', () => {
      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
      render(<Input autoFocus />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });

    it('supports data attributes', () => {
      render(<Input data-testid="custom-input" data-custom="value" />);
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Number Input', () => {
    it('supports min and max attributes', () => {
      render(<Input type="number" min="0" max="100" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('supports step attribute', () => {
      render(<Input type="number" step="0.01" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.01');
    });

    it('accepts numeric input', async () => {
      const user = userEvent.setup();
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      await user.type(input, '123');
      expect(input.value).toBe('123');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });

    it('allows ref access to input methods', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current?.focus).toBeDefined();
      expect(ref.current?.blur).toBeDefined();
      expect(ref.current?.select).toBeDefined();
    });

    it('can focus input via ref', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      ref.current?.focus();
      // eslint-disable-next-line no-undef
      expect(document.activeElement).toBe(ref.current);
    });
  });

  describe('Focus Management', () => {
    it('applies focus-visible styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:border-ring');
      expect(input).toHaveClass('focus-visible:ring-ring/50');
      expect(input).toHaveClass('focus-visible:ring-[3px]');
    });

    it('can receive focus', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      // eslint-disable-next-line no-undef
      expect(document.activeElement).toBe(input);
    });

    it('cannot receive focus when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      input.focus();
      // eslint-disable-next-line no-undef
      expect(document.activeElement).not.toBe(input);
    });
  });

  describe('Class Name Merging', () => {
    it('merges custom className with default classes', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('flex'); // Default class
    });

    it('handles multiple custom classes correctly', () => {
      render(<Input className="class-1 class-2 class-3" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('class-1');
      expect(input).toHaveClass('class-2');
      expect(input).toHaveClass('class-3');
    });
  });

  describe('Trade Business Context', () => {
    it('renders email input for client contact', async () => {
      const user = userEvent.setup();
      render(<Input type="email" placeholder="client@example.com" aria-label="Client email" />);
      const input = screen.getByLabelText('Client email');
      await user.type(input, 'john@example.com');
      expect(input).toHaveValue('john@example.com');
    });

    it('renders tel input for Australian phone numbers', async () => {
      const user = userEvent.setup();
      render(<Input type="tel" placeholder="0412 345 678" aria-label="Phone number" />);
      const input = screen.getByLabelText('Phone number');
      await user.type(input, '0412345678');
      expect(input).toHaveValue('0412345678');
    });

    it('renders ABN input with pattern validation', () => {
      const abnPattern = '\\d{2} \\d{3} \\d{3} \\d{3}';
      render(
        <Input
          placeholder="12 345 678 901"
          maxLength={14}
          pattern={abnPattern}
          aria-label="ABN"
        />
      );
      const input = screen.getByLabelText('ABN');
      expect(input).toHaveAttribute('maxLength', '14');
      expect(input).toHaveAttribute('pattern', abnPattern);
    });

    it('renders quote amount input for currency', () => {
      render(
        <Input
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          aria-label="Quote amount"
        />
      );
      const input = screen.getByLabelText('Quote amount');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('step', '0.01');
    });

    it('renders business name input', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="ABC Plumbing Services Pty Ltd" aria-label="Business name" />);
      const input = screen.getByLabelText('Business name');
      await user.type(input, 'XYZ Electrical');
      expect(input).toHaveValue('XYZ Electrical');
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty value', () => {
      render(<Input value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('renders with undefined type (defaults to text)', () => {
      render(<Input type={undefined} />);
      const input = screen.getByRole('textbox');
      // Input element exists and behaves as textbox (browser defaults to 'text')
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('handles null className gracefully', () => {
      render(<Input className={undefined} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex'); // Should still have base classes
    });

    it('renders with very long placeholder', () => {
      const longPlaceholder = 'This is a very long placeholder text that might overflow the input field';
      render(<Input placeholder={longPlaceholder} />);
      const input = screen.getByPlaceholderText(longPlaceholder);
      expect(input).toBeInTheDocument();
    });

    it('handles special characters in value', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, '!@#$%^&*()');
      expect(input.value).toBe('!@#$%^&*()');
    });
  });
});
