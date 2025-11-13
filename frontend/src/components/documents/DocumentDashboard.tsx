import React, { useState } from 'react';
import { Upload, FolderOpen, Search, Plus, FileText, AlertCircle } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/badge';

interface DocumentSuggestion {
  type: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
}

interface DocumentDashboardProps {
  userId?: string;
  showSuggestions?: boolean;
  compactMode?: boolean;
}

export const DocumentDashboard: React.FC<DocumentDashboardProps> = ({
  userId,
  showSuggestions = true,
  compactMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('list');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [suggestions, setSuggestions] = useState<DocumentSuggestion[]>([
    {
      type: 'safety_document',
      reason: 'Detected safety-related conversation',
      priority: 'high',
      message: 'For electrical work, I\'ll need to see your electrical safety certificates and test results to ensure compliance with Australian Standards AS/NZS 3000.'
    },
    {
      type: 'quote',
      reason: 'Pricing discussion detected',
      priority: 'medium',
      message: 'Upload your current price lists and previous quotes to help create more accurate estimates.'
    }
  ]);

  const handleUploadComplete = (document: any) => {
    console.log('Document uploaded:', document);
    // Refresh the document list
    setActiveTab('list');
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Could show a toast notification here
  };

  const handleDocumentSelect = (document: any) => {
    setSelectedDocument(document);
    // Could open a document viewer modal
  };

  const handleDocumentDelete = (documentId: string) => {
    console.log('Document deleted:', documentId);
    // Could show a success notification
  };

  const dismissSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  if (compactMode) {
    return (
      <div className="space-y-4">
        {/* Quick Upload */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Documents</h3>
            <Button
              size="sm"
              onClick={() => setActiveTab(activeTab === 'upload' ? 'list' : 'upload')}
            >
              {activeTab === 'upload' ? <FolderOpen className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>

          {activeTab === 'upload' ? (
            <DocumentUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              maxFileSize={5} // Smaller limit for compact mode
            />
          ) : (
            <DocumentList
              onDocumentSelect={handleDocumentSelect}
              onDocumentDelete={handleDocumentDelete}
              searchable={false}
            />
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Document Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload, process, and manage your business documents with AI-powered analysis
          </p>
        </div>
      </div>

      {/* Document Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
            Suggested Documents
          </h2>
          
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-4 border-l-4 border-amber-400">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={getPriorityColor(suggestion.priority) as any}>
                      {suggestion.priority} priority
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {suggestion.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {suggestion.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Reason: {suggestion.reason}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('upload')}
                  >
                    Upload
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissSuggestion(index)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              My Documents
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Documents
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'list' && (
            <DocumentList
              onDocumentSelect={handleDocumentSelect}
              onDocumentDelete={handleDocumentDelete}
              searchable={true}
              showActions={true}
            />
          )}

          {activeTab === 'upload' && (
            <DocumentUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">45MB</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Storage Used</div>
          </div>
        </div>
      </Card>
    </div>
  );
};