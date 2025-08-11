import React from 'react';
import { OnboardingFlow } from './OnboardingFlow';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface Props {
  children: React.ReactNode;
  forceOnboarding?: boolean;
}

export const OnboardingGate: React.FC<Props> = ({ children, forceOnboarding = false }) => {
  const { needsOnboarding, loading, error, refreshStatus } = useOnboarding();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show onboarding flow if needed
  if (needsOnboarding || forceOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={refreshStatus}
        onSkip={refreshStatus}
      />
    );
  }

  // Show main app
  return <>{children}</>;
};

// Hook to manually trigger onboarding
export const useOnboardingTrigger = () => {
  const { resetOnboarding } = useOnboarding();

  const startOnboarding = async () => {
    await resetOnboarding();
    // The gate will automatically show onboarding flow
  };

  return { startOnboarding };
};