import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import Toast, { ToastProps } from '../components/admin/Toast';

interface ToastState extends Omit<ToastProps, 'onClose'> {
  id: string;
  show: boolean;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastState, 'id'>) => void;
  hideToast: (id: string) => void;
  success: (title: string, message?: string, position?: ToastProps['position']) => void;
  error: (title: string, message?: string, position?: ToastProps['position']) => void;
  warning: (title: string, message?: string, position?: ToastProps['position']) => void;
  info: (title: string, message?: string, position?: ToastProps['position']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ToastAction =
  | { type: 'SHOW_TOAST'; payload: ToastState }
  | { type: 'HIDE_TOAST'; payload: string }
  | { type: 'REMOVE_TOAST'; payload: string };

const toastReducer = (state: ToastState[], action: ToastAction): ToastState[] => {
  switch (action.type) {
    case 'SHOW_TOAST':
      return [...state, { ...action.payload, id: Date.now().toString(), show: true }];
    case 'HIDE_TOAST':
      return state.map((toast) =>
        toast.id === action.payload ? { ...toast, show: false } : toast
      );
    case 'REMOVE_TOAST':
      return state.filter((toast) => toast.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const showToast = (toast: Omit<ToastState, 'id'>) => {
    const toastId = Date.now().toString();
    dispatch({ type: 'SHOW_TOAST', payload: { ...toast, id: toastId, show: true } as ToastState });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'HIDE_TOAST', payload: toastId });
    }, toast.duration || 5000);
  };

  const hideToast = (id: string) => {
    dispatch({ type: 'HIDE_TOAST', payload: id });
    // Remove the toast after the animation completes (300ms)
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 300);
  };

  // Convenience methods
  const success = (title: string, message?: string, position?: ToastProps['position']) => {
    showToast({ title, message, type: 'success', position });
  };

  const error = (title: string, message?: string, position?: ToastProps['position']) => {
    showToast({ title, message, type: 'error', position });
  };

  const warning = (title: string, message?: string, position?: ToastProps['position']) => {
    showToast({ title, message, type: 'warning', position });
  };

  const info = (title: string, message?: string, position?: ToastProps['position']) => {
    showToast({ title, message, type: 'info', position });
  };

  const value: ToastContextType = {
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container - Now empty as each Toast handles its own positioning */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          show={toast.show}
          onClose={() => hideToast(toast.id)}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          position={toast.position}
          duration={toast.duration}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};