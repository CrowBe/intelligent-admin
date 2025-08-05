import React, { useState } from 'react';
import { 
  DocumentArrowUpIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface DocumentSuggestion {
  type: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  keywords?: string[];
  context?: string;
}

interface DocumentSuggestionsProps {
  suggestions: DocumentSuggestion[];
  onUploadRequest?: (suggestionType: string) => void;
  onDismiss?: (index: number) => void;
  compact?: boolean;
}

export const DocumentSuggestions: React.FC<DocumentSuggestionsProps> = ({
  suggestions,
  onUploadRequest,
  onDismiss,
  compact = false
}) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const visibleSuggestions = suggestions.filter((_, index) => !dismissedSuggestions.has(index));

  if (visibleSuggestions.length === 0) {
    return null;
  }

  const handleDismiss = (index: number) => {
    setDismissedSuggestions(prev => new Set([...prev, index]));
    onDismiss?.(index);
  };

  const handleUpload = (suggestionType: string) => {
    onUploadRequest?.(suggestionType);
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <InformationCircleIcon className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {visibleSuggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {getPriorityIcon(suggestion.priority)}
              <span className="text-sm text-amber-800 dark:text-amber-200 truncate">
                Upload {formatDocumentType(suggestion.type)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpload(suggestion.type)}
                className="text-xs"
              >
                Upload
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(index)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <DocumentArrowUpIcon className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Suggested Documents
        </h3>
      </div>

      {visibleSuggestions.map((suggestion, index) => (
        <Card 
          key={index}
          className={`p-4 border-l-4 ${
            suggestion.priority === 'high' 
              ? 'border-red-400 bg-red-50 dark:bg-red-900/10' 
              : suggestion.priority === 'medium'
              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
              : 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {getPriorityIcon(suggestion.priority)}
                <Badge variant={getPriorityColor(suggestion.priority) as any}>
                  {suggestion.priority} priority
                </Badge>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDocumentType(suggestion.type)}
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {suggestion.message}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reason: {suggestion.reason}
                </p>

                {suggestion.keywords && suggestion.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {suggestion.keywords.slice(0, 3).map((keyword, keywordIndex) => (
                      <Badge 
                        key={keywordIndex} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {suggestion.keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{suggestion.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button
                size="sm"
                onClick={() => handleUpload(suggestion.type)}
                className="whitespace-nowrap"
              >
                <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
                Upload
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Context Information */}
          {suggestion.context && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Context: {suggestion.context}
              </p>
            </div>
          )}
        </Card>
      ))}

      {/* Summary */}
      {visibleSuggestions.length > 1 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {visibleSuggestions.length} document{visibleSuggestions.length === 1 ? '' : 's'} suggested
        </div>
      )}
    </div>
  );
};