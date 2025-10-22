import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Key,
  Smartphone,
  Mail
} from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { customerApi } from '../../services/customerApi';

export default function CustomerSecurity() {
  const { customer } = useCustomerAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Change password form state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setMessage({ type: 'error', text: 'Password saat ini harus diisi' });
      return false;
    }
    
    if (!passwordForm.newPassword) {
      setMessage({ type: 'error', text: 'Password baru harus diisi' });
      return false;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return false;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return false;
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setMessage({ type: 'error', text: 'Password baru tidak boleh sama dengan password saat ini' });
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await customerApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Password berhasil diubah!' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: response.message || 'Gagal mengubah password' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const strengthLevels = [
      { strength: 0, text: 'Sangat Lemah', color: 'bg-red-500' },
      { strength: 1, text: 'Lemah', color: 'bg-orange-500' },
      { strength: 2, text: 'Sedang', color: 'bg-yellow-500' },
      { strength: 3, text: 'Kuat', color: 'bg-blue-500' },
      { strength: 4, text: 'Sangat Kuat', color: 'bg-green-500' }
    ];
    
    return strengthLevels[strength];
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keamanan</h1>
          <p className="text-gray-600">Kelola pengaturan keamanan akun Anda</p>
        </div>
        <Link
          to="/customer/dashboard"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center"
        >
          Kembali ke Dashboard
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md ${
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

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 mr-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-600">Terlindungi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 mr-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Email</h3>
              <p className="text-sm text-gray-600">{customer?.emailVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 mr-4">
              <Smartphone className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Login Sosial</h3>
              <p className="text-sm text-gray-600">Tersedia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Key className="h-5 w-5 mr-2 text-gray-600" />
            Ubah Password
          </h3>
        </div>
        
        <form onSubmit={handleChangePassword} className="p-6 space-y-6">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Password Saat Ini
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordInputChange}
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Masukkan password saat ini"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Masukkan password baru"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {passwordForm.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Kekuatan Password</span>
                  <span className="text-xs font-medium text-gray-900">{passwordStrength.text}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <p className="mt-1 text-xs text-gray-500">
              Gunakan password minimal 6 karakter dengan kombinasi huruf besar, kecil, angka, dan simbol untuk keamanan terbaik.
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInputChange}
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Masukkan kembali password baru"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setMessage(null);
              }}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Tips Keamanan</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Gunakan password yang unik dan tidak mudah ditebak</li>
              <li>• Jangan berbagi password dengan siapa pun</li>
              <li>• Ganti password secara berkala untuk keamanan tambahan</li>
              <li>• Pastikan email Anda terverifikasi untuk pemulihan akun</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}