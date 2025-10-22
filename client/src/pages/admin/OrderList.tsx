import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Eye,
  Filter,
  ChevronDown,
  Search,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Check,
  Edit3,
} from 'lucide-react';
import { Order } from 'shared/dist/types';
import { orderApi } from '../../services/orderApi';
import { formatPrice } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';

type OrderStatus = Order['status'];

const statusConfig = {
  pending: {
    label: 'Menunggu Konfirmasi',
    color: 'yellow',
    icon: Clock,
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'blue',
    icon: CheckCircle,
  },
  processing: {
    label: 'Diproses',
    color: 'purple',
    icon: AlertCircle,
  },
  delivered: {
    label: 'Terkirim',
    color: 'green',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'red',
    icon: XCircle,
  },
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [shippingFilter, setShippingFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showPaymentFilter, setShowPaymentFilter] = useState(false);
  const [showShippingFilter, setShowShippingFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{ orderId: string; status: OrderStatus } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, paymentFilter, shippingFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      if (paymentFilter) {
        params.paymentMethod = paymentFilter;
      }
      
      if (shippingFilter) {
        params.shippingMethod = shippingFilter;
      }
      
      if (dateFilter) {
        params.dateFilter = dateFilter;
      }

      const response = await orderApi.getOrders(params);
      
      if (response.success && response.data) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    // Show confirmation modal instead of directly updating
    setPendingStatus({ orderId, status: newStatus });
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatus) return;
    
    try {
      const response = await orderApi.updateOrderStatus(pendingStatus.orderId, pendingStatus.status);
      
      if (response.success) {
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === pendingStatus.orderId ? { ...order, status: pendingStatus.status } : order
          )
        );
        setShowConfirmModal(false);
        setPendingStatus(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const cancelStatusUpdate = () => {
    setShowConfirmModal(false);
    setPendingStatus(null);
  };

  const getConfirmationMessage = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          title: 'Konfirmasi Pesanan',
          message: 'Apakah Anda yakin ingin mengkonfirmasi pesanan ini? Pesanan akan berpindah ke status "Dikonfirmasi" dan siap untuk diproses.',
          icon: CheckCircle,
          iconColor: 'text-blue-500',
          confirmText: 'Ya, Konfirmasi'
        };
      case 'processing':
        return {
          title: 'Proses Pesanan',
          message: 'Apakah Anda yakin ingin memproses pesanan ini? Pesanan akan berpindah ke status "Diproses" dan sedang disiapkan untuk pengiriman.',
          icon: AlertCircle,
          iconColor: 'text-purple-500',
          confirmText: 'Ya, Proses'
        };
      case 'delivered':
        return {
          title: 'Tandai Terkirim',
          message: 'Apakah Anda yakin ingin menandai pesanan ini sebagai terkirim? Pesanan akan berpindah ke status "Terkirim" dan dianggap selesai.',
          icon: CheckCircle,
          iconColor: 'text-green-500',
          confirmText: 'Ya, Tandai Terkirim'
        };
      case 'cancelled':
        return {
          title: 'Batalkan Pesanan',
          message: 'Apakah Anda yakin ingin membatalkan pesanan ini? Pesanan akan berpindah ke status "Dibatalkan" dan tidak dapat dipulihkan.',
          icon: XCircle,
          iconColor: 'text-red-500',
          confirmText: 'Ya, Batalkan'
        };
      default:
        return {
          title: 'Update Status',
          message: 'Apakah Anda yakin ingin mengubah status pesanan ini?',
          icon: AlertCircle,
          iconColor: 'text-gray-500',
          confirmText: 'Ya, Update'
        };
    }
  };
  
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };
  
  const handleSelectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };
  
  const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
    if (selectedOrders.length === 0) return;
    
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status ${selectedOrders.length} pesanan menjadi ${statusConfig[newStatus].label}?`)) {
      return;
    }
    
    try {
      setProcessing(true);
      
      // Update each order status
      const updatePromises = selectedOrders.map(orderId =>
        orderApi.updateOrderStatus(orderId, newStatus)
      );
      
      await Promise.all(updatePromises);
      
      // Refresh orders
      fetchOrders();
      setSelectedOrders([]);
      
      alert(`Berhasil mengubah status ${selectedOrders.length} pesanan`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Gagal mengubah status pesanan. Silakan coba lagi.');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleExportOrders = () => {
    if (selectedOrders.length === 0) {
      alert('Silakan pilih pesanan yang ingin diekspor');
      return;
    }
    
    // Get selected orders
    const selectedOrderData = orders.filter(order => selectedOrders.includes(order.id));
    
    // Convert to JSON and download
    const dataStr = JSON.stringify(selectedOrderData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `orders-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerWhatsapp.includes(searchTerm)
  );

  const getStatusBadge = (status: OrderStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-600 text-sm sm:text-base">Kelola semua pesanan yang masuk</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Cari nomor pesanan, nama pelanggan..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusFilter(!showStatusFilter)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Status: {statusFilter ? statusConfig[statusFilter].label : 'Semua'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {showStatusFilter && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setShowStatusFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Semua Status
                  </button>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as OrderStatus);
                        setShowStatusFilter(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Payment Method Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPaymentFilter(!showPaymentFilter)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pembayaran: {paymentFilter === 'transfer' ? 'Transfer' : paymentFilter === 'cod' ? 'COD' : 'Semua'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {showPaymentFilter && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setPaymentFilter('');
                      setShowPaymentFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Semua Metode
                  </button>
                  <button
                    onClick={() => {
                      setPaymentFilter('transfer');
                      setShowPaymentFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Transfer Bank
                  </button>
                  <button
                    onClick={() => {
                      setPaymentFilter('cod');
                      setShowPaymentFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    COD
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Shipping Method Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowShippingFilter(!showShippingFilter)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Truck className="h-4 w-4 mr-2" />
              Pengiriman: {shippingFilter === 'express' ? 'Express' : shippingFilter === 'pickup' ? 'Ambil' : 'Semua'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {showShippingFilter && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShippingFilter('');
                      setShowShippingFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Semua Metode
                  </button>
                  <button
                    onClick={() => {
                      setShippingFilter('express');
                      setShowShippingFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    PasarAntar Express
                  </button>
                  <button
                    onClick={() => {
                      setShippingFilter('pickup');
                      setShowShippingFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Ambil di Workshop
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Date Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Tanggal: {dateFilter === 'today' ? 'Hari Ini' : dateFilter === 'week' ? 'Minggu Ini' : dateFilter === 'month' ? 'Bulan Ini' : 'Semua'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {showDateFilter && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDateFilter('');
                      setShowDateFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Semua Tanggal
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('today');
                      setShowDateFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('week');
                      setShowDateFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Minggu Ini
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('month');
                      setShowDateFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Bulan Ini
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Clear Filters Button */}
          {(statusFilter || paymentFilter || shippingFilter || dateFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setPaymentFilter('');
                setShippingFilter('');
                setDateFilter('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOrders.length === orders.length}
                onChange={handleSelectAllOrders}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded mr-3"
              />
              <span className="text-sm font-medium text-blue-900">
                {selectedOrders.length} pesanan dipilih
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportOrders}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              
              {selectedOrders.every(order => order.status === 'pending') && (
                <button
                  onClick={() => handleBulkStatusUpdate('confirmed')}
                  disabled={processing}
                  className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Konfirmasi
                </button>
              )}
              
              {selectedOrders.every(order => order.status === 'confirmed') && (
                <button
                  onClick={() => handleBulkStatusUpdate('processing')}
                  disabled={processing}
                  className="inline-flex items-center px-3 py-1.5 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  <Truck className="h-4 w-4 mr-1" />
                  Proses
                </button>
              )}
              
              {selectedOrders.every(order => order.status === 'processing') && (
                <button
                  onClick={() => handleBulkStatusUpdate('delivered')}
                  disabled={processing}
                  className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Tandai Terkirim
                </button>
              )}
              
              {selectedOrders.every(order => ['pending', 'confirmed'].includes(order.status)) && (
                <button
                  onClick={() => handleBulkStatusUpdate('cancelled')}
                  disabled={processing}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Batalkan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={handleSelectAllOrders}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Pesanan
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Total
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Pembayaran
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Tanggal
                  </th>
                  <th className="relative px-3 sm:px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''} hover:bg-gray-50`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.shippingMethod === 'express' ? 'Express' : 'Ambil'}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerWhatsapp}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center text-sm text-gray-900">
                        <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                        {order.paymentMethod === 'transfer' ? 'Transfer' : 'COD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        {/* Quick Status Actions */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Konfirmasi"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'processing')}
                            className="text-purple-600 hover:text-purple-900"
                            title="Proses"
                          >
                            <Truck className="h-4 w-4" />
                          </button>
                        )}
                        
                        {order.status === 'processing' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                            className="text-green-600 hover:text-green-900"
                            title="Tandai Terkirim"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Batalkan"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pesanan</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? 'Tidak ada pesanan yang cocok dengan filter yang dipilih.'
                : 'Belum ada pesanan yang masuk.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Menampilkan {((currentPage - 1) * 10) + 1} hingga {Math.min(currentPage * 10, filteredOrders.length)} dari {totalCount} pesanan
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={cancelStatusUpdate}
        size="sm"
      >
        {pendingStatus && (() => {
          const confirmation = getConfirmationMessage(pendingStatus.status);
          const Icon = confirmation.icon;
          
          return (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Icon className={`h-6 w-6 ${confirmation.iconColor}`} />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {confirmation.title}
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                {confirmation.message}
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelStatusUpdate}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Batal
                </button>
                
                <button
                  onClick={confirmStatusUpdate}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Memproses...
                    </>
                  ) : (
                    confirmation.confirmText
                  )}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}