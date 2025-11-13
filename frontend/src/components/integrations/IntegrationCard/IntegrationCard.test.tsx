import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mail } from 'lucide-react';
import { IntegrationCard } from './IntegrationCard';

describe('IntegrationCard', () => {
  const defaultProps = {
    title: 'Gmail',
    description: 'Email integration for seamless communication',
    icon: <Mail className="w-5 h-5" />,
    connected: false,
  };

  it('renders integration card with title and description', () => {
    render(<IntegrationCard {...defaultProps} />);

    expect(screen.getByText('Gmail')).toBeInTheDocument();
    expect(screen.getByText('Email integration for seamless communication')).toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = render(<IntegrationCard {...defaultProps} />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('shows connected badge when connected', () => {
    render(<IntegrationCard {...defaultProps} connected={true} />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows coming soon badge when comingSoon is true', () => {
    const { container } = render(<IntegrationCard {...defaultProps} comingSoon={true} />);

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Coming Soon');
  });

  it('renders benefits list when provided', () => {
    const benefits = [
      'Automatic email categorization',
      'Smart priority detection',
      'Real-time sync'
    ];

    render(<IntegrationCard {...defaultProps} benefits={benefits} />);

    expect(screen.getByText('Benefits:')).toBeInTheDocument();
    expect(screen.getByText('Automatic email categorization')).toBeInTheDocument();
    expect(screen.getByText('Smart priority detection')).toBeInTheDocument();
    expect(screen.getByText('Real-time sync')).toBeInTheDocument();
  });

  it('does not render benefits section when empty', () => {
    render(<IntegrationCard {...defaultProps} benefits={[]} />);

    expect(screen.queryByText('Benefits:')).not.toBeInTheDocument();
  });

  it('shows connect button when not connected', () => {
    render(<IntegrationCard {...defaultProps} connected={false} />);

    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
  });

  it('calls onConnect when connect button clicked', async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();

    render(<IntegrationCard {...defaultProps} onConnect={onConnect} />);

    const connectButton = screen.getByRole('button', { name: /connect/i });
    await user.click(connectButton);

    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('shows disconnect button when connected', () => {
    render(<IntegrationCard {...defaultProps} connected={true} />);

    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
  });

  it('calls onDisconnect when disconnect button clicked', async () => {
    const user = userEvent.setup();
    const onDisconnect = vi.fn();

    render(<IntegrationCard {...defaultProps} connected={true} onDisconnect={onDisconnect} />);

    const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
    await user.click(disconnectButton);

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('disables connect button when comingSoon is true', () => {
    render(<IntegrationCard {...defaultProps} comingSoon={true} />);

    const connectButton = screen.getByRole('button', { name: /coming soon/i });
    expect(connectButton).toBeDisabled();
  });

  it('shows "Coming Soon" text on button when comingSoon is true', () => {
    render(<IntegrationCard {...defaultProps} comingSoon={true} />);

    expect(screen.getByRole('button', { name: /coming soon/i })).toBeInTheDocument();
  });

  it('applies hover effect classes', () => {
    const { container } = render(<IntegrationCard {...defaultProps} />);

    const card = container.querySelector('.hover\\:shadow-lg');
    expect(card).toBeInTheDocument();
  });
});
