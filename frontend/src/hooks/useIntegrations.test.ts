// useIntegrations Hook Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useIntegrations } from './useIntegrations';
import { integrationService } from '../services/integrationService';
import type { Integration } from '../services/integrationService';
import { toast } from 'sonner';

vi.mock('../services/integrationService', () => ({
  integrationService: {
    fetchIntegrations: vi.fn(),
    connectIntegration: vi.fn(),
    disconnectIntegration: vi.fn()
  }
}));

vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('useIntegrations', () => {
  const mockIntegrations: Integration[] = [
    {
      id: 'gmail',
      title: 'Gmail',
      description: 'Email integration',
      icon: null,
      connected: true,
      benefits: ['Email management'],
      category: 'communication'
    },
    {
      id: 'calendar',
      title: 'Google Calendar',
      description: 'Calendar integration',
      icon: null,
      connected: false,
      benefits: ['Scheduling'],
      category: 'productivity'
    },
    {
      id: 'hubspot',
      title: 'HubSpot',
      description: 'CRM integration',
      icon: null,
      connected: false,
      comingSoon: true,
      benefits: ['Customer management'],
      category: 'other'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch integrations on mount', async () => {
    vi.mocked(integrationService.fetchIntegrations).mockResolvedValue(mockIntegrations);

    const { result } = renderHook(() => useIntegrations());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.integrations).toEqual(mockIntegrations);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Network error');
    vi.mocked(integrationService.fetchIntegrations).mockRejectedValue(mockError);

    const { result } = renderHook(() => useIntegrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.integrations).toEqual([]);
  });

  it('should connect integration successfully', async () => {
    vi.mocked(integrationService.fetchIntegrations).mockResolvedValue(mockIntegrations);
    vi.mocked(integrationService.connectIntegration).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useIntegrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.connect('calendar');
    });

    expect(integrationService.connectIntegration).toHaveBeenCalledWith('calendar');
    expect(toast.success).toHaveBeenCalled();
  });

  it('should show info toast for coming soon integrations', async () => {
    vi.mocked(integrationService.fetchIntegrations).mockResolvedValue(mockIntegrations);

    const { result } = renderHook(() => useIntegrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.connect('hubspot');
    });

    expect(integrationService.connectIntegration).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith(
      'HubSpot integration coming soon!',
      expect.any(Object)
    );
  });

  it('should disconnect integration successfully', async () => {
    vi.mocked(integrationService.fetchIntegrations).mockResolvedValue(mockIntegrations);
    vi.mocked(integrationService.disconnectIntegration).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useIntegrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.disconnect('gmail');
    });

    expect(integrationService.disconnectIntegration).toHaveBeenCalledWith('gmail');
    expect(toast.success).toHaveBeenCalled();
  });

  it('should handle connection errors', async () => {
    const mockError = new Error('Connection failed');
    vi.mocked(integrationService.fetchIntegrations).mockResolvedValue(mockIntegrations);
    vi.mocked(integrationService.connectIntegration).mockRejectedValue(mockError);

    const { result } = renderHook(() => useIntegrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.connect('calendar');
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to connect integration',
      expect.any(Object)
    );
  });

  it('should refresh integrations', async () => {
    vi.mocked(integrationService.fetchIntegrations).mockResolvedValue(mockIntegrations);

    const { result } = renderHook(() => useIntegrations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(integrationService.fetchIntegrations).mockClear();

    await act(async () => {
      await result.current.refresh();
    });

    expect(integrationService.fetchIntegrations).toHaveBeenCalledTimes(1);
  });
});
