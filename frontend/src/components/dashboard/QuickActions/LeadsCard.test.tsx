import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadsCard } from './LeadsCard';

// Mock Accordion components
vi.mock('@/components/ui/accordion', () => ({
  AccordionItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`accordion-item-${value}`}>{children}</div>
  ),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="accordion-trigger">{children}</button>
  ),
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-content">{children}</div>
  ),
}));

describe('LeadsCard', () => {
  it('renders leads card with title', () => {
    render(<LeadsCard />);
    expect(screen.getByText('Lead Follow-ups')).toBeInTheDocument();
  });

  it('displays the correct number of hot and warm leads', () => {
    render(<LeadsCard />);
    expect(screen.getByText('1 Hot')).toBeInTheDocument();
    expect(screen.getByText('1 Warm')).toBeInTheDocument();
  });

  it('renders all lead items', () => {
    render(<LeadsCard />);

    expect(screen.getByText('Jennifer Davis')).toBeInTheDocument();
    expect(screen.getByText('Davis Property Group')).toBeInTheDocument();
    expect(screen.getByText('Robert Chen')).toBeInTheDocument();
    expect(screen.getByText('Chen Investments')).toBeInTheDocument();
  });

  it('displays lead values', () => {
    render(<LeadsCard />);

    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.getByText('$8,500')).toBeInTheDocument();
  });

  it('displays last contact information', () => {
    render(<LeadsCard />);

    expect(screen.getByText('Last contact: 3 days ago')).toBeInTheDocument();
    expect(screen.getByText('Last contact: 1 week ago')).toBeInTheDocument();
  });

  it('displays status badges with correct colors', () => {
    const { container } = render(<LeadsCard />);

    const badges = container.querySelectorAll('[class*="bg-red-100"]');
    expect(badges.length).toBeGreaterThan(0); // Hot lead badge
  });

  it('calls onChatAbout with leads context when chat button clicked', async () => {
    const user = userEvent.setup();
    const onChatAbout = vi.fn();

    render(<LeadsCard onChatAbout={onChatAbout} />);

    const chatButton = screen.getByRole('button', { name: /chat about this/i });
    await user.click(chatButton);

    expect(onChatAbout).toHaveBeenCalledWith({
      hotLeads: expect.arrayContaining([
        expect.objectContaining({ name: 'Jennifer Davis', status: 'hot' }),
      ]),
      warmLeads: expect.arrayContaining([
        expect.objectContaining({ name: 'Robert Chen', status: 'warm' }),
      ]),
      totalValue: 23500, // $15,000 + $8,500
      overdueCount: 2, // Both have '3 days ago' and '1 week ago'
    });
  });

  it('renders follow up buttons for each lead', () => {
    render(<LeadsCard />);

    const followUpButtons = screen.getAllByRole('button', { name: /follow up/i });
    expect(followUpButtons).toHaveLength(2);
  });

  it('renders view all leads button', () => {
    render(<LeadsCard />);

    expect(screen.getByRole('button', { name: /view all leads/i })).toBeInTheDocument();
  });

  it('renders status icons', () => {
    const { container } = render(<LeadsCard />);

    // Check that star icons are rendered for status badges
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
