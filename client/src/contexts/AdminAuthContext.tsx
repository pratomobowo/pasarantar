import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Admin } from 'shared/dist/types';
import { adminApi } from '../services/adminApi';

interface AdminAuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AdminAuthContextType extends AdminAuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

type AdminAuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: Admin }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const adminAuthReducer = (state: AdminAuthState, action: AdminAuthAction): AdminAuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        admin: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        admin: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        admin: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AdminAuthState = {
  admin: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = adminApi.getAuthToken();
      if (token) {
        try {
          const response = await adminApi.getCurrentAdmin();
          if (response.success && response.data) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
          } else {
            dispatch({ type: 'LOGOUT' });
            adminApi.clearAuthToken();
          }
        } catch (error) {
          dispatch({ type: 'LOGOUT' });
          adminApi.clearAuthToken();
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await adminApi.login({ username, password });
      
      if (response.success && response.data) {
        adminApi.setAuthToken(response.data.token);
        localStorage.setItem('admin-user', JSON.stringify(response.data.admin));
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.admin });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message || 'Login failed' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Network error occurred';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
    }
  };

  const logout = () => {
    adminApi.logout().catch(console.error); // Don't wait for logout API response
    adminApi.clearAuthToken();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AdminAuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};