import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleCard } from './ScheduleCard';

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

describe('ScheduleCard', () => {
  it('renders schedule card with title', () => {
    render(<ScheduleCard />);
    expect(screen.getByText("Today's Schedule")).toBeInTheDocument();
  });

  it('displays the correct number of schedule items', () => {
    render(<ScheduleCard />);
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('renders all schedule items', () => {
    render(<ScheduleCard />);

    expect(screen.getByText('Site Inspection - Wilson Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Team Meeting - Weekly Check-in')).toBeInTheDocument();
    expect(screen.getByText('Quote Deadline - Henderson Bathroom')).toBeInTheDocument();
  });

  it('displays schedule item times', () => {
    render(<ScheduleCard />);

    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('2:00 PM')).toBeInTheDocument();
    expect(screen.getByText('5:00 PM')).toBeInTheDocument();
  });

  it('displays location when available', () => {
    render(<ScheduleCard />);

    expect(screen.getByText('123 Oak Street')).toBeInTheDocument();
  });

  it('does not display location when not available', () => {
    render(<ScheduleCard />);

    const teamMeetingItem = screen.getByText('Team Meeting - Weekly Check-in').closest('div');
    expect(teamMeetingItem).not.toHaveTextContent('123 Oak Street');
  });

  it('calls onChatAbout with schedule context when chat button clicked', async () => {
    const user = userEvent.setup();
    const onChatAbout = vi.fn();

    render(<ScheduleCard onChatAbout={onChatAbout} />);

    const chatButton = screen.getByRole('button', { name: /chat about this/i });
    await user.click(chatButton);

    expect(onChatAbout).toHaveBeenCalledWith({
      todayItems: expect.arrayContaining([
        expect.objectContaining({ id: '1', title: 'Site Inspection - Wilson Kitchen' }),
        expect.objectContaining({ id: '2', title: 'Team Meeting - Weekly Check-in' }),
        expect.objectContaining({ id: '3', title: 'Quote Deadline - Henderson Bathroom' }),
      ]),
      totalItems: 3,
      nextAppointment: expect.objectContaining({ id: '1', title: 'Site Inspection - Wilson Kitchen' }),
    });
  });

  it('renders view full calendar button', () => {
    render(<ScheduleCard />);

    expect(screen.getByRole('button', { name: /view full calendar/i })).toBeInTheDocument();
  });

  it('renders different icons for different schedule item types', () => {
    const { container } = render(<ScheduleCard />);

    // Check that icons are rendered (lucide-react icons have specific SVG structure)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
