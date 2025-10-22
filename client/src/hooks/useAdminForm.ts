import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { NotificationHelpers, formatErrorMessage } from '../utils/notificationUtils';

interface UseAdminFormOptions<T> {
  initialData?: T;
  onSubmit: (data: T) => Promise<{ success: boolean; message?: string }>;
  onSuccessMessage?: string;
  onSuccessRedirect?: string;
  validateForm?: (data: T) => string | null;
}

interface UseAdminFormReturn<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  loading: boolean;
  error: string | null;
  success: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setError: (error: string | null) => void;
  resetForm: () => void;
}

export function useAdminForm<T extends Record<string, any>>(
  defaultData: T,
  options: UseAdminFormOptions<T>
): UseAdminFormReturn<T> {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<T>(options.initialData || defaultData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (options.validateForm) {
      const validationError = options.validateForm(formData);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await options.onSubmit(formData);
      
      if (result.success) {
        setSuccess(true);
        if (options.onSuccessMessage) {
          const notification = NotificationHelpers.success('create', 'product', options.onSuccessMessage);
          showSuccess(notification.title, notification.message);
        }
        if (options.onSuccessRedirect) {
          setTimeout(() => {
            navigate(options.onSuccessRedirect!);
          }, 1000);
        }
      } else {
        const errorMessage = formatErrorMessage(result);
        setError(errorMessage);
        const notification = NotificationHelpers.error('create', 'product', errorMessage);
        showError(notification.title, notification.message);
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      const notification = NotificationHelpers.error('create', 'product', errorMessage);
      showError(notification.title, notification.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(options.initialData || defaultData);
    setError(null);
    setSuccess(false);
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
    setError,
    resetForm,
  };
}