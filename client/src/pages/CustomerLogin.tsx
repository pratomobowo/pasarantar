import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, User, Lock, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { SocialLoginButtons } from '../components/auth/SocialLoginButtons';
import { offerToSaveCredentials, getSavedCredentials } from '../utils/credentialManager';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isLoading, error, clearError } = useCustomerAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/customer/dashboard';
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, searchParams]);

  // Try to auto-fill credentials when component mounts
  useEffect(() => {
    const handleAutoFillCredentials = async () => {
      try {
        const savedCredentials = await getSavedCredentials();
        if (savedCredentials) {
          setFormData({
            email: savedCredentials.id,
            password: savedCredentials.password
          });
        }
      } catch (error) {
        console.log('No saved credentials found or error retrieving them');
      }
    };

    handleAutoFillCredentials();
  }, []);

  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.email, formData.password, error, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password);
      
      // Offer to save credentials after successful login
      offerToSaveCredentials(formData.email, formData.password, formData.email);
      
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error is handled by the auth context
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
            <span className="ml-1">Kembali</span>
          </Link>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Masuk ke Akun Anda
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link 
                to="/customer/register" 
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Daftar sekarang
              </Link>
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !formData.email || !formData.password}
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

          {/* Social Login */}
          <div className="mt-6">
            <SocialLoginButtons
              onGoogleLogin={handleGoogleLogin}
              onFacebookLogin={handleFacebookLogin}
              disabled={isSubmitting}
            />
          </div>

          {/* Forgot Password */}
          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-orange-600 hover:text-orange-500 font-medium"
            >
              Lupa password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}