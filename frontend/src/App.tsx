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
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        🔗 Connections
                      </h1>
                      <p className="text-gray-600 mb-8">
                        Manage your Gmail and other integrations here
                      </p>
                      <div className="text-sm text-gray-500">
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
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        ⚙️ Settings
                      </h1>
                      <p className="text-gray-600 mb-8">
                        Configure your preferences and account settings
                      </p>
                      <div className="text-sm text-gray-500">
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
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
            success: {
              style: {
                background: '#065f46',
                color: '#ecfdf5',
              },
            },
            error: {
              style: {
                background: '#991b1b',
                color: '#fef2f2',
              },
            },
          }}
        />
      </Router>
    </ChatProvider>
  );
}

export default App;