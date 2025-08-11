import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useOnboarding } from '../../contexts/OnboardingContext'; import { useOnboardingTrigger } from '../onboarding/OnboardingGate';
import { useGoogleGmailAuth } from '../../services/googleAuth';
import { useFirebaseMessaging } from '../../hooks/useFirebaseMessaging';

export const WelcomeDashboard: React.FC = () => {
  const { userProfile, isComplete } = useOnboarding();
  const { startOnboarding } = useOnboardingTrigger();
  const { isGmailAuthenticated } = useGoogleGmailAuth();
  const { token: notificationToken, sendTestNotification } = useFirebaseMessaging();
  
  const [testingNotification, setTestingNotification] = useState(false);

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      await sendTestNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    } finally {
      setTestingNotification(false);
    }
  };

  if (!isComplete || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-xl font-semibold mb-4">Welcome to Intelligent Admin!</h2>
          <p className="text-gray-600 mb-6">
            Let's get you set up with your AI admin assistant. This will only take a few minutes.
          </p>
          <Button 
            onClick={startOnboarding}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  const getNextSteps = () => {
    const steps = [];
    
    if (!isGmailAuthenticated) {
      steps.push({
        icon: '📧',
        title: 'Connect Gmail',
        description: 'Enable email monitoring and urgent alerts',
        action: 'Connect Gmail',
        urgent: true
      });
    }
    
    if (!notificationToken) {
      steps.push({
        icon: '🔔',
        title: 'Enable Notifications',
        description: 'Get Morning Brief delivered at 7:00 AM',
        action: 'Enable Notifications',
        urgent: false
      });
    }

    if (steps.length === 0) {
      steps.push({
        icon: '💬',
        title: 'Start Chatting',
        description: 'Ask me to help with quotes, emails, or scheduling',
        action: 'Open Chat',
        urgent: false
      });
    }

    return steps;
  };

  const nextSteps = getNextSteps();
  const setupComplete = isGmailAuthenticated && notificationToken;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">👋</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {userProfile.businessName}!
              </h1>
              <p className="text-gray-600">
                Your AI admin assistant is ready to help with {userProfile.businessType} business tasks.
              </p>
            </div>
            {setupComplete && (
              <div className="text-green-600">
                <div className="text-2xl">✅</div>
                <div className="text-sm font-medium">Setup Complete</div>
              </div>
            )}
          </div>
        </Card>

        {/* Setup Progress */}
        {!setupComplete && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Finish Your Setup</h2>
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    step.urgent 
                      ? 'border-orange-200 bg-orange-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  <Button
                    onClick={() => {
                      if (step.title === 'Connect Gmail') {
                        // Trigger Gmail setup
                        startOnboarding();
                      } else if (step.title === 'Enable Notifications') {
                        // Trigger notification setup
                        startOnboarding();
                      }
                    }}
                    className={step.urgent ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    {step.action}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Current Status */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className={`text-2xl ${isGmailAuthenticated ? 'text-green-600' : 'text-gray-400'}`}>
                📧
              </div>
              <div>
                <h3 className="font-medium">Gmail Integration</h3>
                <p className="text-sm text-gray-600">
                  {isGmailAuthenticated ? 'Connected & monitoring' : 'Not connected'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className={`text-2xl ${notificationToken ? 'text-green-600' : 'text-gray-400'}`}>
                🔔
              </div>
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-600">
                  {notificationToken ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl text-blue-600">🎯</div>
              <div>
                <h3 className="font-medium">Focus Areas</h3>
                <p className="text-sm text-gray-600">
                  {userProfile.painPoints.length} priority areas
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Your Focus Areas */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">I'm helping you with these priority areas:</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {userProfile.painPoints.map((painPoint, index) => {
              const painPointLabels: Record<string, { label: string; icon: string }> = {
                'emails': { label: 'Email management and prioritization', icon: '📧' },
                'quotes': { label: 'Creating quotes and estimates', icon: '💰' },
                'followup': { label: 'Customer follow-up reminders', icon: '📞' },
                'scheduling': { label: 'Scheduling and calendar management', icon: '📅' },
                'paperwork': { label: 'Compliance and documentation', icon: '📋' },
                'invoicing': { label: 'Invoicing and payment tracking', icon: '💳' },
                'priorities': { label: 'Daily task prioritization', icon: '⚡' },
                'communication': { label: 'Professional communication', icon: '✍️' }
              };

              const painPointData = painPointLabels[painPoint] || { 
                label: painPoint, 
                icon: '🔧' 
              };

              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-xl">{painPointData.icon}</span>
                  <span className="text-blue-900">{painPointData.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-xl">💬</span>
              <span className="text-sm">Start Chat</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={handleTestNotification}
              disabled={!notificationToken || testingNotification}
            >
              <span className="text-xl">🧪</span>
              <span className="text-sm">
                {testingNotification ? 'Sending...' : 'Test Notification'}
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-xl">📋</span>
              <span className="text-sm">View Documents</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={startOnboarding}
            >
              <span className="text-xl">⚙️</span>
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </Card>

        {/* Pro Tips */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">💡 Pro Tips for {userProfile.businessType} businesses:</h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Upload photos of compliance certificates for automatic data extraction</p>
            <p>• Forward customer emails to me for quick quote generation</p>
            <p>• Ask me about Australian electrical standards and ESV regulations</p>
            <p>• Use voice commands on mobile for hands-free task management</p>
          </div>
        </Card>
      </div>
    </div>
  );
};