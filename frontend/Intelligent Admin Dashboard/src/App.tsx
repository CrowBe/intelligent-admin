import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { LandingPage } from './components/landing-page';
import { DashboardHeader } from './components/dashboard-header';
import { ChatInterface } from './components/chat-interface';
import { QuickActions } from './components/quick-actions';
import { IntegrationsGrid } from './components/integrations-grid';
import { ChatFab } from './components/chat-fab';
import { ContextualChatInterface } from './components/contextual-chat-interface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Puzzle, 
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

function Dashboard({ user, onLogout }: { 
  user: { firstName: string; lastName: string; email: string; businessName: string } | null;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Open by default on desktop
      } else {
        setSidebarOpen(false); // Closed by default on mobile
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [chatOpen, setChatOpen] = useState(false);
  const [sectionContext, setSectionContext] = useState<{ section: string; data: any } | null>(null);

  // Stats for the overview cards
  const stats = [
    {
      title: 'AI Assistant',
      value: 'Next Best Action',
      description: 'Follow up with Jennifer Davis - $15K opportunity',
      icon: <MessageCircle className="w-5 h-5 text-cyan-600" />,
      trend: 'Take Action',
      isAI: true
    },
    {
      title: 'Tasks Auto-Completed',
      value: '12',
      description: 'Emails, scheduling, follow-ups',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      trend: '8 pending'
    },
    {
      title: 'Business Insights',
      value: '4 new',
      description: 'Revenue and efficiency opportunities',
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      trend: 'View all'
    }
  ];

  const handleIntegrationConnect = (integrationId: string) => {
    console.log('Connecting to:', integrationId);
    // Here you would handle the actual integration connection
  };

  const handleChatAboutSection = (section: string, context: any) => {
    setSectionContext({ section, data: context });
    setChatOpen(true);
  };

  // Get contextual data based on current page
  const getPageContext = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          urgentEmails: 3,
          todayTasks: 3,
          activeLeads: 2
        };
      case 'integrations':
        return {
          connectedCount: 2,
          recommendedNext: 'QuickBooks'
        };
      case 'analytics':
        return {
          dataAvailable: false
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        userName={user ? `${user.firstName} ${user.lastName}` : "John Smith"}
        businessName={user?.businessName || "Smith Renovations"}
        onLogout={onLogout}
      />
      
      <div className="relative lg:flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Mobile-first responsive */}
        <nav className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen top-0 left-0 z-30 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 lg:p-6">
            <div className="space-y-2">
              <Button 
                variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('dashboard');
                  // Only close sidebar on mobile
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant={activeTab === 'integrations' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('integrations');
                  // Only close sidebar on mobile
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <Puzzle className="w-4 h-4 mr-2" />
                Integrations
              </Button>
              <Button 
                variant={activeTab === 'analytics' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('analytics');
                  // Only close sidebar on mobile
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
            

          </div>
        </nav>

        {/* Main Content - Mobile-first responsive */}
        <main className={`flex-1 p-4 lg:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          {activeTab === 'dashboard' && (
            <div className="space-y-4 lg:space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 lg:p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl lg:text-2xl mb-2">Good morning, John! 👋</h2>
                    <p className="text-slate-300 text-sm lg:text-base">Your AI assistant has processed 23 tasks overnight. Here's what needs your attention.</p>
                  </div>
                  <div className="hidden lg:block">
                    <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1670851050245-d861fd433d06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJ1c2luZXNzJTIwb2ZmaWNlJTIwd29ya3NwYWNlfGVufDF8fHx8MTc1NzM3ODM0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Business workspace"
                      className="w-20 lg:w-24 h-20 lg:h-24 rounded-lg object-cover opacity-80"
                    />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className={stat.isAI ? "bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/50 dark:to-teal-950/50 border-cyan-200 dark:border-cyan-800" : ""}>
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-center justify-between mb-3 lg:mb-4">
                        {stat.icon}
                        {stat.isAI ? (
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white text-xs"
                            onClick={() => {
                              setSectionContext({ section: 'leads', data: { 
                                hotLeads: [{ name: 'Jennifer Davis', company: 'Davis Property Group', value: '$15,000' }],
                                overdueCount: 1 
                              }});
                              setChatOpen(true);
                            }}
                          >
                            {stat.trend}
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {stat.trend}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl lg:text-2xl text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{stat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Dashboard Grid - Full Width */}
              <div className="w-full">
                <QuickActions onChatAbout={handleChatAboutSection} />
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4 lg:space-y-6">
              <div>
                <h2 className="text-xl lg:text-2xl text-slate-900 dark:text-white mb-2">Business Integrations</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm lg:text-base">
                  Connect your existing business tools to unlock AI-powered automation and insights.
                </p>
              </div>
              <IntegrationsGrid onIntegrationConnect={handleIntegrationConnect} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4 lg:space-y-6">
              <div>
                <h2 className="text-xl lg:text-2xl text-slate-900 dark:text-white mb-2">Business Analytics</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm lg:text-base">
                  Track your business performance and discover optimization opportunities.
                </p>
              </div>
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg text-slate-900 dark:text-white mb-2">Analytics Dashboard Coming Soon</h3>
                  <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    We're building comprehensive analytics to help you understand your business performance, 
                    track efficiency gains, and identify growth opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <ChatFab 
        onClick={() => {
          setSectionContext(null);
          setChatOpen(!chatOpen);
        }}
        isOpen={chatOpen}
        hasNewMessages={false}
      />

      {/* Contextual Chat Panel */}
      <ContextualChatInterface
        currentPage={activeTab}
        pageContext={getPageContext()}
        sectionContext={sectionContext}
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setSectionContext(null);
        }}
      />
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
  } | null>(null);

  // Check for existing authentication on load
  useEffect(() => {
    const savedUser = localStorage.getItem('intelligent-admin-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('intelligent-admin-user');
      }
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    // In a real app, this would authenticate with a backend
    // For now, we'll simulate successful login
    const userData = {
      firstName: 'John',
      lastName: 'Smith', 
      email: email,
      businessName: 'Smith Renovations'
    };
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('intelligent-admin-user', JSON.stringify(userData));
  };

  const handleSignUp = (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    businessName: string;
  }) => {
    // In a real app, this would create an account with a backend
    // For now, we'll simulate successful sign up
    const userInfo = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      businessName: userData.businessName
    };
    
    setUser(userInfo);
    setIsAuthenticated(true);
    localStorage.setItem('intelligent-admin-user', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('intelligent-admin-user');
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="intelligent-admin-theme">
      {isAuthenticated ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LandingPage onLogin={handleLogin} onSignUp={handleSignUp} />
      )}
    </ThemeProvider>
  );
}