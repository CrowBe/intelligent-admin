import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/badge';

interface DocumentUploadProps {
  onUploadComplete?: (document: any) => void;
  onUploadError?: (error: string) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  category?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  onUploadError,
  allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'txt', 'eml'],
  maxFileSize = 10,
  category
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isValidType = allowedTypes.includes(extension || '');
      const isValidSize = file.size <= maxFileSize * 1024 * 1024;

      if (!isValidType) {
        onUploadError?.(`File type .${extension} is not supported`);
        return false;
      }

      if (!isValidSize) {
        onUploadError?.(`File size must be less than ${maxFileSize}MB`);
        return false;
      }

      return true;
    });

    validFiles.forEach(file => {
      uploadFile(file);
    });
  }, [allowedTypes, maxFileSize, onUploadError]);

  const uploadFile = async (file: File) => {
    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: 'uploading'
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);

    try {
      const formData = new FormData();
      formData.append('document', file);
      if (category) {
        formData.append('category', category);
      }

      const response = await fetch('/api/v1/documents/upload?enableOCR=true&extractStructuredData=true', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Validate response structure
      if (!result?.document?.id) {
        throw new Error('Invalid server response: missing document ID');
      }

      // Update file status to processing
      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'processing', documentId: result.document.id, progress: 100 }
            : f
        )
      );

      // Poll for processing completion
      pollProcessingStatus(result.document.id, file);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      );
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const pollProcessingStatus = async (documentId: string, file: File) => {
    const maxAttempts = 30; // 30 attempts = 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/v1/documents/${documentId}/process`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to check processing status');
        }

        const result = await response.json();

        if (result.status === 'completed') {
          setUploadingFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, status: 'completed' }
                : f
            )
          );
          onUploadComplete?.(result);
          return;
        }

        if (result.status === 'failed') {
          throw new Error(result.details || 'Processing failed');
        }

        // Continue polling if still processing
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          throw new Error('Processing timeout');
        }

      } catch (error) {
        console.error('Processing poll error:', error);
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Processing failed' }
              : f
          )
        );
        onUploadError?.(error instanceof Error ? error.message : 'Processing failed');
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 2000);
  };

  const removeFile = useCallback((file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  }, []);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'tiff':
        return '🖼️';
      case 'txt':
        return '📝';
      case 'eml':
        return '📧';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: UploadingFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'blue';
      case 'processing':
        return 'yellow';
      case 'completed':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: UploadingFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Upload Documents
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <input
            type="file"
            multiple
            accept={allowedTypes.map(type => `.${type}`).join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="inline-block">
            <Button variant="outline" type="button" asChild>
              <span>Choose Files</span>
            </Button>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Supported: {allowedTypes.join(', ')} • Max {maxFileSize}MB
          </p>
        </div>
      </Card>

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Upload Progress
          </h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl">{getFileIcon(uploadingFile.file.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(uploadingFile.status) as any}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(uploadingFile.status)}
                      <span className="capitalize">{uploadingFile.status}</span>
                    </div>
                  </Badge>

                  {uploadingFile.status !== 'uploading' && uploadingFile.status !== 'processing' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadingFile.file)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(uploadingFile.status === 'uploading' || uploadingFile.status === 'processing') && (
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {uploadingFile.error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {uploadingFile.error}
                </div>
              )}

              {/* Processing Status */}
              {uploadingFile.status === 'processing' && (
                <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                  Processing document with OCR and data extraction...
                </div>
              )}

              {/* Completion Message */}
              {uploadingFile.status === 'completed' && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Document processed successfully!
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};