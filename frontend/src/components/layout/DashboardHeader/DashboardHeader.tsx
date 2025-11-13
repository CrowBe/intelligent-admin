import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAppAuth } from '@/contexts/KindeAuthContext';
import {
  Bell,
  Settings,
  User,
  Menu,
  Zap,
  LogOut,
} from 'lucide-react';

export interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuToggle,
  onSettingsClick,
  onNotificationsClick,
}) => {
  const { user, logout } = useAppAuth();

  // Derive display values from authenticated user
  const userName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const businessName = user?.businessName || 'Your Business';

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3">
            {/* AI Logo */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl text-slate-900 dark:text-white">
                Intelligent Admin
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {businessName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* AI Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-green-700 dark:text-green-400">
              AI Active
            </span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={onNotificationsClick}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              3
            </Badge>
          </Button>

          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-none hover:from-cyan-600 hover:to-teal-700"
          >
            <Zap className="w-4 h-4" />
            Quick Action
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm text-slate-900 dark:text-white">
                {userName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Business Owner
              </p>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
