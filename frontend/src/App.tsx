import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { ChatProvider } from './contexts/ChatContext';

// Layout Components
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';

// Components
import { ChatInterface } from './components/chat/ChatInterface';
import { EmailIntelligenceDashboard } from './components/email/EmailIntelligenceDashboard';
import { IndustryKnowledgeDashboard } from './components/industry/IndustryKnowledgeDashboard';

// Auth
import { useAppAuth } from './contexts/KindeAuthContext';

// Auth Guard Component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main App Component
function App() {
  const { isAuthenticated } = useAppAuth();

  return (
    <ChatProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LandingPage />
                )
              } 
            />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <AppShell>
                    <DashboardPage />
                  </AppShell>
                </AuthGuard>
              }
            />
            
            <Route
              path="/chat"
              element={
                <AuthGuard>
                  <AppShell>
                    <ChatInterface />
                  </AppShell>
                </AuthGuard>
              }
            />
            
            <Route
              path="/emails"
              element={
                <AuthGuard>
                  <AppShell>
                    <EmailIntelligenceDashboard />
                  </AppShell>
                </AuthGuard>
              }
            />
            
            <Route
              path="/industry"
              element={
                <AuthGuard>
                  <AppShell>
                    <IndustryKnowledgeDashboard />
                  </AppShell>
                </AuthGuard>
              }
            />
            
            <Route
              path="/connections"
              element={
                <AuthGuard>
                  <AppShell>
                    <div className="text-center py-16">
                      <h1 className="text-2xl font-bold text-foreground mb-4">
                        🔗 Connections
                      </h1>
                      <p className="text-muted-foreground mb-8">
                        Manage your Gmail and other integrations here
                      </p>
                      <div className="text-sm text-muted-foreground/60">
                        Coming soon!
                      </div>
                    </div>
                  </AppShell>
                </AuthGuard>
              }
            />
            
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <AppShell>
                    <div className="text-center py-16">
                      <h1 className="text-2xl font-bold text-foreground mb-4">
                        ⚙️ Settings
                      </h1>
                      <p className="text-muted-foreground mb-8">
                        Configure your preferences and account settings
                      </p>
                      <div className="text-sm text-muted-foreground/60">
                        Coming soon!
                      </div>
                    </div>
                  </AppShell>
                </AuthGuard>
              }
            />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            className: '',
            style: {
              background: 'hsl(var(--color-background))',
              color: 'hsl(var(--color-foreground))',
              border: '1px solid hsl(var(--color-border))',
              padding: '12px 16px',
              marginBottom: '80px', // Space for mobile bottom nav
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--color-success))',
                secondary: 'hsl(var(--color-success-foreground))',
              },
              style: {
                background: 'hsl(var(--color-success))',
                color: 'hsl(var(--color-success-foreground))',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--color-destructive))',
                secondary: 'hsl(var(--color-destructive-foreground))',
              },
              style: {
                background: 'hsl(var(--color-destructive))',
                color: 'hsl(var(--color-destructive-foreground))',
              },
            },
          }}
        />
      </Router>
    </ChatProvider>
  );
}

export default App;