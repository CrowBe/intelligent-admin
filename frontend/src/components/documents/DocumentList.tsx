import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Image, 
  Mail,
  Calendar,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface Document {
  id: string;
  filename: string;
  originalFilename: string;
  title: string;
  category: string | null;
  tags: string[];
  mimeType: string;
  fileSize: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  processedAt: string | null;
  contentText?: string;
  extractedData?: any;
}

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
  category?: string;
  searchable?: boolean;
  showActions?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onDocumentSelect,
  onDocumentDelete,
  category,
  searchable = true,
  showActions = true
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    loadDocuments();
  }, [selectedCategory]);

  const loadDocuments = async (offset = 0, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString()
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/v1/documents?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load documents');
      }

      const data = await response.json();
      
      if (append) {
        setDocuments(prev => [...prev, ...data.documents]);
      } else {
        setDocuments(data.documents);
      }
      
      setPagination({
        ...data.pagination,
        offset: offset
      });

    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/documents/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          query: searchQuery,
          category: selectedCategory || undefined,
          limit: pagination.limit,
          offset: 0
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setDocuments(data.documents);
      setPagination(data.pagination);

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      onDocumentDelete?.(documentId);

    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleView = async (document: Document) => {
    if (document.processingStatus === 'completed') {
      onDocumentSelect?.(document);
    } else if (document.processingStatus === 'pending' || document.processingStatus === 'processing') {
      // Trigger reprocessing
      try {
        await fetch(`/api/v1/documents/${document.id}/process`, {
          credentials: 'include'
        });
        // Refresh the document list
        loadDocuments();
      } catch (error) {
        console.error('Failed to trigger processing:', error);
      }
    }
  };

  const loadMore = () => {
    const newOffset = pagination.offset + pagination.limit;
    loadDocuments(newOffset, true);
  };

  const getFileIcon = (mimeType: string, category: string | null) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType.includes('email') || category === 'email') {
      return <Mail className="w-5 h-5 text-green-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getStatusBadge = (status: Document['processingStatus']) => {
    const config = {
      pending: { variant: 'yellow' as const, label: 'Pending' },
      processing: { variant: 'blue' as const, label: 'Processing' },
      completed: { variant: 'green' as const, label: 'Ready' },
      failed: { variant: 'red' as const, label: 'Failed' }
    };

    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const categories = [
    'invoice',
    'quote',
    'certificate',
    'safety_document',
    'contract',
    'receipt',
    'technical_drawing',
    'photo',
    'email'
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      {searchable && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
              
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => loadDocuments()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search criteria' : 'Upload some documents to get started'}
            </p>
          </Card>
        ) : (
          <>
            {documents.map((document) => (
              <Card key={document.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {getFileIcon(document.mimeType, document.category)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {document.title}
                        </h4>
                        {getStatusBadge(document.processingStatus)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(document.uploadedAt)}</span>
                        </span>
                        {document.category && (
                          <Badge variant="outline" className="text-xs">
                            {document.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {document.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {document.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{document.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {showActions && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(document)}
                        disabled={document.processingStatus === 'failed'}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Processing Status Details */}
                {document.processingStatus === 'processing' && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm text-blue-700 dark:text-blue-300">
                    Document is being processed with OCR and data extraction...
                  </div>
                )}

                {document.processingStatus === 'failed' && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm text-red-700 dark:text-red-300">
                    Processing failed. Please try uploading again.
                  </div>
                )}

                {/* Document Preview */}
                {document.contentText && document.processingStatus === 'completed' && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-400">
                    <p className="line-clamp-2">{document.contentText}</p>
                  </div>
                )}
              </Card>
            ))}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Results Summary */}
      {documents.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {documents.length} of {pagination.total} documents
        </div>
      )}
    </div>
  );
};