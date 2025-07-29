import { useAppAuth } from '../../contexts/KindeAuthContext';
import { useTheme } from '@/components/theme-provider';
import { Button, Logo, ModeToggle } from '@/components/ui';

export const Header = () => {
  const { isAuthenticated, user, logout, login } = useAppAuth();
  const { theme } = useTheme();

  return (
    <header className='bg-background border-b border-border sticky top-0 z-40'>
      <div className='container mx-auto px-4 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Logo size='xl' />

          {/* User Menu */}
          <div className='flex items-center gap-4'>
            {isAuthenticated ? (
              <div className='flex items-center gap-3'>
                {/* Theme Toggle */}
                <ModeToggle />
                {/* User Info */}
                <div className='hidden md:block text-right'>
                  <p className='text-sm font-medium text-foreground'>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className='text-xs text-muted-foreground'>{user?.email}</p>
                </div>

                {/* User Avatar */}
                <div className='w-8 h-8 bg-muted rounded-full flex items-center justify-center'>
                  {user?.picture ? (
                    <img src={user.picture} alt='Profile' className='w-8 h-8 rounded-full object-cover' />
                  ) : (
                    <span className='text-sm font-medium text-muted-foreground'>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </span>
                  )}
                </div>

                {/* Logout Button */}
                <Button variant='ghost' size='sm' onClick={() => logout()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className='relative flex items-center gap-2'>
                {/* Theme Toggle for non-authenticated users */}
                <ModeToggle />
                <Button variant='outline' size='sm' onClick={() => login()}>
                  Sign In
                </Button>
                <Button variant='default' size='sm' onClick={() => login()}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
