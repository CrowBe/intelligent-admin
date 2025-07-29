export const kindeConfig = {
  clientId: import.meta.env.VITE_KINDE_CLIENT_ID,
  domain: import.meta.env.VITE_KINDE_DOMAIN,
  redirectUri: import.meta.env.VITE_KINDE_REDIRECT_URI,
  logoutUri: import.meta.env.VITE_KINDE_LOGOUT_URI,
};

// Validate configuration
const validateKindeConfig = () => {
  const required = ['clientId', 'domain', 'redirectUri', 'logoutUri'];
  const missing = required.filter(key => !kindeConfig[key as keyof typeof kindeConfig]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Kinde environment variables: ${missing.map(k => `VITE_KINDE_${k.toUpperCase()}`).join(', ')}`
    );
  }
};

// Initialize validation
validateKindeConfig();

export default kindeConfig;
