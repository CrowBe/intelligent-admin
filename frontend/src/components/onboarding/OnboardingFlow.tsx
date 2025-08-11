import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GmailSecureSetup } from '../email/GmailSecureSetup';
import { NotificationSettings } from '../notifications/NotificationSettings';
import { useGoogleGmailAuth } from '../../services/googleAuth';
import { useFirebaseMessaging } from '../../hooks/useFirebaseMessaging';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  canSkip: boolean;
  isComplete: (props: any) => boolean;
}

interface Props {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingFlow: React.FC<Props> = ({ onComplete, onSkip }) => {
  const { isGmailAuthenticated } = useGoogleGmailAuth();
  const { token: notificationToken, isSupported: notificationSupported } = useFirebaseMessaging();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState({
    businessName: '',
    businessType: 'electrical',
    painPoints: [] as string[],
    confidence: 1 // 1-5 scale
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your AI Admin Assistant',
      description: 'Let me understand your business needs first',
      component: WelcomeStep,
      canSkip: false,
      isComplete: (props) => props.userProfile.businessName.length > 0
    },
    {
      id: 'pain-points',
      title: 'What admin tasks stress you out most?',
      description: 'This helps me prioritize what to help with first',
      component: PainPointsStep,
      canSkip: false,
      isComplete: (props) => props.userProfile.painPoints.length > 0
    },
    {
      id: 'demo',
      title: 'Let me show you how I can help',
      description: 'See how I analyze and prioritize your work',
      component: DemoStep,
      canSkip: true,
      isComplete: () => true
    },
    {
      id: 'gmail-setup',
      title: 'Connect Your Gmail (Securely)',
      description: 'I\'ll help prioritize urgent emails and draft responses',
      component: GmailSetupStep,
      canSkip: true,
      isComplete: () => isGmailAuthenticated
    },
    {
      id: 'notifications',
      title: 'Morning Brief Setup',
      description: 'Get a daily summary of urgent items (7:00-7:30 AM)',
      component: NotificationSetupStep,
      canSkip: true,
      isComplete: () => !!notificationToken && notificationSupported
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Start chatting with your AI admin assistant',
      component: CompletionStep,
      canSkip: false,
      isComplete: () => true
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStepData.isComplete({ userProfile, isGmailAuthenticated, notificationToken });

  const handleNext = () => {
    if (canProceed) {
      setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
      
      if (isLastStep) {
        // Store onboarding completion
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('user_profile', JSON.stringify(userProfile));
        onComplete();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleSkip = () => {
    if (currentStepData.canSkip) {
      if (isLastStep) {
        localStorage.setItem('onboarding_completed', 'true');
        onComplete();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateUserProfile = (updates: Partial<typeof userProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          {/* Render Current Step Component */}
          <currentStepData.component
            userProfile={userProfile}
            updateUserProfile={updateUserProfile}
            onNext={handleNext}
            onSkip={handleSkip}
            canProceed={canProceed}
          />

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentStep === 0}
            >
              ← Back
            </Button>

            <div className="flex space-x-3">
              {currentStepData.canSkip && !isLastStep && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="text-gray-500"
                >
                  Skip for now
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className={canProceed ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {isLastStep ? 'Start Using Assistant' : 'Continue →'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>🇦🇺</span>
              <span>Australian Privacy Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🔒</span>
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🛡️</span>
              <span>You Stay in Control</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components

const WelcomeStep: React.FC<any> = ({ userProfile, updateUserProfile, onNext }) => {
  const [businessName, setBusinessName] = useState(userProfile.businessName || '');
  const [businessType, setBusinessType] = useState(userProfile.businessType || 'electrical');

  const handleSubmit = () => {
    updateUserProfile({ businessName, businessType });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">👋</div>
        <p className="text-gray-600">
          I'm here to help you spend less time on admin and more time on the work you love.
          Let me get to know your business first.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your business name?
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g., Dave Thompson Electrical"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What type of trade business?
          </label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="hvac">HVAC</option>
            <option value="carpentry">Carpentry</option>
            <option value="painting">Painting</option>
            <option value="general">General Contracting</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">💡</div>
          <div className="text-sm text-blue-800">
            <strong>Why I ask:</strong> Knowing your trade helps me understand industry-specific 
            regulations, pricing, and the types of emails and tasks you deal with daily.
          </div>
        </div>
      </div>
    </div>
  );
};

const PainPointsStep: React.FC<any> = ({ userProfile, updateUserProfile }) => {
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>(userProfile.painPoints || []);

  const painPoints = [
    { id: 'emails', label: 'Too many emails to keep track of', icon: '📧' },
    { id: 'quotes', label: 'Slow at creating quotes and estimates', icon: '💰' },
    { id: 'followup', label: 'Forgetting to follow up with customers', icon: '📞' },
    { id: 'scheduling', label: 'Double-booking and scheduling conflicts', icon: '📅' },
    { id: 'paperwork', label: 'Compliance certificates and paperwork', icon: '📋' },
    { id: 'invoicing', label: 'Chasing payments and invoicing', icon: '💳' },
    { id: 'priorities', label: 'Not sure what to tackle first each day', icon: '⚡' },
    { id: 'communication', label: 'Writing professional emails and messages', icon: '✍️' }
  ];

  const togglePainPoint = (painPoint: string) => {
    const updated = selectedPainPoints.includes(painPoint)
      ? selectedPainPoints.filter(p => p !== painPoint)
      : [...selectedPainPoints, painPoint];
    
    setSelectedPainPoints(updated);
    updateUserProfile({ painPoints: updated });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">
        Select all that apply - I'll prioritize helping with these first:
      </p>

      <div className="grid gap-3">
        {painPoints.map((painPoint) => (
          <button
            key={painPoint.id}
            onClick={() => togglePainPoint(painPoint.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedPainPoints.includes(painPoint.id)
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{painPoint.icon}</span>
              <span className="font-medium">{painPoint.label}</span>
              {selectedPainPoints.includes(painPoint.id) && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedPainPoints.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-green-600">🎯</div>
            <div className="text-sm text-green-800">
              <strong>Perfect!</strong> I'll focus on helping you with{' '}
              <strong>{selectedPainPoints.length}</strong> key area{selectedPainPoints.length !== 1 ? 's' : ''}.
              You can always add more later.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DemoStep: React.FC<any> = ({ userProfile }) => {
  const [demoStage, setDemoStage] = useState(0);

  const demoStages = [
    {
      title: "Here's how I'd help with your emails",
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-start space-x-3">
              <span className="text-red-600">🔴</span>
              <div>
                <div className="font-medium text-red-800">URGENT: Power outage at Westfield</div>
                <div className="text-sm text-red-600">From: facilities@westfield.com.au</div>
                <div className="text-sm text-red-700 mt-1">
                  "Our food court has been without power for 2 hours. Need emergency electrician ASAP."
                </div>
                <div className="text-xs text-red-600 mt-2 font-medium">
                  → I'd notify you immediately and suggest emergency rates
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600">🟡</span>
              <div>
                <div className="font-medium text-yellow-800">Quote follow-up - Johnson Family</div>
                <div className="text-sm text-yellow-600">From: sarah.johnson@gmail.com</div>
                <div className="text-sm text-yellow-700 mt-1">
                  "Hi Dave, just checking on the quote for our kitchen renovation wiring..."
                </div>
                <div className="text-xs text-yellow-600 mt-2 font-medium">
                  → I'd draft a professional follow-up response for your review
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex items-start space-x-3">
              <span className="text-green-600">🟢</span>
              <div>
                <div className="font-medium text-green-800">Compliance certificate reminder</div>
                <div className="text-sm text-green-600">From: esv@energysafe.vic.gov.au</div>
                <div className="text-sm text-green-700 mt-1">
                  "Annual compliance reporting due in 30 days..."
                </div>
                <div className="text-xs text-green-600 mt-2 font-medium">
                  → I'd add this to your task list with a reminder
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your personalized Morning Brief would look like this:",
      content: (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-blue-900">📱 Good Morning, {userProfile.businessName}!</h3>
            <p className="text-sm text-blue-600">Tuesday, Dec 5 • 7:15 AM</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🔴 2 Urgent Issues</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Westfield food court power outage</li>
                <li>• Jim's Auto - electrical fault affecting workshop</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📅 Today's Schedule</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 9:00 AM - Mrs. Chen (residential rewiring)</li>
                <li>• 2:00 PM - ABC Company (compliance inspection)</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">💰 Follow-ups Worth $3,200</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Johnson family kitchen quote (Day 4 - send reminder)</li>
                <li>• Smith office renovation (Day 7 - call recommended)</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              Tap to handle urgent issues first
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600">
          Based on your business type ({userProfile.businessType}) and pain points, 
          here's how I'd help you every day:
        </p>
      </div>

      {demoStages[demoStage].content}

      <div className="flex justify-center space-x-3">
        {demoStages.map((_, index) => (
          <button
            key={index}
            onClick={() => setDemoStage(index)}
            className={`w-3 h-3 rounded-full ${
              index === demoStage ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-green-600 text-lg mb-2">✨</div>
        <p className="text-sm text-green-800">
          <strong>This isn't magic -</strong> I analyze patterns in your emails and calendar 
          to surface what needs your attention first, just like having a smart admin assistant.
        </p>
      </div>
    </div>
  );
};

const GmailSetupStep: React.FC<any> = ({ onNext }) => {
  return (
    <GmailSecureSetup 
      onComplete={onNext}
      showMinimal={false}
    />
  );
};

const NotificationSetupStep: React.FC<any> = ({ onNext }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">🌅</div>
        <p className="text-gray-600">
          Get your Morning Brief delivered as a push notification when you need it most.
        </p>
      </div>
      
      <NotificationSettings />
      
      <div className="text-center">
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
          Continue to Final Step
        </Button>
      </div>
    </div>
  );
};

const CompletionStep: React.FC<any> = ({ userProfile }) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🎉</div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome to your new admin assistant, {userProfile.businessName}!
        </h3>
        <p className="text-gray-600">
          You're all set up and ready to start saving time on admin tasks.
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">What happens next:</h4>
        <div className="text-sm text-blue-800 space-y-2 text-left">
          <div className="flex items-start space-x-3">
            <span>📧</span>
            <span>I'll start monitoring your emails for urgent issues</span>
          </div>
          <div className="flex items-start space-x-3">
            <span>🌅</span>
            <span>Tomorrow morning you'll get your first Morning Brief</span>
          </div>
          <div className="flex items-start space-x-3">
            <span>💬</span>
            <span>Start chatting - ask me to help with quotes, follow-ups, or scheduling</span>
          </div>
          <div className="flex items-start space-x-3">
            <span>🎯</span>
            <span>I'll focus on your selected pain points: {userProfile.painPoints.length} areas</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs text-gray-500">
          Remember: You're always in control. I create drafts for your review and you decide what gets sent.
        </p>
      </div>
    </div>
  );
};