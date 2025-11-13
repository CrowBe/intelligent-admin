import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from './DashboardHeader';
import type { AppUser } from '@/contexts/KindeAuthContext';

// Mock the auth context
const mockLogout = vi.fn();
const mockUseAppAuth = vi.fn();

vi.mock('@/contexts/KindeAuthContext', () => ({
  useAppAuth: () => mockUseAppAuth(),
}));

// Mock ThemeToggle component
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

describe('DashboardHeader', () => {
  const mockUser: AppUser = {
    id: '123',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Smith',
    fullName: 'John Smith',
    picture: 'https://example.com/avatar.jpg',
    businessName: 'Smith Renovations',
    businessType: 'renovation',
    preferences: {
      notifications: { email: true, push: false, sms: false },
      ai: { personality: 'professional', proactiveMode: true, autoSuggestions: true },
      integrations: { autoConnect: false },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isAuthenticated: true,
      isLoading: false,
    });
  });

  describe('Rendering', () => {
    it('should render header with user information', () => {
      render(<DashboardHeader />);

      expect(screen.getByText('Intelligent Admin')).toBeInTheDocument();
      expect(screen.getByText('Smith Renovations')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Business Owner')).toBeInTheDocument();
    });

    it('should render AI status indicator', () => {
      render(<DashboardHeader />);

      expect(screen.getByText('AI Active')).toBeInTheDocument();
    });

    it('should render notification badge with count', () => {
      render(<DashboardHeader />);

      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });

    it('should render theme toggle', () => {
      render(<DashboardHeader />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render user avatar image when picture is available', () => {
      render(<DashboardHeader />);

      const avatar = screen.getByAltText('John Smith');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', mockUser.picture);
    });

    it('should render default user icon when no picture is available', () => {
      mockUseAppAuth.mockReturnValue({
        user: { ...mockUser, picture: undefined },
        logout: mockLogout,
        isAuthenticated: true,
        isLoading: false,
      });

      const { container } = render(<DashboardHeader />);

      // Should have User icon instead of img
      const userIcon = container.querySelector('svg[class*="lucide-user"]');
      expect(userIcon).toBeInTheDocument();
    });

    it('should use fallback values when user data is minimal', () => {
      mockUseAppAuth.mockReturnValue({
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: '',
          lastName: '',
          fullName: '',
          preferences: mockUser.preferences,
        },
        logout: mockLogout,
        isAuthenticated: true,
        isLoading: false,
      });

      render(<DashboardHeader />);

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Your Business')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onMenuToggle when menu button is clicked', () => {
      const onMenuToggle = vi.fn();
      render(<DashboardHeader onMenuToggle={onMenuToggle} />);

      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);

      expect(onMenuToggle).toHaveBeenCalledTimes(1);
    });

    it('should call logout when logout button is clicked', () => {
      render(<DashboardHeader />);

      const logoutButton = screen.getByLabelText('Sign out');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should call onSettingsClick when settings button is clicked', () => {
      const onSettingsClick = vi.fn();
      render(<DashboardHeader onSettingsClick={onSettingsClick} />);

      const settingsButton = screen.getByLabelText('Settings');
      fireEvent.click(settingsButton);

      expect(onSettingsClick).toHaveBeenCalledTimes(1);
    });

    it('should call onNotificationsClick when notifications button is clicked', () => {
      const onNotificationsClick = vi.fn();
      render(<DashboardHeader onNotificationsClick={onNotificationsClick} />);

      const notificationsButton = screen.getByLabelText('Notifications');
      fireEvent.click(notificationsButton);

      expect(onNotificationsClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for icon buttons', () => {
      render(<DashboardHeader />);

      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Sign out')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<DashboardHeader />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Intelligent Admin');
    });
  });

  describe('Responsive Behavior', () => {
    it('should show menu toggle button on mobile (via lg:hidden class)', () => {
      render(<DashboardHeader />);

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toHaveClass('lg:hidden');
    });

    it('should hide AI status on mobile (via hidden sm:flex class)', () => {
      const { container } = render(<DashboardHeader />);

      const aiStatus = screen.getByText('AI Active').parentElement;
      expect(aiStatus).toHaveClass('hidden', 'sm:flex');
    });

    it('should hide quick action button on mobile (via hidden sm:flex class)', () => {
      render(<DashboardHeader />);

      const quickActionButton = screen.getByText('Quick Action').closest('button');
      expect(quickActionButton).toHaveClass('hidden', 'sm:flex');
    });

    it('should hide user details on mobile (via hidden sm:block class)', () => {
      render(<DashboardHeader />);

      const userDetails = screen.getByText('John Smith').parentElement;
      expect(userDetails).toHaveClass('hidden', 'sm:block');
    });
  });
});
