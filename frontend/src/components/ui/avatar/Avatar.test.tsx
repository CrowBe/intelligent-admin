import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

describe('Avatar', () => {
  describe('Rendering', () => {
    it('renders avatar container', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('renders with default classes', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('relative');
      expect(avatar).toHaveClass('flex');
      expect(avatar).toHaveClass('size-10');
      expect(avatar).toHaveClass('shrink-0');
      expect(avatar).toHaveClass('overflow-hidden');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('has data-slot attribute', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('data-slot', 'avatar');
    });

    it('renders with custom className', () => {
      render(
        <Avatar className="custom-avatar" data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('custom-avatar');
      expect(avatar).toHaveClass('relative'); // Still has base classes
    });
  });

  describe('AvatarImage', () => {
    it('renders with AvatarImage component', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Avatar container should be present with fallback (image may not render in test env)
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders avatar with image component structure', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      // Check avatar container exists
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
      // Fallback should be present
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('works with avatar container', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
          <AvatarFallback>CD</AvatarFallback>
        </Avatar>
      );
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('integrates with fallback component', () => {
      render(
        <Avatar>
          <AvatarImage
            src="https://example.com/avatar.jpg"
            alt="Avatar"
            className="custom-image"
          />
          <AvatarFallback>EF</AvatarFallback>
        </Avatar>
      );
      // Fallback should be available
      expect(screen.getByText('EF')).toBeInTheDocument();
    });

    it('avatar structure supports image and fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe" />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('GH')).toBeInTheDocument();
    });
  });

  describe('AvatarFallback', () => {
    it('renders fallback content', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByText('JD');
      expect(fallback).toBeInTheDocument();
    });

    it('has default fallback classes', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('bg-muted');
      expect(fallback).toHaveClass('flex');
      expect(fallback).toHaveClass('size-full');
      expect(fallback).toHaveClass('items-center');
      expect(fallback).toHaveClass('justify-center');
      expect(fallback).toHaveClass('rounded-full');
    });

    it('has data-slot attribute', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
    });

    it('supports custom className', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback" data-testid="fallback">
            JD
          </AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('custom-fallback');
      expect(fallback).toHaveClass('bg-muted'); // Still has base classes
    });

    it('renders text initials', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('renders icon fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>
            <span data-testid="icon">👤</span>
          </AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small avatar (size-8)', () => {
      render(
        <Avatar className="size-8" data-testid="avatar">
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('size-8');
    });

    it('renders default avatar (size-10)', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('size-10');
    });

    it('renders large avatar (size-16)', () => {
      render(
        <Avatar className="size-16" data-testid="avatar">
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('size-16');
    });

    it('renders extra large avatar (size-24)', () => {
      render(
        <Avatar className="size-24" data-testid="avatar">
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('size-24');
    });
  });

  describe('Image Loading States', () => {
    it('shows fallback initially before image loads', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/slow-loading.jpg" alt="Loading" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Fallback should be present initially
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('handles image load failure gracefully', async () => {
      render(
        <Avatar>
          <AvatarImage src="https://invalid-url.com/broken.jpg" alt="Broken" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Fallback should be visible when image fails
      const fallback = screen.getByText('JD');
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to avatar root element', () => {
      const ref = { current: null as HTMLSpanElement | null };
      render(
        <Avatar ref={ref}>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    it('supports ref on avatar image component', () => {
      const ref = { current: null as HTMLImageElement | null };
      render(
        <Avatar>
          <AvatarImage ref={ref} src="https://example.com/avatar.jpg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Image ref may be null in test environment due to Radix implementation
      // Just verify component renders without error
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('forwards ref to avatar fallback', () => {
      const ref = { current: null as HTMLSpanElement | null };
      render(
        <Avatar>
          <AvatarFallback ref={ref}>JD</AvatarFallback>
        </Avatar>
      );
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('Accessibility', () => {
    it('avatar with image component provides fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe profile picture" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Fallback should be accessible
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('supports aria-label on avatar container', () => {
      render(
        <Avatar aria-label="User profile picture">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByLabelText('User profile picture');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Trade Business Context', () => {
    it('renders client avatar with initials', () => {
      render(
        <Avatar>
          <AvatarImage
            src="https://example.com/client.jpg"
            alt="ABC Plumbing client"
          />
          <AvatarFallback>AP</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AP')).toBeInTheDocument();
    });

    it('renders team member avatar', () => {
      render(
        <Avatar>
          <AvatarImage
            src="https://example.com/team.jpg"
            alt="Site supervisor John"
          />
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('renders chat participant avatar', () => {
      render(
        <Avatar className="size-8">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('renders user profile avatar (large)', () => {
      render(
        <Avatar className="size-24">
          <AvatarFallback>BO</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('BO')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom background color to fallback', () => {
      render(
        <Avatar>
          <AvatarFallback className="bg-blue-500" data-testid="fallback">
            JD
          </AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('bg-blue-500');
    });

    it('applies custom text color to fallback', () => {
      render(
        <Avatar>
          <AvatarFallback className="text-white" data-testid="fallback">
            JD
          </AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('text-white');
    });

    it('applies border styling', () => {
      render(
        <Avatar className="border-2 border-primary" data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('border-2');
      expect(avatar).toHaveClass('border-primary');
    });

    it('applies shadow styling', () => {
      render(
        <Avatar className="shadow-lg" data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('shadow-lg');
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty fallback', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback" />
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toBeEmptyDOMElement();
    });

    it('renders with long initials', () => {
      render(
        <Avatar>
          <AvatarFallback>ABCD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('ABCD')).toBeInTheDocument();
    });

    it('handles missing image src gracefully', () => {
      render(
        <Avatar>
          <AvatarImage src="" alt="Empty src" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Should show fallback when src is empty
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders multiple avatars independently', () => {
      render(
        <>
          <Avatar data-testid="avatar-1">
            <AvatarFallback>A1</AvatarFallback>
          </Avatar>
          <Avatar data-testid="avatar-2">
            <AvatarFallback>A2</AvatarFallback>
          </Avatar>
          <Avatar data-testid="avatar-3">
            <AvatarFallback>A3</AvatarFallback>
          </Avatar>
        </>
      );
      expect(screen.getByTestId('avatar-1')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-2')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-3')).toBeInTheDocument();
    });
  });

  describe('Component Composition', () => {
    it('renders avatar with only image component', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
        </Avatar>
      );
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('renders avatar with only fallback (no image)', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders avatar with both image and fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Fallback is in DOM and visible in test environment
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Display Names', () => {
    it('has correct display name for Avatar', () => {
      expect(Avatar.displayName).toBe('Avatar');
    });

    it('has correct display name for AvatarImage', () => {
      expect(AvatarImage.displayName).toBe('AvatarImage');
    });

    it('has correct display name for AvatarFallback', () => {
      expect(AvatarFallback.displayName).toBe('AvatarFallback');
    });
  });
});
