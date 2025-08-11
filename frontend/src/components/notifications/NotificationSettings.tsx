import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useFirebaseMessaging } from '../../hooks/useFirebaseMessaging';

interface NotificationPreferences {
  morningBriefEnabled: boolean;
  morningBriefTime: number;
  urgentEmailsEnabled: boolean;
  calendarAlertsEnabled: boolean;
  weekendNotifications: boolean;
}

export const NotificationSettings: React.FC = () => {
  const {
    isSupported,
    token,
    error,
    requestPermission,
    sendTokenToServer,
    getNotificationPreferences,
    updateNotificationPreferences,
    sendTestNotification,
  } = useFirebaseMessaging();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    morningBriefEnabled: true,
    morningBriefTime: 420, // 7:00 AM
    urgentEmailsEnabled: true,
    calendarAlertsEnabled: true,
    weekendNotifications: false,
  });

  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    // Check initial notification permission
    setHasPermission(Notification.permission === 'granted');
    
    // Load existing preferences
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await getNotificationPreferences();
    if (prefs) {
      setPreferences(prefs);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const fcmToken = await requestPermission();
      if (fcmToken) {
        await sendTokenToServer(fcmToken);
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Failed to enable notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean | number) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Update on server
    await updateNotificationPreferences({ [key]: value });
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    try {
      await sendTestNotification();
    } catch (err) {
      console.error('Failed to send test notification:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const parseTime = (timeString: string): number => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = (hours === 12 ? 0 : hours) * 60 + minutes;
    if (period === 'PM') totalMinutes += 12 * 60;
    return totalMinutes;
  };

  if (!isSupported) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
        <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg">
          <p>Push notifications are not supported in this browser or environment.</p>
          <p className="text-sm mt-2">
            Try using a modern browser like Chrome, Firefox, or Safari on a secure connection (HTTPS).
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
          <p className="text-gray-600 text-sm mb-4">
            Get notified about urgent emails, morning briefs, and important updates.
          </p>
        </div>

        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">Notification Permission</div>
            <div className="text-sm text-gray-600">
              {hasPermission ? (
                <span className="text-green-600">✅ Enabled</span>
              ) : (
                <span className="text-orange-600">❌ Disabled</span>
              )}
            </div>
            {token && (
              <div className="text-xs text-gray-500 mt-1">
                Token registered: {token.substring(0, 20)}...
              </div>
            )}
          </div>
          {!hasPermission && (
            <Button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          )}
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Notification Preferences */}
        {hasPermission && (
          <div className="space-y-4">
            <h4 className="font-medium">Notification Preferences</h4>

            {/* Morning Brief */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Morning Brief</div>
                <div className="text-sm text-gray-600">
                  Daily summary of urgent emails and calendar conflicts
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.morningBriefEnabled}
                  onChange={(e) => handlePreferenceChange('morningBriefEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Morning Brief Time */}
            {preferences.morningBriefEnabled && (
              <div className="ml-4 flex items-center space-x-3">
                <label className="text-sm font-medium">Time:</label>
                <select
                  value={preferences.morningBriefTime}
                  onChange={(e) => handlePreferenceChange('morningBriefTime', parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={390}>6:30 AM</option>
                  <option value={420}>7:00 AM</option>
                  <option value={450}>7:30 AM</option>
                  <option value={480}>8:00 AM</option>
                  <option value={510}>8:30 AM</option>
                </select>
              </div>
            )}

            {/* Urgent Emails */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Urgent Email Alerts</div>
                <div className="text-sm text-gray-600">
                  Immediate notifications for high-priority emails
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.urgentEmailsEnabled}
                  onChange={(e) => handlePreferenceChange('urgentEmailsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Calendar Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Calendar Alerts</div>
                <div className="text-sm text-gray-600">
                  Notifications for conflicts and scheduling issues
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.calendarAlertsEnabled}
                  onChange={(e) => handlePreferenceChange('calendarAlertsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Weekend Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekend Notifications</div>
                <div className="text-sm text-gray-600">
                  Receive notifications on weekends
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weekendNotifications}
                  onChange={(e) => handlePreferenceChange('weekendNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Test Notification */}
            <div className="border-t pt-4">
              <Button
                onClick={handleTestNotification}
                disabled={testLoading}
                variant="outline"
                className="w-full"
              >
                {testLoading ? 'Sending...' : '🧪 Send Test Notification'}
              </Button>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Privacy Note:</strong> Notifications are sent securely through Firebase Cloud Messaging. 
          We only send notifications you've explicitly enabled and never share your data.
        </div>
      </div>
    </Card>
  );
};