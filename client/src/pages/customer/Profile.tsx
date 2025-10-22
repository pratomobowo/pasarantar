import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { customerApi } from '../../services/customerApi';
import { Customer, CustomerSocialAccount } from 'shared/dist/types';

export default function CustomerProfile() {
  const { customer, updateProfile } = useCustomerAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    coordinates: ''
  });
  
  const [socialAccounts, setSocialAccounts] = useState<CustomerSocialAccount[]>([]);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        whatsapp: customer.whatsapp || '',
        address: customer.address || '',
        coordinates: customer.coordinates || ''
      });
    }
    loadSocialAccounts();
  }, [customer]);

  const loadSocialAccounts = async () => {
    try {
      const response = await customerApi.getCurrentCustomer();
      if (response.success && response.data?.socialAccounts) {
        setSocialAccounts(response.data.socialAccounts);
      }
    } catch (error) {
      console.error('Error loading social accounts:', error);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Browser Anda tidak mendukung fitur geolokasi' });
      return;
    }

    setIsGettingLocation(true);
    setMessage(null);

    // Try with high accuracy first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleSetCoordinates(latitude, longitude);
        setIsGettingLocation(false);
        setMessage({ type: 'success', text: 'Koordinat berhasil diperoleh!' });
      },
      (error) => {
        console.error('Error getting location with high accuracy:', error);
        
        // Try again with lower accuracy settings
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            handleSetCoordinates(latitude, longitude);
            setIsGettingLocation(false);
            setMessage({ type: 'success', text: 'Koordinat berhasil diperoleh!' });
          },
          (fallbackError) => {
            console.error('Error getting location with fallback:', fallbackError);
            setIsGettingLocation(false);
            
            let errorMessage = 'Gagal mendapatkan lokasi. ';
            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                errorMessage += 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda dan refresh halaman.';
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                errorMessage += 'Informasi lokasi tidak tersedia. Pastikan GPS Anda aktif atau coba lagi di area dengan sinyal lebih baik.';
                break;
              case fallbackError.TIMEOUT:
                errorMessage += 'Waktu habis untuk mendapatkan lokasi. Silakan coba lagi.';
                break;
              default:
                errorMessage += 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi atau masukkan koordinat secara manual.';
                break;
            }
            setMessage({ type: 'error', text: errorMessage });
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 600000 // 10 minutes
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleSetCoordinates = (latitude: number, longitude: number) => {
    const coordinatesString = `${latitude},${longitude}`;
    setFormData(prev => ({
      ...prev,
      coordinates: coordinatesString
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const updateData: any = {};
      
      if (formData.name !== customer?.name) {
        updateData.name = formData.name;
      }
      if (formData.whatsapp !== customer?.whatsapp) {
        updateData.whatsapp = formData.whatsapp || undefined;
      }
      if (formData.address !== customer?.address) {
        updateData.address = formData.address || undefined;
      }
      if (formData.coordinates !== customer?.coordinates) {
        updateData.coordinates = formData.coordinates || undefined;
      }
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: 'Tidak ada perubahan untuk disimpan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memperbarui profil. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        whatsapp: customer.whatsapp || '',
        address: customer.address || '',
        coordinates: customer.coordinates || ''
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const handleLinkSocial = (provider: 'google' | 'facebook') => {
    // TODO: Implement social account linking
    console.log(`Link ${provider} account not implemented yet`);
  };

  const handleUnlinkSocial = async (provider: string) => {
    try {
      const response = await customerApi.unlinkSocialAccount(provider);
      if (response.success) {
        setMessage({ type: 'success', text: `Akun ${provider} berhasil dilepas` });
        loadSocialAccounts();
      } else {
        setMessage({ type: 'error', text: response.message || 'Gagal melepaskan akun' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal melepaskan akun' });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600">Kelola informasi pribadi Anda</p>
        </div>
        <Link
          to="/customer/dashboard"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center"
        >
          Kembali ke Dashboard
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-center -mt-16">
            <div className="relative">
              {customer?.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt={customer.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-orange-100 rounded-full border-4 border-white flex items-center justify-center">
                  <User size={48} className="text-orange-600" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                <Camera size={16} className="text-gray-600" />
              </button>
            </div>
            <div className="ml-6 mt-16">
              <h2 className="text-2xl font-bold text-gray-900">{customer?.name}</h2>
              <p className="text-gray-600">{customer?.email}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  customer?.emailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {customer?.emailVerified ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      Terverifikasi
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} className="mr-1" />
                      Belum Terverifikasi
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
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

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Informasi Pribadi</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`pl-10 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="pl-10 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Email tidak dapat diubah</p>
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp <span className="text-gray-500">(opsional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`pl-10 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                }`}
                placeholder="08123456789"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat <span className="text-gray-500">(opsional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                <MapPin size={18} className="text-gray-400" />
              </div>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`pl-10 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                }`}
                placeholder="Masukkan alamat lengkap"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div>
            <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700 mb-1">
              Koordinat <span className="text-gray-500">(opsional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="coordinates"
                name="coordinates"
                value={formData.coordinates}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`block w-full px-3 py-2 pr-24 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                  !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                }`}
                placeholder="-6.2088, 106.8456"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="absolute right-2 top-2 bg-orange-100 text-orange-600 hover:bg-orange-200 disabled:bg-gray-100 disabled:text-gray-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center"
                >
                  {isGettingLocation ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mendeteksi...
                    </>
                  ) : (
                    <>
                      <Navigation size={12} className="mr-1" />
                      Lokasi Saya
                    </>
                  )}
                </button>
              )}
            </div>
            {isEditing && (
              <p className="mt-1 text-xs text-gray-500">
                Klik "Lokasi Saya" untuk mendapatkan titik koordinat dari GPS Anda saat ini.
                Jika gagal, Anda bisa memasukkan koordinat secara manual (format: latitude, longitude)
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
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
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Edit Profil
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Social Accounts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Akun Sosial Media</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Hubungkan akun sosial media Anda untuk login lebih cepat dan mudah.
          </div>
          
          {/* Google */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              {getProviderIcon('google')}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Google</p>
                <p className="text-xs text-gray-500">
                  {socialAccounts.some(acc => acc.provider === 'google') 
                    ? 'Terhubung' 
                    : 'Belum terhubung'
                  }
                </p>
              </div>
            </div>
            {socialAccounts.some(acc => acc.provider === 'google') ? (
              <button
                onClick={() => handleUnlinkSocial('google')}
                className="px-3 py-1 text-sm border border-red-300 rounded-md text-red-600 hover:bg-red-50"
              >
                Lepas
              </button>
            ) : (
              <button
                onClick={() => handleLinkSocial('google')}
                className="px-3 py-1 text-sm border border-orange-300 rounded-md text-orange-600 hover:bg-orange-50"
              >
                Hubungkan
              </button>
            )}
          </div>
          
          {/* Facebook */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              {getProviderIcon('facebook')}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Facebook</p>
                <p className="text-xs text-gray-500">
                  {socialAccounts.some(acc => acc.provider === 'facebook') 
                    ? 'Terhubung' 
                    : 'Belum terhubung'
                  }
                </p>
              </div>
            </div>
            {socialAccounts.some(acc => acc.provider === 'facebook') ? (
              <button
                onClick={() => handleUnlinkSocial('facebook')}
                className="px-3 py-1 text-sm border border-red-300 rounded-md text-red-600 hover:bg-red-50"
              >
                Lepas
              </button>
            ) : (
              <button
                onClick={() => handleLinkSocial('facebook')}
                className="px-3 py-1 text-sm border border-orange-300 rounded-md text-orange-600 hover:bg-orange-50"
              >
                Hubungkan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}