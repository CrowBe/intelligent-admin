import React from 'react';
import ReactDOM from 'react-dom/client';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { AppAuthProvider } from './contexts/KindeAuthContext.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
import App from './App.tsx';
import kindeConfig from './config/kinde.ts';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KindeProvider
      clientId={kindeConfig.clientId}
      domain={kindeConfig.domain}
      redirectUri={kindeConfig.redirectUri}
      logoutUri={kindeConfig.logoutUri}
    >
      <AppAuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="intelligent-admin-theme">
          <App />
        </ThemeProvider>
      </AppAuthProvider>
    </KindeProvider>
  </React.StrictMode>,
);