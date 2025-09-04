import type { Meta, StoryObj } from '@storybook/react';
import { DocumentUpload } from './DocumentUpload';

const meta: Meta<typeof DocumentUpload> = {
  title: 'Documents/DocumentUpload',
  component: DocumentUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Document upload component with drag-and-drop functionality for Australian trade business documents.
        
        **Key Features:**
        - Drag and drop file upload
        - File type validation (PDF, DOC, images)
        - Progress indicators and error handling
        - Mobile-optimized touch interface
        - Industry document categorization`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onUpload: {
      action: 'file uploaded',
      description: 'Callback when files are uploaded',
    },
    category: {
      control: { type: 'select' },
      options: ['regulation', 'certificate', 'invoice', 'safety', 'permit'],
      description: 'Document category for Australian trade businesses',
    },
    maxFiles: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of files to upload',
    },
    maxSize: {
      control: { type: 'number' },
      description: 'Maximum file size in MB',
    },
  },
  args: {
    onUpload: (files) => console.log('Files uploaded:', files),
    onError: (error) => console.error('Upload error:', error),
    onProgress: (progress) => console.log('Upload progress:', progress),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    category: 'regulation',
    maxFiles: 5,
    maxSize: 10,
  },
};

export const SafetyDocuments: Story = {
  args: {
    category: 'safety',
    maxFiles: 3,
    maxSize: 25,
    placeholder: 'Upload safety certificates, inspection reports, or compliance documents',
  },
  parameters: {
    docs: {
      description: {
        story: 'Optimized for safety-critical documents like WorkSafe NSW certificates and inspection reports.',
      },
    },
  },
};

export const ElectricalCertificates: Story = {
  args: {
    category: 'certificate',
    maxFiles: 1,
    maxSize: 5,
    acceptedTypes: ['.pdf', '.jpg', '.png'],
    placeholder: 'Upload electrical certificate or compliance documentation',
    helpText: 'Accepted formats: PDF, JPG, PNG. Maximum size: 5MB',
  },
  parameters: {
    docs: {
      description: {
        story: 'Single file upload for electrical certificates with strict validation.',
      },
    },
  },
};

export const BulkInvoices: Story = {
  args: {
    category: 'invoice',
    maxFiles: 20,
    maxSize: 50,
    placeholder: 'Upload multiple invoices, receipts, or financial documents',
    allowBatch: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Bulk upload for financial documents with higher file limits.',
      },
    },
  },
};

// State variations
export const WithProgress: Story = {
  args: {
    category: 'regulation',
    isUploading: true,
    progress: 65,
    currentFile: 'AS-NZS-3000-2018-Standard.pdf',
  },
  parameters: {
    docs: {
      description: {
        story: 'Upload in progress state with progress indicator.',
      },
    },
  },
};

export const UploadComplete: Story = {
  args: {
    category: 'certificate',
    uploadStatus: 'success',
    uploadedFiles: [
      { name: 'Electrical_Certificate_Site_123.pdf', size: 2.4, type: 'pdf' },
      { name: 'Inspection_Report_2024.pdf', size: 1.8, type: 'pdf' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Successful upload state showing completed files.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    category: 'permit',
    uploadStatus: 'error',
    errorMessage: 'File size exceeds 10MB limit. Please compress the document or upload a smaller file.',
    failedFiles: [
      { name: 'Large_Building_Plans.pdf', size: 15.2, error: 'File too large' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state with clear messaging and recovery options.',
      },
    },
  },
};

// Mobile optimization
export const MobileView: Story = {
  args: {
    category: 'safety',
    maxFiles: 3,
    maxSize: 10,
    placeholder: 'Tap to upload photos or documents',
    mobileOptimized: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Mobile-optimized interface for on-site document capture.',
      },
    },
  },
};

export const TabletView: Story = {
  args: {
    category: 'regulation',
    maxFiles: 5,
    maxSize: 15,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Tablet view for office document management.',
      },
    },
  },
};

// Interactive testing stories (visual only - interaction tests handled by Vitest)
export const DragAndDropInteraction: Story = {
  args: {
    category: 'certificate',
    maxFiles: 3,
    maxSize: 10,
    isHovered: true, // Show hover state visually
  },
  parameters: {
    docs: {
      description: {
        story: 'Visual representation of drag and drop hover state.',
      },
    },
  },
};

export const FileValidation: Story = {
  args: {
    category: 'certificate',
    acceptedTypes: ['.pdf', '.jpg'],
    maxSize: 5,
    validationError: 'Invalid file type. Only PDF and JPG files are accepted.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Visual representation of file validation error state.',
      },
    },
  },
};

// Accessibility testing
export const AccessibilityTest: Story = {
  args: {
    category: 'regulation',
    maxFiles: 5,
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'aria-labels', enabled: true },
        ],
      },
    },
    docs: {
      description: {
        story: 'Accessibility compliance test for screen readers and keyboard navigation.',
      },
    },
  },
};

export const KeyboardNavigation: Story = {
  args: {
    category: 'safety',
    maxFiles: 3,
    showKeyboardHints: true, // Show keyboard navigation hints visually
  },
  parameters: {
    docs: {
      description: {
        story: 'Visual representation of keyboard navigation accessibility features.',
      },
    },
  },
};

// Business context variations
export const WorkSafeCompliance: Story = {
  args: {
    category: 'safety',
    maxFiles: 5,
    maxSize: 25,
    placeholder: 'Upload WorkSafe NSW compliance documents',
    requiredDocuments: [
      'Safety Management Plan',
      'Risk Assessment',
      'Training Certificates',
    ],
    urgentUpload: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'High-priority upload for WorkSafe NSW compliance documentation.',
      },
    },
  },
};

export const ElectricalStandards: Story = {
  args: {
    category: 'regulation',
    maxFiles: 10,
    maxSize: 20,
    placeholder: 'Upload AS/NZS electrical standards and reference documents',
    acceptedTypes: ['.pdf', '.doc', '.docx'],
    helpText: 'Upload Australian Standards (AS/NZS 3000:2018, AS/NZS 3018:2007) and related documentation',
  },
  parameters: {
    docs: {
      description: {
        story: 'Upload interface for Australian electrical standards and regulations.',
      },
    },
  },
};

// Performance testing
export const LargeFileHandling: Story = {
  args: {
    category: 'regulation',
    maxFiles: 1,
    maxSize: 100, // 100MB for large architectural plans
    placeholder: 'Upload large documents (building plans, detailed specifications)',
    showSizeWarning: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests handling of large files with appropriate warnings and optimization.',
      },
    },
  },
};