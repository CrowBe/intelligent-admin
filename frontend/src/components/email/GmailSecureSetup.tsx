import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGoogleGmailAuth } from '../../services/googleAuth';

interface SecurityFeatureProps {
  icon: string;
  title: string;
  description: string;
  isActive?: boolean;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({ icon, title, description, isActive = true }) => (
  <div className={`flex items-start space-x-3 p-3 rounded-lg ${isActive ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
    <div className="text-xl">{icon}</div>
    <div className="flex-1">
      <div className={`font-medium ${isActive ? 'text-green-800' : 'text-gray-700'}`}>
        {title}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        {description}
      </div>
      {isActive && (
        <div className="text-xs text-green-600 font-medium mt-1">
          ✓ Guaranteed
        </div>
      )}
    </div>
  </div>
);

interface Props {
  onComplete?: () => void;
  showMinimal?: boolean;
}

export const GmailSecureSetup: React.FC<Props> = ({ onComplete, showMinimal = false }) => {
  const {
    isGmailAuthenticated,
    isLoading,
    error,
    signInForGmail,
    signOutGmail
  } = useGoogleGmailAuth();

  const [showDetails, setShowDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleConnect = async () => {
    try {
      await signInForGmail();
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Gmail connection failed:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOutGmail();
    } catch (err) {
      console.error('Gmail disconnection failed:', err);
    }
  };

  if (showMinimal && isGmailAuthenticated) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="text-green-600">📧</div>
          <div>
            <div className="font-medium text-green-800">Gmail Connected</div>
            <div className="text-sm text-green-600">Securely monitoring your emails</div>
          </div>
        </div>
        <Button 
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? 'Disconnecting...' : 'Disconnect'}
        </Button>
      </div>
    );
  }

  if (isGmailAuthenticated) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">✅</div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Gmail Successfully Connected</h3>
              <p className="text-sm text-green-600">Your email is now being securely monitored for urgent messages</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">What happens next:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Morning Brief will include urgent emails (7:00-7:30 AM)</li>
              <li>• High-priority emails trigger immediate notifications</li>
              <li>• AI drafts professional responses for your review</li>
              <li>• You always approve before anything is sent</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={onComplete} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Continue Setup
            </Button>
            <Button 
              onClick={handleDisconnect}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect Gmail'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Your Gmail Securely
          </h2>
          <p className="text-gray-600">
            Let me help you stay on top of urgent emails while keeping you in complete control
          </p>
        </div>

        {/* Security Assurance */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🛡️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your Email Security is Our Priority</h3>
              <p className="text-sm text-blue-800">
                I understand connecting your email feels risky. Here's exactly what happens and what doesn't:
              </p>
            </div>
          </div>
        </div>

        {/* What I Do */}
        <div className="grid gap-3">
          <h4 className="font-semibold text-green-800 mb-2">✅ What I Do (With Your Permission)</h4>
          <SecurityFeature
            icon="👀"
            title="Read Your Emails"
            description="I scan for urgent keywords like 'emergency', 'power out', 'urgent' to prioritize important messages"
          />
          <SecurityFeature
            icon="📝"
            title="Draft Professional Responses"
            description="I create professional email drafts for your review - nothing gets sent without your approval"
          />
          <SecurityFeature
            icon="📊"
            title="Morning Brief Creation"
            description="I summarize overnight emails by priority so you can tackle urgent issues first"
          />
          <SecurityFeature
            icon="🔔"
            title="Smart Notifications"
            description="I only notify you about genuinely urgent emails during business hours"
          />
        </div>

        {/* What I Don't Do */}
        <div className="grid gap-3">
          <h4 className="font-semibold text-red-800 mb-2">❌ What I Never Do</h4>
          <SecurityFeature
            icon="📤"
            title="Send Emails Automatically"
            description="I create drafts only - you always review and send manually"
            isActive={false}
          />
          <SecurityFeature
            icon="💾"
            title="Store Your Email Content"
            description="I analyze emails in real-time but don't permanently store your messages"
            isActive={false}
          />
          <SecurityFeature
            icon="👥"
            title="Share Your Data"
            description="Your emails stay private - no sharing with third parties, ever"
            isActive={false}
          />
          <SecurityFeature
            icon="🔓"
            title="Access Without Permission"
            description="You can disconnect Gmail anytime and I lose all access immediately"
            isActive={false}
          />
        </div>

        {/* Google's Security */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-xl">🔒</div>
            <div>
              <h4 className="font-medium text-gray-800">Powered by Google's Security</h4>
              <p className="text-sm text-gray-600 mt-1">
                This connection uses Google's official OAuth system - the same security banks use. 
                I only get the permissions you explicitly grant, and you can revoke access anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Connection Steps */}
        {showDetails && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">What Happens When You Click Connect:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'font-medium' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center">1</span>
                <span>Google opens a secure popup asking for your permission</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'font-medium' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center">2</span>
                <span>You can review exactly what access I'm requesting</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'font-medium' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center">3</span>
                <span>You choose to allow or deny - your choice is final</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 4 ? 'font-medium' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center">4</span>
                <span>If approved, I can start helping with your email workflow</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-red-500">⚠️</div>
              <div>
                <div className="font-medium text-red-800">Connection Failed</div>
                <div className="text-sm text-red-600 mt-1">{error}</div>
                <div className="text-xs text-red-500 mt-2">
                  This is usually due to popup blockers or canceling the Google authorization.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!showDetails && (
            <Button
              onClick={() => setShowDetails(true)}
              variant="outline"
              className="w-full"
            >
              Show Me How This Works Step-by-Step
            </Button>
          )}
          
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Connecting Securely...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>🔒</span>
                <span>Connect Gmail Securely</span>
              </div>
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={() => onComplete?.()}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now (I can set this up later)
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>🇦🇺</span>
              <span>Australian Privacy Act Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🔒</span>
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>✅</span>
              <span>Google Verified</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};