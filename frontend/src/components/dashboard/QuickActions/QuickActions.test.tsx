import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickActions } from './QuickActions';

// Mock child components
vi.mock('./EmailSummaryCard', () => ({
  EmailSummaryCard: ({ onChatAbout }: { onChatAbout?: (context: unknown) => void }) => (
    <div data-testid="email-summary-card">
      <button onClick={() => onChatAbout?.({ highPriorityEmails: [], urgentCount: 2, totalEmails: 5 })}>
        Email Chat
      </button>
    </div>
  ),
}));

vi.mock('./ScheduleCard', () => ({
  ScheduleCard: ({ onChatAbout }: { onChatAbout?: (context: unknown) => void }) => (
    <div data-testid="schedule-card">
      <button onClick={() => onChatAbout?.({ todayItems: [], totalItems: 3 })}>
        Schedule Chat
      </button>
    </div>
  ),
}));

vi.mock('./LeadsCard', () => ({
  LeadsCard: ({ onChatAbout }: { onChatAbout?: (context: unknown) => void }) => (
    <div data-testid="leads-card">
      <button onClick={() => onChatAbout?.({ hotLeads: [], warmLeads: [], totalValue: 23500, overdueCount: 2 })}>
        Leads Chat
      </button>
    </div>
  ),
}));

describe('QuickActions', () => {
  it('renders all three card components', () => {
    render(<QuickActions />);

    expect(screen.getByTestId('email-summary-card')).toBeInTheDocument();
    expect(screen.getByTestId('schedule-card')).toBeInTheDocument();
    expect(screen.getByTestId('leads-card')).toBeInTheDocument();
  });

  it('calls onChatAbout with emails section context', async () => {
    const user = userEvent.setup();
    const onChatAbout = vi.fn();

    render(<QuickActions onChatAbout={onChatAbout} />);

    const emailChatButton = screen.getByRole('button', { name: /email chat/i });
    await user.click(emailChatButton);

    expect(onChatAbout).toHaveBeenCalledWith({
      section: 'emails',
      data: {
        highPriorityEmails: [],
        urgentCount: 2,
        totalEmails: 5,
      },
    });
  });

  it('calls onChatAbout with schedule section context', async () => {
    const user = userEvent.setup();
    const onChatAbout = vi.fn();

    render(<QuickActions onChatAbout={onChatAbout} />);

    const scheduleChatButton = screen.getByRole('button', { name: /schedule chat/i });
    await user.click(scheduleChatButton);

    expect(onChatAbout).toHaveBeenCalledWith({
      section: 'schedule',
      data: {
        todayItems: [],
        totalItems: 3,
      },
    });
  });

  it('calls onChatAbout with leads section context', async () => {
    const user = userEvent.setup();
    const onChatAbout = vi.fn();

    render(<QuickActions onChatAbout={onChatAbout} />);

    const leadsChatButton = screen.getByRole('button', { name: /leads chat/i });
    await user.click(leadsChatButton);

    expect(onChatAbout).toHaveBeenCalledWith({
      section: 'leads',
      data: {
        hotLeads: [],
        warmLeads: [],
        totalValue: 23500,
        overdueCount: 2,
      },
    });
  });

  it('renders without onChatAbout callback', () => {
    const { container } = render(<QuickActions />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with Accordion wrapper', () => {
    const { container } = render(<QuickActions />);

    // Check that Accordion is present by looking for the wrapper div
    const accordionWrapper = container.querySelector('.space-y-4');
    expect(accordionWrapper).toBeInTheDocument();
  });
});
