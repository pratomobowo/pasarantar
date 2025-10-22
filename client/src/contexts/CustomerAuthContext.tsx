import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Customer } from 'shared/dist/types';
import { customerApi } from '../services/customerApi';

interface CustomerAuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface CustomerAuthContextType extends CustomerAuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, whatsapp?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; whatsapp?: string; address?: string; coordinates?: string }) => Promise<void>;
  clearError: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

type CustomerAuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: Customer }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_PROFILE'; payload: Customer };

const customerAuthReducer = (state: CustomerAuthState, action: CustomerAuthAction): CustomerAuthState => {
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
        customer: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        customer: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        customer: null,
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
    case 'UPDATE_PROFILE':
      return {
        ...state,
        customer: action.payload,
      };
    default:
      return state;
  }
};

const initialState: CustomerAuthState = {
  customer: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(customerAuthReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = customerApi.getAuthToken();
      if (token) {
        try {
          const response = await customerApi.getCurrentCustomer();
          if (response.success && response.data) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
            customerApi.setCustomerUser(response.data);
          } else {
            dispatch({ type: 'LOGOUT' });
            customerApi.clearAuthToken();
          }
        } catch (error) {
          dispatch({ type: 'LOGOUT' });
          customerApi.clearAuthToken();
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await customerApi.login({ email, password });
      
      if (response.success && response.data) {
        customerApi.setAuthToken(response.data.token);
        customerApi.setCustomerUser(response.data.customer);
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.customer });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message || 'Login failed' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Network error occurred';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
    }
  };

  const register = async (name: string, email: string, password: string, whatsapp?: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await customerApi.register({ name, email, password, whatsapp });
      
      if (response.success && response.data) {
        customerApi.setAuthToken(response.data.token);
        customerApi.setCustomerUser(response.data.customer);
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.customer });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.message || 'Registration failed' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Network error occurred';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
    }
  };

  const logout = () => {
    customerApi.logout().catch(console.error); // Don't wait for logout API response
    customerApi.clearAuthToken();
    customerApi.clearCustomerUser();
    dispatch({ type: 'LOGOUT' });
    // Navigate to homepage after logout
    window.location.href = '/';
  };

  const updateProfile = async (data: { name?: string; whatsapp?: string; address?: string; coordinates?: string }) => {
    try {
      const response = await customerApi.updateProfile(data);
      
      if (response.success && response.data) {
        customerApi.setCustomerUser(response.data);
        dispatch({ type: 'UPDATE_PROFILE', payload: response.data });
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      // Don't dispatch error for profile updates, just log it
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: CustomerAuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};