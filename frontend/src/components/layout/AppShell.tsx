import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  showNavigation = true, 
  className 
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header />
      
      <div className="flex-1 flex">
        {/* Navigation - Hidden on mobile, shown as bottom nav */}
        {showNavigation && (
          <>
            {/* Desktop Navigation - Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col">
              <Navigation variant="sidebar" />
            </div>
            
            {/* Mobile Navigation - Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
              <Navigation variant="bottomBar" />
            </div>
          </>
        )}
        
        {/* Main Content */}
        <main className={cn(
          'flex-1 min-w-0', // min-w-0 prevents flex overflow issues
          showNavigation && 'pb-16 lg:pb-0', // Bottom padding for mobile nav
          className
        )}>
          <div className="container mx-auto px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer - Hidden on mobile when navigation is shown */}
      {!showNavigation && <Footer />}
    </div>
  );
};