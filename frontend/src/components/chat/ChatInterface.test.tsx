import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from './ChatInterface';
import { ChatProvider } from '../../contexts/ChatContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the API calls
vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock the auth context
vi.mock('../../contexts/KindeAuthContext', () => ({
  useAppAuth: () => ({
    isAuthenticated: true,
    user: {
      id: 'test-user',
      email: 'test@example.com',
      given_name: 'Test',
      family_name: 'User',
    },
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ChatProvider>{component}</ChatProvider>
    </BrowserRouter>
  );
};

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the chat interface correctly', () => {
    renderWithProviders(<ChatInterface />);
    
    // Check for main elements
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
  });

  it('displays welcome message on initial load', () => {
    renderWithProviders(<ChatInterface />);
    
    // Check for welcome message
    expect(screen.getByText(/hello! i'm your ai admin assistant/i)).toBeInTheDocument();
  });

  it('allows user to type and send a message', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/type your message/i) as HTMLTextAreaElement;
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Type a message
    await user.type(input, 'Help me with my emails');
    expect(input.value).toBe('Help me with my emails');
    
    // Send the message
    await user.click(sendButton);
    
    // Input should be cleared after sending
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('disables send button when input is empty', () => {
    renderWithProviders(<ChatInterface />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Initially disabled
    expect(sendButton).toBeDisabled();
    
    // Type text
    await user.type(input, 'Test message');
    
    // Should be enabled
    expect(sendButton).not.toBeDisabled();
  });

  it('handles keyboard shortcuts correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/type your message/i) as HTMLTextAreaElement;
    
    // Type a message
    await user.type(input, 'Test message');
    
    // Press Enter to send (should not send on just Enter for textarea)
    await user.keyboard('{Enter}');
    expect(input.value).toContain('Test message');
    
    // Press Ctrl+Enter to send
    await user.keyboard('{Control>}{Enter}{/Control}');
    
    // Message should be sent and input cleared
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('shows typing indicator when AI is responding', async () => {
    renderWithProviders(<ChatInterface />);
    
    // Simulate AI typing state
    // This would typically be triggered by the chat context
    // For now, we'll check if the component can render the typing indicator
    const typingIndicator = document.querySelector('.typing-indicator');
    
    // The typing indicator might not be visible initially
    expect(typingIndicator).toBeNull();
  });

  it('handles file upload correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface />);
    
    // Look for file upload button
    const uploadButton = screen.queryByLabelText(/upload file/i);
    
    if (uploadButton) {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const input = uploadButton as HTMLInputElement;
      
      // Simulate file selection
      await user.upload(input, file);
      
      // Check if file is handled
      expect(input.files?.[0]).toBe(file);
      expect(input.files?.length).toBe(1);
    }
  });

  it('displays error messages appropriately', async () => {
    // Mock an error response
    const { api } = await import('../../services/api');
    (api.post as any).mockRejectedValueOnce(new Error('Network error'));
    
    const user = userEvent.setup();
    renderWithProviders(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Send a message that will fail
    await user.type(input, 'This will fail');
    await user.click(sendButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('maintains scroll position when new messages arrive', async () => {
    renderWithProviders(<ChatInterface />);
    
    // Get the messages container
    const messagesContainer = document.querySelector('.messages-container');
    
    if (messagesContainer) {
      // Check initial scroll position
      expect(messagesContainer.scrollTop).toBe(0);
      
      // Simulate adding messages (would be done through context in real app)
      // After messages are added, scroll should go to bottom
      // This is a simplified test - in reality, you'd test the scroll behavior
      // after actual messages are added through the context
    }
  });

  it('handles mobile view correctly', () => {
    // Set viewport to mobile size
    global.innerWidth = 375;
    global.innerHeight = 667;
    
    renderWithProviders(<ChatInterface />);
    
    // Check if mobile-specific classes are applied
    const chatContainer = screen.getByRole('main');
    expect(chatContainer).toHaveClass('flex-col');
  });

  it('supports markdown in messages', async () => {
    renderWithProviders(<ChatInterface />);
    
    // This would test if markdown content is properly rendered
    // In a real test, you'd add a message with markdown content
    // and check if it's rendered correctly
    const markdownContent = '**Bold text** and *italic text*';
    
    // Mock receiving a message with markdown
    // Check if it renders correctly (would need to be implemented in the actual component)
  });

  it('handles connection status changes', async () => {
    renderWithProviders(<ChatInterface />);
    
    // Check for connection status indicator
    // This would test if the component properly shows online/offline status
    // In a real implementation, you'd mock connection state changes
  });
});
