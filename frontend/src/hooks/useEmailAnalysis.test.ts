// useEmailAnalysis Hook Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEmailAnalysis } from './useEmailAnalysis';
import { emailService } from '../services/emailService';
import type { EmailSummary } from '../services/emailService';

vi.mock('../services/emailService', () => ({
  emailService: {
    fetchEmailAnalysis: vi.fn()
  }
}));

describe('useEmailAnalysis', () => {
  const mockEmails: EmailSummary[] = [
    {
      id: '1',
      from: 'client@example.com',
      subject: 'Urgent: Leak in bathroom',
      urgency: 'high',
      preview: 'We have an urgent leak...',
      timestamp: new Date().toISOString(),
      analysis: {
        priority: 'urgent',
        category: 'urgent',
        urgencyScore: 95,
        businessRelevance: 90,
        actionRequired: true,
        estimatedReadTime: 2,
        keywords: ['urgent', 'leak'],
        sentiment: 'negative',
        suggestedActions: ['Respond immediately', 'Call if necessary'],
        reasoning: 'High urgency due to emergency keywords'
      }
    },
    {
      id: '2',
      from: 'supplier@example.com',
      subject: 'Quote for materials',
      urgency: 'medium',
      preview: 'Please find attached...',
      timestamp: new Date().toISOString(),
      analysis: {
        priority: 'medium',
        category: 'standard',
        urgencyScore: 40,
        businessRelevance: 75,
        actionRequired: false,
        estimatedReadTime: 3,
        keywords: ['quote', 'materials'],
        sentiment: 'neutral',
        suggestedActions: ['Review when convenient'],
        reasoning: 'Standard business correspondence'
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch emails on mount', async () => {
    vi.mocked(emailService.fetchEmailAnalysis).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmailAnalysis());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emails).toEqual(mockEmails);
    expect(result.current.error).toBeNull();
    expect(emailService.fetchEmailAnalysis).toHaveBeenCalledWith(20);
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Network error');
    vi.mocked(emailService.fetchEmailAnalysis).mockRejectedValue(mockError);

    const { result } = renderHook(() => useEmailAnalysis());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.emails).toEqual([]);
  });

  it('should calculate urgent count correctly', async () => {
    vi.mocked(emailService.fetchEmailAnalysis).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmailAnalysis());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.urgentCount).toBe(1);
  });

  it('should calculate high priority count correctly', async () => {
    vi.mocked(emailService.fetchEmailAnalysis).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmailAnalysis());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.highPriorityCount).toBe(1);
  });

  it('should support custom limit', async () => {
    vi.mocked(emailService.fetchEmailAnalysis).mockResolvedValue([]);

    const { result } = renderHook(() => useEmailAnalysis(50));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(emailService.fetchEmailAnalysis).toHaveBeenCalledWith(50);
  });

  it('should refresh emails when refresh is called', async () => {
    vi.mocked(emailService.fetchEmailAnalysis).mockResolvedValue(mockEmails);

    const { result } = renderHook(() => useEmailAnalysis());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(emailService.fetchEmailAnalysis).mockClear();
    vi.mocked(emailService.fetchEmailAnalysis).mockResolvedValue([...mockEmails, {
      id: '3',
      from: 'new@example.com',
      subject: 'New email',
      urgency: 'low',
      preview: 'New email content',
      timestamp: new Date().toISOString()
    }]);

    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.emails).toHaveLength(3);
    });

    expect(emailService.fetchEmailAnalysis).toHaveBeenCalledTimes(1);
  });

  it('should handle empty email list', async () => {
    vi.mocked(emailService.fetchEmailAnalysis).mockResolvedValue([]);

    const { result } = renderHook(() => useEmailAnalysis());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emails).toEqual([]);
    expect(result.current.urgentCount).toBe(0);
    expect(result.current.highPriorityCount).toBe(0);
  });
});
