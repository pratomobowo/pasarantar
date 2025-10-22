import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  ArrowLeft,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  XCircle,
  UserCircle,
  Facebook,
  Chrome,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { Customer } from 'shared/dist/types';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
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
            to="/admin/customers"
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pelanggan</h1>
            <p className="text-gray-600">Informasi lengkap pelanggan PasarAntar</p>
          </div>
        </div>
        <Link
          to={`/admin/customers/${customer.id}/edit`}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center"
        >
          <Edit className="h-5 w-5 mr-2" />
          Edit Pelanggan
        </Link>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            <div className="flex-shrink-0">
              {customer.avatarUrl ? (
                <img
                  className="h-24 w-24 rounded-full object-cover"
                  src={customer.avatarUrl}
                  alt={customer.name}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserCircle className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-0 sm:flex-1">
              <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <Mail className="h-4 w-4 mr-1" />
                {customer.email}
              </div>
              <div className="mt-2 flex items-center space-x-4">
                {customer.emailVerified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Email Terverifikasi
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Email Belum Terverifikasi
                  </span>
                )}
                {customer.provider && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {customer.provider === 'google' && <Chrome className="h-3 w-3 mr-1" />}
                    {customer.provider === 'facebook' && <Facebook className="h-3 w-3 mr-1" />}
                    {customer.provider}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Bergabung pada {new Date(customer.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Kontak</h3>
          <div className="space-y-4">
            {customer.whatsapp && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                  <p className="text-sm text-gray-600">{customer.whatsapp}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Alamat</p>
                  <p className="text-sm text-gray-600">{customer.address}</p>
                </div>
              </div>
            )}
            {customer.coordinates && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Koordinat</p>
                  <p className="text-sm text-gray-600">{customer.coordinates}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistik Pelanggan</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">Total Pesanan</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {customer.stats?.totalOrders || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">Total Pengeluaran</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                Rp {(customer.stats?.totalSpent || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Accounts */}
      {customer.socialAccounts && customer.socialAccounts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Akun Sosial Media Terhubung</h3>
          <div className="space-y-3">
            {customer.socialAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  {account.provider === 'google' && <Chrome className="h-5 w-5 text-blue-500 mr-3" />}
                  {account.provider === 'facebook' && <Facebook className="h-5 w-5 text-blue-600 mr-3" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{account.provider}</p>
                    <p className="text-xs text-gray-500">Terhubung pada {new Date(account.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Pesanan Terbaru</h3>
            <Link
              to={`/admin/orders?customer=${customer.id}`}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pesanan</h3>
            <p className="mt-1 text-sm text-gray-500">Pesanan dari pelanggan ini akan muncul di sini.</p>
          </div>
        </div>
      </div>
    </div>
  );
}