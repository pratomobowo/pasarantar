import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Home,
  Building,
  Package,
  Check,
  Phone,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { customerApi } from '../../services/customerApi';
import { CustomerAddress, CreateAddressRequest, UpdateAddressRequest } from 'shared/dist/types';
import Pagination from '../../components/ui/Pagination';

export default function CustomerAddresses() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState<CreateAddressRequest>({
    label: '',
    recipientName: '',
    phoneNumber: '',
    fullAddress: '',
    province: '',
    city: '',
    district: '',
    postalCode: '',
    coordinates: '',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, [currentPage]);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await customerApi.getAddresses({
        page: currentPage,
        limit: itemsPerPage
      });
      if (response.success && response.data) {
        setAddresses(response.data.addresses);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setMessage({ type: 'error', text: 'Gagal memuat alamat' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (editingAddress) {
        // Update existing address
        const updateData: UpdateAddressRequest = {
          label: formData.label,
          recipientName: formData.recipientName,
          phoneNumber: formData.phoneNumber,
          fullAddress: formData.fullAddress,
          province: formData.province,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
          coordinates: formData.coordinates || undefined,
          isDefault: formData.isDefault
        };

        const response = await customerApi.updateAddress(editingAddress.id, updateData);
        if (response.success) {
          setMessage({ type: 'success', text: 'Alamat berhasil diperbarui' });
          setShowAddForm(false);
          setEditingAddress(null);
          resetForm();
          loadAddresses();
        } else {
          setMessage({ type: 'error', text: response.message || 'Gagal memperbarui alamat' });
        }
      } else {
        // Create new address
        const response = await customerApi.createAddress(formData);
        if (response.success) {
          setMessage({ type: 'success', text: 'Alamat berhasil ditambahkan' });
          setShowAddForm(false);
          resetForm();
          loadAddresses();
        } else {
          setMessage({ type: 'error', text: response.message || 'Gagal menambahkan alamat' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      recipientName: address.recipientName,
      phoneNumber: address.phoneNumber,
      fullAddress: address.fullAddress,
      province: address.province,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
      coordinates: address.coordinates || '',
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      return;
    }

    try {
      const response = await customerApi.deleteAddress(addressId);
      if (response.success) {
        setMessage({ type: 'success', text: 'Alamat berhasil dihapus' });
        loadAddresses();
      } else {
        setMessage({ type: 'error', text: response.message || 'Gagal menghapus alamat' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await customerApi.setDefaultAddress(addressId);
      if (response.success) {
        setMessage({ type: 'success', text: 'Alamat utama berhasil diperbarui' });
        loadAddresses();
      } else {
        setMessage({ type: 'error', text: response.message || 'Gagal mengatur alamat utama' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      recipientName: '',
      phoneNumber: '',
      fullAddress: '',
      province: '',
      city: '',
      district: '',
      postalCode: '',
      coordinates: '',
      isDefault: false
    });
    setEditingAddress(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    resetForm();
    setMessage(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'rumah':
        return <Home size={16} className="text-orange-600" />;
      case 'kantor':
        return <Building size={16} className="text-blue-600" />;
      case 'apartemen':
        return <Package size={16} className="text-purple-600" />;
      default:
        return <MapPin size={16} className="text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alamat Pengiriman</h1>
          <p className="text-gray-600">Kelola alamat pengiriman Anda</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Alamat
        </button>
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

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Label */}
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                  Label Alamat
                </label>
                <select
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                >
                  <option value="">Pilih Label</option>
                  <option value="Rumah">Rumah</option>
                  <option value="Kantor">Kantor</option>
                  <option value="Apartemen">Apartemen</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Recipient Name */}
              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Penerima
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    required
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Nama penerima"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="08123456789"
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="12345"
                />
              </div>

              {/* Province */}
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nama provinsi"
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Kota/Kabupaten
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nama kota/kabupaten"
                />
              </div>

              {/* District */}
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nama kecamatan"
                />
              </div>

              {/* Coordinates */}
              <div>
                <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700 mb-1">
                  Koordinat (Opsional)
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
            </div>

            {/* Full Address */}
            <div>
              <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                id="fullAddress"
                name="fullAddress"
                rows={3}
                value={formData.fullAddress}
                onChange={handleInputChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Masukkan alamat lengkap"
              />
            </div>

            {/* Set as Default */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                Jadikan sebagai alamat utama
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : (editingAddress ? 'Perbarui' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada alamat</h3>
            <p className="mt-1 text-sm text-gray-500">Tambahkan alamat pengiriman untuk memudahkan proses checkout.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tambah Alamat
              </button>
            </div>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getLabelIcon(address.label)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-medium text-gray-900">{address.label}</h3>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Check size={12} className="mr-1" />
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{address.recipientName}</p>
                    <p className="text-sm text-gray-600">{address.phoneNumber}</p>
                    <p className="text-sm text-gray-600 mt-1">{address.fullAddress}</p>
                    <p className="text-sm text-gray-600">
                      {address.district}, {address.city}, {address.province} {address.postalCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Jadikan alamat utama"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit alamat"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Hapus alamat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            className="mt-6"
          />
        )}
      </div>
    </div>
  );
}