import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { customerApi } from '../services/customerApi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Email harus diisi' });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Format email tidak valid' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await customerApi.requestPasswordReset({ email });
      
      if (response.success) {
        setIsSubmitted(true);
        setMessage({ 
          type: 'success', 
          text: 'Jika akun dengan email ini ada, link reset password telah dikirim ke email Anda.' 
        });
      } else {
        setMessage({ type: 'error', text: response.message || 'Terjadi kesalahan. Silakan coba lagi.' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (message) {
      setMessage(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex justify-center items-center">
            <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">PasarAntar</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Lupa Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                )}
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  to="/customer/login"
                  className="flex items-center text-sm text-orange-600 hover:text-orange-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Kembali ke Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Terkirim!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Kami telah mengirimkan link reset password ke email Anda. Silakan periksa inbox Anda dan ikuti instruksi untuk reset password.
              </p>
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Tidak menerima email? Periksa folder spam atau coba lagi.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setMessage(null);
                  }}
                  className="text-sm text-orange-600 hover:text-orange-500"
                >
                  Coba lagi
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/customer/login"
                  className="flex items-center justify-center text-sm text-orange-600 hover:text-orange-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Kembali ke Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Belum punya akun?{' '}
            <Link to="/customer/register" className="text-orange-600 hover:text-orange-500">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}