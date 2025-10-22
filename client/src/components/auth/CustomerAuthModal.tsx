import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { SocialLoginButtons } from './SocialLoginButtons';
import { offerToSaveCredentials, getSavedCredentials } from '../../utils/credentialManager';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register' | 'forgotPassword';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgotPassword'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successAction, setSuccessAction] = useState<'login' | 'register' | 'forgotPassword'>('login');
  
  const { login, register, isAuthenticated, isLoading, error, clearError } = useCustomerAuth();
  
  // Form data for login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Form data for registration
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: ''
  });
  
  // Form data for forgot password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Ref to track credential request state to prevent multiple requests
  const credentialRequestRef = useRef(false);

  // Show success message and close modal if user is authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      setShowSuccessMessage(true);
      // Close modal after showing success message
      const timer = setTimeout(() => {
        onClose();
        setShowSuccessMessage(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Reset form data when modal opens and try to auto-fill credentials
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialView);
      setLoginData({ email: '', password: '' });
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '', whatsapp: '' });
      setValidationErrors({});
      // Only clear error if there is one
      if (error) {
        clearError();
      }
      
      // Try to auto-fill login credentials if it's the login tab
      if (initialView === 'login') {
        handleAutoFillCredentials();
      }
    }
  }, [isOpen, initialView]);

  // Clear error when error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Function to auto-fill credentials from browser's password manager
  const handleAutoFillCredentials = async () => {
    // Skip if already requesting credentials or submitting
    if (credentialRequestRef.current || isSubmitting) return;
    
    credentialRequestRef.current = true;
    
    try {
      const savedCredentials = await getSavedCredentials();
      if (savedCredentials) {
        setLoginData({
          email: savedCredentials.id,
          password: savedCredentials.password
        });
      }
    } catch (error) {
      console.log('No saved credentials found or error retrieving them');
    } finally {
      credentialRequestRef.current = false;
    }
  };

  const validateRegistrationForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!registerData.name.trim()) {
      errors.name = 'Nama lengkap harus diisi';
    } else if (registerData.name.trim().length < 2) {
      errors.name = 'Nama minimal 2 karakter';
    }

    if (!registerData.email.trim()) {
      errors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!registerData.password) {
      errors.password = 'Password harus diisi';
    } else if (registerData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }

    if (!registerData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Password tidak cocok';
    }

    if (registerData.whatsapp && !/^08[0-9]{9,12}$/.test(registerData.whatsapp.replace(/[^0-9]/g, ''))) {
      errors.whatsapp = 'Format nomor WhatsApp tidak valid (contoh: 08123456789)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      return;
    }

    setIsSubmitting(true);
    setSuccessAction('login');
    
    try {
      await login(loginData.email, loginData.password);
      
      // Offer to save credentials after successful login
      offerToSaveCredentials(loginData.email, loginData.password, loginData.email);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegistrationForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessAction('register');
    
    try {
      await register(
        registerData.name.trim(),
        registerData.email.trim(),
        registerData.password,
        registerData.whatsapp.trim() || undefined
      );
      
      // Offer to save credentials after successful registration
      offerToSaveCredentials(registerData.email.trim(), registerData.password, registerData.name.trim());
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordData.email) {
      return;
    }

    setIsSubmitting(true);
    setSuccessAction('forgotPassword');
    
    try {
      // Call API to request password reset
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/customers/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordData.email }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        console.log('Password reset email sent successfully');
        // Reset form after success
        setForgotPasswordData({ email: '' });
      } else {
        // Handle error - could be shown in UI
        console.error('Failed to send password reset email:', result.message);
      }
    } catch (error) {
      console.error('Error sending password reset request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth flow
    console.log('Google login not implemented yet');
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth flow
    console.log('Facebook login not implemented yet');
  };

  return (
    <div className="w-full">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successAction === 'login' ? 'Anda berhasil masuk!' : 'Anda berhasil mendaftar!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex-1 py-2 px-1 text-center border-b-2 font-medium text-sm ${
            activeTab === 'login'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => {
            setActiveTab('login');
            handleAutoFillCredentials();
          }}
        >
          Masuk
        </button>
        <button
          className={`flex-1 py-2 px-1 text-center border-b-2 font-medium text-sm ${
            activeTab === 'register'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('register')}
        >
          Daftar
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={loginData.email}
                onChange={handleLoginChange}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={loginData.password}
                onChange={handleLoginChange}
                className="pl-10 pr-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              onClick={() => setActiveTab('forgotPassword')}
            >
              Lupa password?
            </button>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !loginData.email || !loginData.password}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Masuk...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </div>
        </form>
      ) : activeTab === 'forgotPassword' ? (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Lupa Password</h3>
            <p className="text-sm text-gray-500 mt-1">
              Masukkan email Anda dan kami akan kirimkan link untuk mengatur ulang password
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={forgotPasswordData.email}
                onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !forgotPasswordData.email}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kirim...
                </div>
              ) : (
                'Kirim Link Reset'
              )}
            </button>
          </div>

          {/* Back to Login Link */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              onClick={() => setActiveTab('login')}
            >
              Kembali ke Login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={registerData.name}
                onChange={handleRegisterChange}
                className={`pl-10 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
            </div>
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={registerData.email}
                onChange={handleRegisterChange}
                className={`pl-10 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="nama@email.com"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* WhatsApp Field */}
          <div>
            <label htmlFor="register-whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp <span className="text-gray-500">(opsional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                id="register-whatsapp"
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                value={registerData.whatsapp}
                onChange={handleRegisterChange}
                className={`pl-10 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  validationErrors.whatsapp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="08123456789"
              />
            </div>
            {validationErrors.whatsapp && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.whatsapp}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={registerData.password}
                onChange={handleRegisterChange}
                className={`pl-10 pr-10 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className={`pl-10 pr-10 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mendaftar...
                </div>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Social Login - Common for both tabs */}
      <div className="mt-6">
        <SocialLoginButtons
          onGoogleLogin={handleGoogleLogin}
          onFacebookLogin={handleFacebookLogin}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};