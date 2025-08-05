import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationProps {
  variant: 'sidebar' | 'bottomBar';
}

const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: '🏠',
    description: 'Overview & insights'
  },
  { 
    name: 'Email Intelligence', 
    href: '/emails', 
    icon: '📧',
    description: 'AI email analysis'
  },
  { 
    name: 'Industry Knowledge', 
    href: '/industry', 
    icon: '📚',
    description: 'Trade regulations & standards'
  },
  { 
    name: 'Connections', 
    href: '/connections', 
    icon: '🔗',
    description: 'Manage integrations'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: '⚙️',
    description: 'Preferences & account'
  },
];

export const Navigation: React.FC<NavigationProps> = ({ variant }) => {
  const location = useLocation();

  if (variant === 'sidebar') {
    return (
      <nav className="flex-1 bg-background border-r border-border pt-6">
        <div className="px-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="mr-3 text-lg" role="img" aria-label={item.name}>
                  {item.icon}
                </span>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={cn(
                    'text-xs mt-0.5',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Help Section */}
        <div className="mt-8 px-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Need Help?
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get support for your AI assistant
            </p>
            <Link 
              to="/help"
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              View Guides →
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Bottom Bar for Mobile
  return (
    <nav className="bg-background/90 backdrop-blur-md border-t border-border px-4 py-2">
      <div className="flex justify-around">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center px-3 py-2 text-xs transition-colors min-w-0',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-lg mb-1" role="img" aria-label={item.name}>
                {item.icon}
              </span>
              <span className="font-medium truncate">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};