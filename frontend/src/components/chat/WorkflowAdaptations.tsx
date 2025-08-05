import React from 'react';
import { 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QueueListIcon,
  ScaleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface WorkflowAdaptation {
  type: 'follow_up_timing' | 'communication_tone' | 'task_batching' | 'priority_weighting';
  recommendation: string;
  confidence: number;
  data: any;
}

interface WorkflowAdaptationsProps {
  adaptations: WorkflowAdaptation[];
  compact?: boolean;
  showDetails?: boolean;
}

export const WorkflowAdaptations: React.FC<WorkflowAdaptationsProps> = ({
  adaptations,
  compact = false,
  showDetails = false
}) => {
  if (!adaptations || adaptations.length === 0) {
    return null;
  }

  // Only show high-confidence adaptations
  const highConfidenceAdaptations = adaptations.filter(a => a.confidence >= 0.5);

  if (highConfidenceAdaptations.length === 0) {
    return null;
  }

  const getAdaptationIcon = (type: WorkflowAdaptation['type']) => {
    switch (type) {
      case 'follow_up_timing':
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      case 'communication_tone':
        return <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-500" />;
      case 'task_batching':
        return <QueueListIcon className="w-4 h-4 text-purple-500" />;
      case 'priority_weighting':
        return <ScaleIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <CheckCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAdaptationTitle = (type: WorkflowAdaptation['type']) => {
    switch (type) {
      case 'follow_up_timing':
        return 'Follow-up Timing';
      case 'communication_tone':
        return 'Communication Style';
      case 'task_batching':
        return 'Task Organization';
      case 'priority_weighting':
        return 'Priority Management';
      default:
        return 'Workflow Preference';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'blue';
    return 'yellow';
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {highConfidenceAdaptations.map((adaptation, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {getAdaptationIcon(adaptation.type)}
              <span className="text-sm text-blue-800 dark:text-blue-200 truncate">
                {getAdaptationTitle(adaptation.type)}: Applied
              </span>
            </div>
            <Badge 
              variant={getConfidenceColor(adaptation.confidence) as any}
              className="text-xs"
            >
              {Math.round(adaptation.confidence * 100)}%
            </Badge>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <CheckCircleIcon className="w-5 h-5 text-green-500" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Workflow Adaptations Applied
        </h3>
      </div>

      {highConfidenceAdaptations.map((adaptation, index) => (
        <Card 
          key={index}
          className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getAdaptationIcon(adaptation.type)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getAdaptationTitle(adaptation.type)}
                  </h4>
                  <Badge 
                    variant={getConfidenceColor(adaptation.confidence) as any}
                    className="text-xs"
                  >
                    {Math.round(adaptation.confidence * 100)}% confidence
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {adaptation.recommendation}
                </p>

                {/* Additional Details */}
                {showDetails && adaptation.data && (
                  <div className="mt-2 space-y-1">
                    {adaptation.type === 'follow_up_timing' && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {adaptation.data.customerType && (
                          <span>Customer Type: {adaptation.data.customerType} • </span>
                        )}
                        {adaptation.data.customerValue && (
                          <span>Value Tier: {adaptation.data.customerValue} • </span>
                        )}
                        {adaptation.data.averageResponseTime && (
                          <span>Avg Response: {Math.round(adaptation.data.averageResponseTime)}h</span>
                        )}
                      </div>
                    )}

                    {adaptation.type === 'communication_tone' && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {adaptation.data.customerType && (
                          <span>Customer Type: {adaptation.data.customerType} • </span>
                        )}
                        {adaptation.data.preferredTone && (
                          <span>
                            Tone: {adaptation.data.preferredTone.formality} • 
                            Style: {adaptation.data.preferredTone.technicality}
                          </span>
                        )}
                      </div>
                    )}

                    {adaptation.type === 'task_batching' && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {adaptation.data.preferredBatchSize && (
                          <span>Batch Size: {adaptation.data.preferredBatchSize} • </span>
                        )}
                        {adaptation.data.preferredTimeGap && (
                          <span>Time Gap: {adaptation.data.preferredTimeGap}min</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Summary */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {highConfidenceAdaptations.length} workflow preference{highConfidenceAdaptations.length === 1 ? '' : 's'} applied
      </div>
    </div>
  );
};