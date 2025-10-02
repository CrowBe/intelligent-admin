import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from './Form';
import { Input } from '@/components/ui/input';

const TestForm = () => {
  const form = useForm({
    defaultValues: {
      username: '',
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

describe('Form', () => {
  it('renders form field without crashing', () => {
    render(<TestForm />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders form description', () => {
    render(<TestForm />);
    expect(screen.getByText('Your public display name.')).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    render(<TestForm />);
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('applies data-slot attributes', () => {
    const { container } = render(<TestForm />);
    expect(container.querySelector('[data-slot="form-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="form-label"]')).toBeInTheDocument();
  });
});
