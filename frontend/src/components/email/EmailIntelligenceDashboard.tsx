import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import React, { useEffect, useState } from 'react';
import { useAppAuth } from '../../contexts/KindeAuthContext';
import { emailIntelligenceApi } from '../../services/emailIntelligenceApi';
import { GmailApiService } from '../../services/gmailApi';
import { useHybridAuth } from '../../services/hybridAuth';

interface AnalyzedEmail {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: Date;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
  urgencyScore: number;
  actionRequired: boolean;
  suggestedActions: string[];
  reasoning: string;
}

interface MorningDigest {
  generatedAt: Date;
  dateRange: {
    from: Date;
    to: Date;
  };
  summary: EmailSummary;
  urgentEmails: AnalyzedEmail[];
  highPriorityEmails: AnalyzedEmail[];
  actionRequiredEmails: AnalyzedEmail[];
  businessInsights: string[];
  recommendations: string[];
}

interface EmailSummary {
  totalEmails: number;
  urgentCount: number;
  highPriorityCount: number;
  actionRequiredCount: number;
  categoryCounts: {
    urgent: number;
    standard: number;
    followUp: number;
    admin: number;
    spam: number;
  };
}

export const EmailIntelligenceDashboard: React.FC = () => {
  const { isAuthenticated, user, getAccessToken } = useAppAuth();
  const {
    gmailAuth,
    isGmailConnected,
    connectGmail,
    disconnectGmail,
    isLoading: authLoading,
    error: authError,
  } = useHybridAuth();

  const [emails, setEmails] = useState<AnalyzedEmail[]>([]);
  const [summary, setSummary] = useState<EmailSummary | null>(null);
  const [digest, setDigest] = useState<MorningDigest | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urgent' | 'high' | 'action-required'>('all');
  const [showDigest, setShowDigest] = useState(false);

  // Fetch and analyze emails when Gmail is connected
  useEffect(() => {
    if (isGmailConnected && gmailAuth.accessToken) {
      fetchAndAnalyzeEmails();
    }
  }, [isGmailConnected, gmailAuth.accessToken]);

  const fetchAndAnalyzeEmails = async () => {
    if (!gmailAuth.accessToken) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const gmailService = new GmailApiService(gmailAuth.accessToken);

      // Fetch recent emails (last 24 hours)
      const messageList = await gmailService.listMessages({
        maxResults: 25,
        q: 'newer_than:1d in:inbox',
      });

      if (!messageList.messages || messageList.messages.length === 0) {
        setEmails([]);
        setSummary({
          totalEmails: 0,
          urgentCount: 0,
          highPriorityCount: 0,
          actionRequiredCount: 0,
          categoryCounts: { urgent: 0, standard: 0, followUp: 0, admin: 0, spam: 0 },
        });
        return;
      }

      // Get detailed messages
      const messageIds = messageList.messages.slice(0, 20).map(m => m.id);
      const detailedMessages = await gmailService.getMessages(messageIds);

      // Convert to email summaries
      const emailSummaries = detailedMessages.map(msg => GmailApiService.messageToSummary(msg));

      // Analyze emails using backend API
      const analysisResponse = await emailIntelligenceApi.analyzeEmails(emailSummaries, undefined, getAccessToken);

      // Convert to our interface format
      const formattedEmails: AnalyzedEmail[] = analysisResponse.data.analyzedEmails.map(email => ({
        id: email.id,
        subject: email.subject,
        from: email.from,
        snippet: email.snippet,
        date: new Date(email.date),
        priority: email.analysis.priority,
        category: email.analysis.category,
        urgencyScore: email.analysis.urgencyScore,
        actionRequired: email.analysis.actionRequired,
        suggestedActions: email.analysis.suggestedActions,
        reasoning: email.analysis.reasoning,
      }));

      setEmails(formattedEmails);
      setSummary({
        totalEmails: analysisResponse.data.totalEmails,
        ...analysisResponse.data.summary,
      });
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze emails');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMorningDigest = async () => {
    if (!gmailAuth.accessToken) return;

    setIsGeneratingDigest(true);
    setAnalysisError(null);

    try {
      const gmailService = new GmailApiService(gmailAuth.accessToken);

      // Fetch recent emails (last 24 hours)
      const messageList = await gmailService.listMessages({
        maxResults: 50,
        q: 'newer_than:1d in:inbox',
      });

      if (!messageList.messages || messageList.messages.length === 0) {
        setDigest({
          generatedAt: new Date(),
          dateRange: { from: new Date(Date.now() - 24 * 60 * 60 * 1000), to: new Date() },
          summary: {
            totalEmails: 0,
            urgentCount: 0,
            highPriorityCount: 0,
            actionRequiredCount: 0,
            categoryCounts: { urgent: 0, standard: 0, followUp: 0, admin: 0, spam: 0 },
          },
          urgentEmails: [],
          highPriorityEmails: [],
          actionRequiredEmails: [],
          businessInsights: ['No new emails in the last 24 hours.'],
          recommendations: ['Great job staying on top of your inbox!'],
        });
        return;
      }

      // Get detailed messages
      const messageIds = messageList.messages.slice(0, 30).map(m => m.id);
      const detailedMessages = await gmailService.getMessages(messageIds);

      // Convert to email summaries
      const emailSummaries = detailedMessages.map(msg => GmailApiService.messageToSummary(msg));

      // Generate digest using backend API
      const digestResponse = await emailIntelligenceApi.generateDigest(
        emailSummaries,
        undefined,
        undefined,
        getAccessToken
      );

      setDigest({
        generatedAt: new Date(digestResponse.data.generatedAt),
        dateRange: {
          from: new Date(digestResponse.data.dateRange.from),
          to: new Date(digestResponse.data.dateRange.to),
        },
        summary: digestResponse.data.summary,
        urgentEmails: digestResponse.data.urgentEmails,
        highPriorityEmails: digestResponse.data.highPriorityEmails,
        actionRequiredEmails: digestResponse.data.actionRequiredEmails,
        businessInsights: digestResponse.data.businessInsights,
        recommendations: digestResponse.data.recommendations,
      });

      setShowDigest(true);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Failed to generate digest');
    } finally {
      setIsGeneratingDigest(false);
    }
  };

  const getFilteredEmails = () => {
    switch (selectedFilter) {
      case 'urgent':
        return emails.filter(e => e.priority === 'urgent');
      case 'high':
        return emails.filter(e => e.priority === 'high');
      case 'action-required':
        return emails.filter(e => e.actionRequired);
      default:
        return emails;
    }
  };

  const getPriorityVariant = (priority: string): 'urgent' | 'high' | 'medium' | 'low' => {
    switch (priority) {
      case 'urgent':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent':
        return '🚨';
      case 'follow-up':
        return '🔄';
      case 'admin':
        return '📋';
      case 'spam':
        return '🛡️';
      default:
        return '📧';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className='max-w-4xl mx-auto mt-8'>
        <CardHeader>
          <CardTitle>Email Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>Please sign in to access email intelligence features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-8'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold mb-2 text-foreground'>📧 Email Intelligence Dashboard</h2>
        <p className='text-muted-foreground'>AI-powered email analysis for {user?.email}</p>
      </div>

      {/* Gmail Connection Status */}
      {!isGmailConnected ? (
        <Alert className='mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold text-blue-800 dark:text-blue-400'>Connect Gmail</h3>
              <AlertDescription className='text-blue-600 dark:text-blue-300'>
                Connect your Gmail account to analyze emails
              </AlertDescription>
            </div>
            <Button onClick={connectGmail} disabled={authLoading} variant='default'>
              {authLoading ? '⏳ Connecting...' : '🔗 Connect Gmail'}
            </Button>
          </div>
          {authError && <AlertDescription className='text-destructive mt-2'>Error: {authError}</AlertDescription>}
        </Alert>
      ) : (
        <Alert className='mb-6 border-green-200 bg-green-50 dark:bg-green-950/20'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold text-green-800 dark:text-green-400'>✅ Gmail Connected</h3>
              <AlertDescription className='text-green-600 dark:text-green-300'>
                Connected as: {gmailAuth.userEmail}
              </AlertDescription>
              <AlertDescription className='text-green-500 dark:text-green-400 text-xs'>
                Token expires: {gmailAuth.expiresAt ? new Date(gmailAuth.expiresAt).toLocaleString() : 'Unknown'}
              </AlertDescription>
            </div>
            <div className='flex gap-2'>
              <Button onClick={connectGmail} disabled={authLoading} variant='outline' size='sm'>
                {authLoading ? '⏳ Reconnecting...' : '🔄 Reconnect'}
              </Button>
              <Button onClick={disconnectGmail} disabled={authLoading} variant='destructive' size='sm'>
                🔌 Disconnect
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <Card>
            <CardContent className='pt-6'>
              <div className='text-2xl font-bold text-gray-700'>{summary.totalEmails}</div>
              <div className='text-sm text-muted-foreground'>Total Emails</div>
            </CardContent>
          </Card>
          <Card className='border-red-200 bg-red-50'>
            <CardContent className='pt-6'>
              <div className='text-2xl font-bold text-red-600'>{summary.urgentCount}</div>
              <div className='text-sm text-red-600'>Urgent</div>
            </CardContent>
          </Card>
          <Card className='border-orange-200 bg-orange-50'>
            <CardContent className='pt-6'>
              <div className='text-2xl font-bold text-orange-600'>{summary.highPriorityCount}</div>
              <div className='text-sm text-orange-600'>High Priority</div>
            </CardContent>
          </Card>
          <Card className='border-blue-200 bg-blue-50'>
            <CardContent className='pt-6'>
              <div className='text-2xl font-bold text-blue-600'>{summary.actionRequiredCount}</div>
              <div className='text-sm text-blue-600'>Action Required</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Controls */}
      {isGmailConnected && (
        <div className='mb-6 flex flex-wrap gap-4 items-center'>
          <Button
            onClick={fetchAndAnalyzeEmails}
            disabled={isAnalyzing}
            variant='default'
            className='bg-green-500 hover:bg-green-600'
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🔄 Refresh Analysis'}
          </Button>

          <Button onClick={generateMorningDigest} disabled={isGeneratingDigest} variant='default'>
            {isGeneratingDigest ? '⏳ Generating...' : '📊 Morning Digest'}
          </Button>

          <Button onClick={() => setShowDigest(!showDigest)} variant={showDigest ? 'default' : 'secondary'}>
            {showDigest ? '📧 Show Emails' : '📊 Show Digest'}
          </Button>

          {/* Filter Buttons */}
          <div className='flex gap-2'>
            {[
              { key: 'all', label: 'All Emails' },
              { key: 'urgent', label: 'Urgent' },
              { key: 'high', label: 'High Priority' },
              { key: 'action-required', label: 'Action Required' },
            ].map(filter => (
              <Button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as any)}
                variant={selectedFilter === filter.key ? 'default' : 'outline'}
                size='sm'
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {analysisError && (
        <Alert variant='destructive' className='mb-6'>
          <AlertDescription>❌ {analysisError}</AlertDescription>
        </Alert>
      )}

      {/* Morning Digest Display */}
      {showDigest && digest && (
        <div className='mb-8 space-y-6'>
          <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
            <CardHeader>
              <CardTitle className='text-xl text-blue-800'>📊 Morning Digest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-blue-600'>
                Generated on {digest.generatedAt.toLocaleDateString()} at {digest.generatedAt.toLocaleTimeString()}
              </p>
              <p className='text-sm text-blue-600'>
                Period: {digest.dateRange.from.toLocaleDateString()} - {digest.dateRange.to.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Business Insights */}
          {digest.businessInsights.length > 0 && (
            <Card className='bg-green-50 border-green-200'>
              <CardHeader>
                <CardTitle className='text-green-800'>💡 Business Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {digest.businessInsights.map((insight, index) => (
                    <li key={index} className='text-sm text-green-700'>
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {digest.recommendations.length > 0 && (
            <Card className='bg-yellow-50 border-yellow-200'>
              <CardHeader>
                <CardTitle className='text-yellow-800'>🎯 Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {digest.recommendations.map((rec, index) => (
                    <li key={index} className='text-sm text-yellow-700'>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Urgent Emails in Digest */}
          {digest.urgentEmails.length > 0 && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <h4 className='font-semibold text-red-800 mb-3'>🚨 Urgent Emails ({digest.urgentEmails.length})</h4>
              <div className='space-y-3'>
                {digest.urgentEmails.map(email => (
                  <div key={email.id} className='bg-white border border-red-100 rounded p-3'>
                    <div className='font-medium text-gray-900 mb-1'>{email.subject}</div>
                    <div className='text-sm text-gray-600 mb-1'>From: {email.from}</div>
                    <div className='text-sm text-gray-700 mb-2'>{email.snippet}</div>
                    {email.suggestedActions && email.suggestedActions.length > 0 && (
                      <div className='text-xs text-blue-600'>
                        <strong>Actions:</strong> {email.suggestedActions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* High Priority Emails in Digest */}
          {digest.highPriorityEmails.length > 0 && (
            <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
              <h4 className='font-semibold text-orange-800 mb-3'>
                ⭐ High Priority Emails ({digest.highPriorityEmails.length})
              </h4>
              <div className='space-y-3'>
                {digest.highPriorityEmails.slice(0, 5).map(email => (
                  <div key={email.id} className='bg-white border border-orange-100 rounded p-3'>
                    <div className='font-medium text-gray-900 mb-1'>{email.subject}</div>
                    <div className='text-sm text-gray-600 mb-1'>From: {email.from}</div>
                    <div className='text-sm text-gray-700'>{email.snippet}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email List */}
      {!showDigest && emails.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>
            {selectedFilter === 'all'
              ? 'All Emails'
              : selectedFilter === 'urgent'
              ? 'Urgent Emails'
              : selectedFilter === 'high'
              ? 'High Priority Emails'
              : 'Action Required Emails'}{' '}
            ({getFilteredEmails().length})
          </h3>

          {getFilteredEmails().map(email => (
            <Card key={email.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='pt-6'>
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-lg'>{getCategoryIcon(email.category)}</span>
                      <h4 className='font-semibold text-foreground line-clamp-1'>{email.subject}</h4>
                      <Badge variant={getPriorityVariant(email.priority)} size='sm'>
                        {email.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>From: {email.from}</p>
                    <p className='text-sm text-foreground mt-1 line-clamp-2'>{email.snippet}</p>
                  </div>
                  <div className='text-right text-sm text-muted-foreground ml-4'>
                    <div>Score: {email.urgencyScore}</div>
                    <div>{new Date(email.date).toLocaleDateString()}</div>
                  </div>
                </div>

                {email.actionRequired && (
                  <Alert className='mt-3 border-yellow-200 bg-yellow-50'>
                    <div className='text-sm font-medium text-yellow-800 mb-1'>⚡ Action Required</div>
                    <AlertDescription className='text-yellow-700'>
                      <strong>Suggestions:</strong> {email.suggestedActions.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className='mt-2 text-xs text-muted-foreground'>
                  <strong>AI Analysis:</strong> {email.reasoning}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {isGmailConnected && !showDigest && emails.length === 0 && !isAnalyzing && (
        <div className='text-center py-8'>
          <div className='text-4xl mb-4'>📭</div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Recent Emails</h3>
          <p className='text-gray-600'>No emails found in the last 24 hours</p>
        </div>
      )}
    </div>
  );
};
