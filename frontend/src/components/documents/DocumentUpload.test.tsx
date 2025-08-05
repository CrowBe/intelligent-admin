import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentUpload } from './DocumentUpload';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DocumentUpload', () => {
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <DocumentUpload
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
        {...props}
      />
    );
  };

  it('renders upload interface correctly', () => {
    renderComponent();

    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here, or click to select files')).toBeInTheDocument();
    expect(screen.getByText('Choose Files')).toBeInTheDocument();
    expect(screen.getByText(/Supported.*Max.*10MB/)).toBeInTheDocument();
  });

  it('displays custom file types and size limits', () => {
    renderComponent({
      allowedTypes: ['pdf', 'jpg'],
      maxFileSize: 5
    });

    expect(screen.getByText(/Supported: pdf, jpg.*Max 5MB/)).toBeInTheDocument();
  });

  it('handles file selection via input', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock successful upload response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        document: {
          id: 'doc-123',
          filename: 'test.pdf',
          originalFilename: 'test.pdf',
          processingStatus: 'pending'
        }
      })
    });

    // Mock successful processing status
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'completed',
        contentText: 'Test content',
        processedAt: new Date().toISOString()
      })
    });

    const fileInput = screen.getByLabelText(/choose files/i);
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/documents/upload?enableOCR=true&extractStructuredData=true',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include'
      })
    );
  });

  it('handles drag and drop file upload', async () => {
    renderComponent();

    const dropZone = screen.getByText('Drag and drop files here, or click to select files').closest('div');
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Mock successful upload
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        document: {
          id: 'doc-123',
          filename: 'test.pdf',
          originalFilename: 'test.pdf',
          processingStatus: 'pending'
        }
      })
    });

    // Simulate drag and drop
    fireEvent.dragOver(dropZone!);
    expect(dropZone).toHaveClass('border-blue-400');

    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('validates file types', async () => {
    const user = userEvent.setup();
    renderComponent({
      allowedTypes: ['pdf']
    });

    const fileInput = screen.getByLabelText(/choose files/i);
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    await user.upload(fileInput, invalidFile);

    expect(mockOnUploadError).toHaveBeenCalledWith(
      expect.stringContaining('File type .txt is not supported')
    );
  });

  it('validates file size', async () => {
    const user = userEvent.setup();
    renderComponent({
      maxFileSize: 1 // 1MB
    });

    const fileInput = screen.getByLabelText(/choose files/i);
    const largeFile = new File(
      [new ArrayBuffer(2 * 1024 * 1024)], // 2MB
      'large.pdf', 
      { type: 'application/pdf' }
    );

    await user.upload(fileInput, largeFile);

    expect(mockOnUploadError).toHaveBeenCalledWith(
      expect.stringContaining('File size must be less than 1MB')
    );
  });

  it('displays upload progress', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock upload response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        document: {
          id: 'doc-123',
          filename: 'test.pdf',
          originalFilename: 'test.pdf',
          processingStatus: 'pending'
        }
      })
    });

    const fileInput = screen.getByLabelText(/choose files/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Uploading')).toBeInTheDocument();
    });
  });

  it('shows processing status', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock upload response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        document: {
          id: 'doc-123',
          filename: 'test.pdf',
          originalFilename: 'test.pdf',
          processingStatus: 'pending'
        }
      })
    });

    // Mock processing status - still processing
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'processing',
        message: 'Document is being processed'
      })
    });

    // Mock final completion
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'completed',
        contentText: 'Test content',
        processedAt: new Date().toISOString()
      })
    });

    const fileInput = screen.getByLabelText(/choose files/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Processing document with OCR and data extraction...')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText('Document processed successfully!')).toBeInTheDocument();
    }, { timeout: 15000 });

    expect(mockOnUploadComplete).toHaveBeenCalledWith({
      status: 'completed',
      contentText: 'Test content',
      processedAt: expect.any(String)
    });
  });

  it('handles upload errors', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock upload failure
    mockFetch.mockRejectedValueOnce(new Error('Upload failed'));

    const fileInput = screen.getByLabelText(/choose files/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });

    expect(mockOnUploadError).toHaveBeenCalledWith('Upload failed');
  });

  it('handles processing errors', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock successful upload
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        document: {
          id: 'doc-123',
          filename: 'test.pdf',
          originalFilename: 'test.pdf',
          processingStatus: 'pending'
        }
      })
    });

    // Mock processing failure
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'failed',
        error: 'Processing failed'
      })
    });

    const fileInput = screen.getByLabelText(/choose files/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Processing failed')).toBeInTheDocument();
    }, { timeout: 15000 });

    expect(mockOnUploadError).toHaveBeenCalledWith('Processing failed');
  });

  it('allows file removal during upload', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock upload response that takes time
    mockFetch.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          document: {
            id: 'doc-123',
            filename: 'test.pdf',
            originalFilename: 'test.pdf',
            processingStatus: 'pending'
          }
        })
      }), 1000))
    );

    const fileInput = screen.getByLabelText(/choose files/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // File should be uploading, so remove button should not be available yet
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('applies custom category to uploads', async () => {
    const user = userEvent.setup();
    renderComponent({
      category: 'invoice'
    });

    // Mock successful upload
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        document: {
          id: 'doc-123',
          filename: 'test.pdf',
          originalFilename: 'test.pdf',
          processingStatus: 'pending'
        }
      })
    });

    const fileInput = screen.getByLabelText(/choose files/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });

    // Verify FormData contains category
    const formData = mockFetch.mock.calls[0][1].body;
    expect(formData.get('category')).toBe('invoice');
  });

  it('shows file icons correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Mock successful upload
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        document: {
          id: 'doc-123',
          filename: 'test.pdf',
          originalFilename: 'test.pdf',
          processingStatus: 'pending'
        }
      })
    });

    const fileInput = screen.getByLabelText(/choose files/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('📄')).toBeInTheDocument(); // PDF icon
    });
  });
});