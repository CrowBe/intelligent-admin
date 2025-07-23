import React from 'react';
import { ChatProvider } from './contexts/ChatContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatInterface } from './components/chat/ChatInterface';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <div className="min-h-screen bg-gray-50">
          <ChatInterface />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;