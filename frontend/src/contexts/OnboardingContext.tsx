import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface OnboardingProgress {
  step: string;
  completedAt?: Date;
  skipped: boolean;
  data?: any;
}

interface UserProfile {
  businessName: string;
  businessType: string;
  painPoints: string[];
  confidence: number;
  onboardingCompletedAt?: Date;
}

interface OnboardingContextType {
  // State
  needsOnboarding: boolean;
  isComplete: boolean;
  progress: OnboardingProgress[];
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  recordStep: (step: string, completed: boolean, data?: any) => Promise<boolean>;
  saveProfile: (profile: Omit<UserProfile, 'onboardingCompletedAt'>) => Promise<boolean>;
  resetOnboarding: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [needsOnboarding, setNeedsOnboarding] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState<OnboardingProgress[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check onboarding status on mount
  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check onboarding status
      const statusResponse = await fetch('/api/v1/onboarding/status', {
        credentials: 'include'
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check onboarding status');
      }

      const statusData = await statusResponse.json();
      setNeedsOnboarding(statusData.data.needsOnboarding);
      setIsComplete(statusData.data.isComplete);

      // Get progress details
      const progressResponse = await fetch('/api/v1/onboarding/progress', {
        credentials: 'include'
      });

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgress(progressData.data.progress);
      }

      // Get user profile if onboarding is complete
      if (statusData.data.isComplete) {
        const profileResponse = await fetch('/api/v1/onboarding/profile', {
          credentials: 'include'
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData.data);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load onboarding status';
      setError(errorMessage);
      console.error('Onboarding status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordStep = async (step: string, completed: boolean, data?: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/onboarding/step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          step,
          completed,
          data
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record onboarding step');
      }

      // Update local progress
      setProgress(prev => {
        const updated = prev.filter(p => p.step !== step);
        updated.push({
          step,
          completedAt: completed ? new Date() : undefined,
          skipped: !completed,
          data
        });
        return updated;
      });

      return true;
    } catch (err) {
      console.error('Failed to record step:', err);
      return false;
    }
  };

  const saveProfile = async (profile: Omit<UserProfile, 'onboardingCompletedAt'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/onboarding/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error('Failed to save user profile');
      }

      const responseData = await response.json();
      setUserProfile(responseData.data);
      setIsComplete(true);
      setNeedsOnboarding(false);

      return true;
    } catch (err) {
      console.error('Failed to save profile:', err);
      return false;
    }
  };

  const resetOnboarding = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/onboarding/reset', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to reset onboarding');
      }

      // Reset local state
      setNeedsOnboarding(true);
      setIsComplete(false);
      setProgress([]);
      setUserProfile(null);

      return true;
    } catch (err) {
      console.error('Failed to reset onboarding:', err);
      return false;
    }
  };

  const value: OnboardingContextType = {
    needsOnboarding,
    isComplete,
    progress,
    userProfile,
    loading,
    error,
    recordStep,
    saveProfile,
    resetOnboarding,
    refreshStatus
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Hook to check if a specific step is completed
export const useOnboardingStep = (stepName: string) => {
  const { progress } = useOnboarding();
  
  const step = progress.find(p => p.step === stepName);
  return {
    isCompleted: !!step?.completedAt && !step.skipped,
    isSkipped: step?.skipped || false,
    data: step?.data
  };
};

// Hook to get onboarding completion percentage
export const useOnboardingProgress = () => {
  const { progress } = useOnboarding();
  
  const totalSteps = 6; // welcome, pain-points, demo, gmail-setup, notifications, complete
  const completedSteps = progress.filter(p => p.completedAt && !p.skipped).length;
  const percentage = Math.round((completedSteps / totalSteps) * 100);
  
  return {
    completedSteps,
    totalSteps,
    percentage
  };
};