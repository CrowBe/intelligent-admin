import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: string;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    ai: {
      personality: string;
      proactiveMode: boolean;
      autoSuggestions: boolean;
    };
    integrations: {
      autoConnect: boolean;
    };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token && refreshToken) {
      // TODO: Validate token and get user info
      // For now, set a mock authenticated state for development
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        businessName: 'Test Plumbing Co',
        businessType: 'plumbing',
        preferences: {
          notifications: { email: true, push: false, sms: false },
          ai: { personality: 'professional', proactiveMode: true, autoSuggestions: true },
          integrations: { autoConnect: false },
        },
      };
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: mockUser, token, refreshToken },
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // TODO: Implement actual API call
      // For now, mock successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        user: {
          id: '1',
          email,
          firstName: 'Test',
          lastName: 'User',
          businessName: 'Test Plumbing Co',
          businessType: 'plumbing',
          preferences: {
            notifications: { email: true, push: false, sms: false },
            ai: { personality: 'professional', proactiveMode: true, autoSuggestions: true },
            integrations: { autoConnect: false },
          },
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('refreshToken', mockResponse.refreshToken);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: mockResponse,
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        user: {
          id: '1',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          businessName: userData.businessName,
          businessType: userData.businessType,
          preferences: {
            notifications: { email: true, push: false, sms: false },
            ai: { personality: 'professional', proactiveMode: true, autoSuggestions: true },
            integrations: { autoConnect: false },
          },
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('refreshToken', mockResponse.refreshToken);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: mockResponse,
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}