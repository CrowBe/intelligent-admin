import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  describe('Rendering', () => {
    it('should render a textarea element', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with data-slot attribute', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('[data-slot="textarea"]');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter text here" />);
      const textarea = screen.getByPlaceholderText('Enter text here');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with default value', () => {
      render(<Textarea defaultValue="Default text" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Default text');
    });

    it('should render with controlled value', () => {
      render(<Textarea value="Controlled text" onChange={() => {}} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Controlled text');
    });
  });

  describe('Styling', () => {
    it('should apply default classes', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('resize-none');
      expect(textarea).toHaveClass('border-input');
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('min-h-16');
    });

    it('should apply custom className', () => {
      const { container } = render(<Textarea className="custom-class" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<Textarea className="my-4 w-96" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('my-4');
      expect(textarea).toHaveClass('w-96');
      expect(textarea).toHaveClass('rounded-md');
    });

    it('should apply disabled styles when disabled', () => {
      const { container } = render(<Textarea disabled />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('disabled:cursor-not-allowed');
      expect(textarea).toHaveClass('disabled:opacity-50');
    });
  });

  describe('User Interaction', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Hello World');
      expect(textarea).toHaveValue('Hello World');
    });

    it('should handle multiline input', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });

    it('should call onChange handler', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should not allow input when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea disabled onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Test');
      expect(handleChange).not.toHaveBeenCalled();
      expect(textarea).toHaveValue('');
    });

    it('should not allow input when readOnly', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea readOnly defaultValue="Read only" onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Test');
      expect(handleChange).not.toHaveBeenCalled();
      expect(textarea).toHaveValue('Read only');
    });

    it('should handle focus', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      expect(textarea).toHaveFocus();
    });

    it('should handle blur', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Textarea onBlur={handleBlur} />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Props', () => {
    it('should forward additional props', () => {
      render(<Textarea data-testid="custom-textarea" />);
      const textarea = screen.getByTestId('custom-textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('should support rows attribute', () => {
      const { container } = render(<Textarea rows={5} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should support cols attribute', () => {
      const { container } = render(<Textarea cols={40} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('cols', '40');
    });

    it('should support maxLength attribute', () => {
      const { container } = render(<Textarea maxLength={100} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should enforce maxLength', async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={5} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, '123456789');
      expect(textarea).toHaveValue('12345');
    });

    it('should support required attribute', () => {
      const { container } = render(<Textarea required />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('required');
    });

    it('should support disabled attribute', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should support readOnly attribute', () => {
      const { container } = render(<Textarea readOnly />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('readOnly');
    });

    it('should support name attribute', () => {
      const { container } = render(<Textarea name="message" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('name', 'message');
    });

    it('should support id attribute', () => {
      const { container } = render(<Textarea id="my-textarea" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('id', 'my-textarea');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to the textarea element', () => {
      const ref = { current: null as HTMLTextAreaElement | null };
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('should allow accessing DOM methods through ref', () => {
      const ref = { current: null as HTMLTextAreaElement | null };
      render(<Textarea ref={ref} defaultValue="Test" />);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.value).toBe('Test');
    });

    it('should allow focusing through ref', () => {
      const ref = { current: null as HTMLTextAreaElement | null };
      render(<Textarea ref={ref} />);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have role="textbox"', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Textarea aria-label="Message input" />);
      const textarea = screen.getByLabelText('Message input');
      expect(textarea).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Textarea aria-describedby="helper-text" />
          <div id="helper-text">Helper text</div>
        </>
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('should support aria-invalid', () => {
      const { container } = render(<Textarea aria-invalid={true} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveClass('aria-invalid:border-destructive');
    });

    it('should support aria-required', () => {
      const { container } = render(<Textarea aria-required={true} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.tab();
      expect(textarea).toHaveFocus();
    });

    it('should work with label element', () => {
      render(
        <>
          <label htmlFor="my-textarea">Message</label>
          <Textarea id="my-textarea" />
        </>
      );
      const textarea = screen.getByLabelText('Message');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null className', () => {
      const { container } = render(<Textarea className={undefined} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('border-input');
    });

    it('should handle empty className', () => {
      const { container } = render(<Textarea className="" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('border-input');
    });

    it('should handle empty string value', async () => {
      const user = userEvent.setup();
      render(<Textarea defaultValue="Test" />);
      const textarea = screen.getByRole('textbox');

      await user.clear(textarea);
      expect(textarea).toHaveValue('');
    });

    it('should handle very long text', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(10000);
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, longText);
      expect(textarea).toHaveValue(longText);
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, '!@#$%^&*()_+-=[]{}|;:",.<>?');
      expect(textarea).toHaveValue('!@#$%^&*()_+-=[]{}|;:",.<>?');
    });
  });

  describe('Display Name', () => {
    it('should have correct display name', () => {
      expect(Textarea.displayName).toBe('Textarea');
    });
  });

  describe('Integration', () => {
    it('should work in form context', () => {
      const { container } = render(
        <form>
          <Textarea name="message" />
        </form>
      );
      const textarea = container.querySelector('textarea[name="message"]');
      expect(textarea).toBeInTheDocument();
    });

    it('should work with validation', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => {
        e.preventDefault();
      });

      render(
        <form onSubmit={handleSubmit}>
          <Textarea required />
          <button type="submit">Submit</button>
        </form>
      );

      const textarea = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleSubmit).not.toHaveBeenCalled();

      await user.type(textarea, 'Valid input');
      await user.click(button);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Trade Business Context', () => {
    it('should handle job notes input', async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="Enter job notes..." />);
      const textarea = screen.getByPlaceholderText('Enter job notes...');

      await user.type(textarea, 'Customer requested specific fixtures{Enter}Access through side gate');
      expect(textarea).toHaveValue('Customer requested specific fixtures\nAccess through side gate');
    });

    it('should handle client message composition', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Textarea
          placeholder="Message to client..."
          onChange={handleChange}
        />
      );
      const textarea = screen.getByPlaceholderText('Message to client...');

      await user.type(textarea, 'Dear John,{Enter}{Enter}Thank you for your inquiry.');
      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue('Dear John,\n\nThank you for your inquiry.');
    });

    it('should handle quote description', async () => {
      const user = userEvent.setup();
      render(<Textarea rows={8} placeholder="Describe the work..." />);
      const textarea = screen.getByPlaceholderText('Describe the work...');

      const description = 'Complete bathroom renovation including:{Enter}' +
        '- Remove existing fixtures{Enter}' +
        '- Install new plumbing';

      await user.type(textarea, description);
      expect(textarea.value).toContain('Complete bathroom renovation');
      expect(textarea.value).toContain('Remove existing fixtures');
    });
  });

  describe('Event Handlers', () => {
    it('should call onFocus handler', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Textarea onFocus={handleFocus} />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onKeyDown handler', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();
      render(<Textarea onKeyDown={handleKeyDown} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'a');
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should call onKeyUp handler', async () => {
      const user = userEvent.setup();
      const handleKeyUp = vi.fn();
      render(<Textarea onKeyUp={handleKeyUp} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'a');
      expect(handleKeyUp).toHaveBeenCalled();
    });
  });
});
