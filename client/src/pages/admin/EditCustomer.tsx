import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { Customer } from 'shared/dist/types';

export default function EditCustomer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    address: '',
    coordinates: '',
  });

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminApi.getCustomer(customerId);
      
      if (response.success && response.data) {
        setCustomer(response.data);
        setFormData({
          name: response.data.name || '',
          whatsapp: response.data.whatsapp || '',
          address: response.data.address || '',
          coordinates: response.data.coordinates || '',
        });
      } else {
        setError(response.message || 'Failed to fetch customer');
      }
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('An error occurred while fetching customer');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) return;
    
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Only include fields that have changed
      const updateData: any = {};
      
      if (formData.name !== customer.name) {
        updateData.name = formData.name;
      }
      if (formData.whatsapp !== customer.whatsapp) {
        updateData.whatsapp = formData.whatsapp || null;
      }
      if (formData.address !== customer.address) {
        updateData.address = formData.address || null;
      }
      if (formData.coordinates !== customer.coordinates) {
        updateData.coordinates = formData.coordinates || null;
      }
      
      if (Object.keys(updateData).length === 0) {
        setSuccessMessage('Tidak ada perubahan untuk disimpan');
        setSaving(false);
        return;
      }
      
      const response = await adminApi.updateCustomer(customer.id, updateData);
      
      if (response.success) {
        setSuccessMessage('Data pelanggan berhasil diperbarui');
        // Update the customer data with the response
        if (response.data) {
          setCustomer(response.data);
        }
      } else {
        setError(response.message || 'Failed to update customer');
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      setError('An error occurred while updating customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Pelanggan tidak ditemukan</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              to="/admin/customers"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Kembali ke Daftar Pelanggan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/admin/customers/${id}`}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Pelanggan</h1>
            <p className="text-gray-600">Perbarui informasi pelanggan PasarAntar</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={customer?.email || ''}
                disabled
                className="pl-10 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 bg-gray-50 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Email tidak dapat diubah</p>
          </div>

          {/* WhatsApp Field */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp <span className="text-gray-500">(opsional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="08123456789"
              />
            </div>
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat <span className="text-gray-500">(opsional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Masukkan alamat lengkap"
              />
            </div>
          </div>

          {/* Coordinates Field */}
          <div>
            <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700 mb-1">
              Koordinat <span className="text-gray-500">(opsional)</span>
            </label>
            <input
              type="text"
              id="coordinates"
              name="coordinates"
              value={formData.coordinates}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="-6.2088, 106.8456"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              to={`/admin/customers/${id}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}