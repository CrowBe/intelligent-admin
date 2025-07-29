import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'urgent' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';
    
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      urgent: 'bg-red-100 text-red-800 border border-red-200',
      high: 'bg-orange-100 text-orange-800 border border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      low: 'bg-gray-100 text-gray-600 border border-gray-200',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-amber-100 text-amber-800 border border-amber-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };