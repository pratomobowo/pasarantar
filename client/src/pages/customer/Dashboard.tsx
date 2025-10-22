import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  TrendingUp,
  Star,
  ArrowRight,
  Calendar,
  User
} from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { customerApi } from '../../services/customerApi';
import { OrderWithItems } from 'shared/dist/types';
import Pagination from '../../components/ui/Pagination';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
}

export default function CustomerDashboard() {
  const { customer } = useCustomerAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states for recent orders
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    loadDashboardData();
  }, [currentPage]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load recent orders
      const ordersResponse = await customerApi.getOrders({
        page: currentPage,
        limit: itemsPerPage
      });
      
      if (ordersResponse.success && ordersResponse.data) {
        const orders = ordersResponse.data.orders;
        setRecentOrders(orders);
        setTotalPages(ordersResponse.data.pagination?.totalPages || 1);
        setTotalCount(ordersResponse.data.pagination?.total || 0);
        
        // Calculate stats (load all orders for stats)
        const allOrdersResponse = await customerApi.getOrders({ limit: 100 });
        if (allOrdersResponse.success && allOrdersResponse.data) {
          const allOrders = allOrdersResponse.data.orders;
          const totalOrders = allOrders.length;
          const pendingOrders = allOrders.filter(order =>
            order.status === 'pending' || order.status === 'confirmed'
          ).length;
          const completedOrders = allOrders.filter(order =>
            order.status === 'delivered'
          ).length;
          const totalSpent = allOrders
            .filter(order => order.status !== 'cancelled')
            .reduce((sum, order) => sum + order.totalAmount, 0);
          
          setStats({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalSpent
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'confirmed':
        return <Package size={16} className="text-blue-500" />;
      case 'processing':
        return <Package size={16} className="text-purple-500" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'processing':
        return 'Diproses';
      case 'delivered':
        return 'Terkirim';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang kembali, {customer?.name}!</p>
        </div>
        <Link
          to="/"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center"
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          Belanja Sekarang
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">Semua waktu</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sedang Diproses</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-500 mt-1">Menunggu konfirmasi</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedOrders}</p>
              <p className="text-sm text-gray-500 mt-1">Pesanan selesai</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Belanja</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                Rp {stats.totalSpent.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-500 mt-1">Semua waktu</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h2>
            <Link
              to="/customer/orders"
              className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
            >
              Lihat Semua
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Pesanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.createdAt.toString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/customer/orders/${order.id}`}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pesanan</h3>
              <p className="mt-1 text-sm text-gray-500">Mulai belanja sekarang dan nikmati kemudahan berbelanja di PasarAntar.</p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Mulai Belanja
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Pagination for Recent Orders */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            showInfo={false}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 mr-4">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Belanja Lagi</h3>
              <p className="text-sm text-gray-600">Temukan produk terbaik</p>
            </div>
          </div>
        </Link>

        <Link
          to="/customer/orders"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 mr-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Riwayat Pesanan</h3>
              <p className="text-sm text-gray-600">Lihat semua pesanan</p>
            </div>
          </div>
        </Link>

        <Link
          to="/customer/profile"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 mr-4">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Update Profil</h3>
              <p className="text-sm text-gray-600">Kelola informasi akun</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}