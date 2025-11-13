// useEmailAnalysis Hook
// Provides email intelligence data with loading and error states

import { useState, useEffect, useCallback } from 'react';
import { emailService, type EmailSummary } from '../services/emailService';

export interface UseEmailAnalysisReturn {
  emails: EmailSummary[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  urgentCount: number;
  highPriorityCount: number;
}

export function useEmailAnalysis(limit = 20): UseEmailAnalysisReturn {
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emailService.fetchEmailAnalysis(limit);
      setEmails(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch emails'));
      console.error('Error fetching email analysis:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refresh = useCallback(async () => {
    await fetchEmails();
  }, [fetchEmails]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Calculate summary stats
  const urgentCount = emails.filter(
    email => email.urgency === 'high' || email.analysis?.priority === 'urgent'
  ).length;

  const highPriorityCount = emails.filter(
    email => email.analysis?.priority === 'high' || email.analysis?.priority === 'urgent'
  ).length;

  return {
    emails,
    loading,
    error,
    refresh,
    urgentCount,
    highPriorityCount
  };
}
