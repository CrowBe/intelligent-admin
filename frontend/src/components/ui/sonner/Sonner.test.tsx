import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from './Sonner';
import { ThemeProvider } from '@/components/theme-provider';

describe('Sonner', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <Toaster />
      </ThemeProvider>
    );
    expect(container.querySelector('.toaster')).toBeInTheDocument();
  });

  it('renders with theme provider', () => {
    const { container } = render(
      <ThemeProvider defaultTheme="dark">
        <Toaster />
      </ThemeProvider>
    );
    expect(container.querySelector('.toaster')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ThemeProvider>
        <Toaster />
      </ThemeProvider>
    );
    const toaster = container.querySelector('.toaster');
    expect(toaster).toBeInTheDocument();
  });
});
