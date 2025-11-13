import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Toaster } from './Sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { toast } from 'sonner';

describe('Sonner', () => {
  it('renders without crashing', async () => {
    render(
      <ThemeProvider>
        <Toaster />
      </ThemeProvider>
    );

    // Trigger a toast to ensure the portal is created
    toast('Test message');

    // Sonner uses portal rendering, query document directly
    // Wait for the toast container to appear in the DOM
    await waitFor(() => {
      const toastContainer = document.querySelector('[data-sonner-toaster]');
      expect(toastContainer).toBeInTheDocument();
    });
  });

  it('renders with theme provider', async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <Toaster />
      </ThemeProvider>
    );

    // Trigger a toast to ensure the portal is created
    toast('Test message');

    // Sonner uses portal rendering, query document directly
    // Wait for the toast container to appear in the DOM
    await waitFor(() => {
      const toastContainer = document.querySelector('[data-sonner-toaster]');
      expect(toastContainer).toBeInTheDocument();
      // Verify dark theme is applied (Sonner uses data-sonner-theme attribute)
      expect(toastContainer).toHaveAttribute('data-sonner-theme', 'dark');
    });
  });

  it('applies custom className', async () => {
    render(
      <ThemeProvider>
        <Toaster />
      </ThemeProvider>
    );

    // Trigger a toast to ensure the portal is created
    toast('Test message');

    // Sonner uses portal rendering, query document directly
    // Wait for the toast container to appear in the DOM
    await waitFor(() => {
      const toastContainer = document.querySelector('[data-sonner-toaster]');
      expect(toastContainer).toBeInTheDocument();
      // Verify the custom className from component is applied
      expect(toastContainer).toHaveClass('toaster', 'group');
    });
  });
});
