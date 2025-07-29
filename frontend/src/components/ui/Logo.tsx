import { cn } from '@/lib/utils';
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md', variant = 'default', showText = true }) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  // Use the preferred logo (-1 version)
  const logoSrc = variant === 'default' ? '/intelligent-admin-logo-1.png' : '/intelligent-admin-logo-2.png';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img src={logoSrc} alt='Intelligent Admin' className={cn(sizeClasses[size], 'object-contain max-h-16')} />
      {showText && (
        <div className='hidden sm:block'>
          <h1 className={cn('font-bold text-foreground leading-tight', textSizeClasses[size])}>Intelligent Admin</h1>
          <p
            className={cn(
              'text-muted-foreground leading-tight',
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-base'
            )}
          >
            AI Assistant for Trade Businesses
          </p>
        </div>
      )}
    </div>
  );
};
