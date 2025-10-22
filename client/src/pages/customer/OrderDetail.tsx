import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Star,
  MessageSquare,
  Repeat,
  X
} from 'lucide-react';
import { OrderWithItems, OrderStatus } from 'shared/dist/types';
import { customerApi } from '../../services/customerApi';
import { reviewApi } from '../../services/reviewApi';
import { formatPrice } from '../../utils/formatters';
import ReviewForm from '../../components/customer/ReviewForm';

const statusConfig = {
  pending: {
    label: 'Menunggu Konfirmasi',
    color: 'yellow',
    icon: Clock,
    description: 'Pesanan baru menunggu konfirmasi dari admin',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'blue',
    icon: CheckCircle,
    description: 'Pesanan telah dikonfirmasi dan akan diproses',
  },
  processing: {
    label: 'Diproses',
    color: 'purple',
    icon: AlertCircle,
    description: 'Pesanan sedang disiapkan untuk pengiriman',
  },
  delivered: {
    label: 'Terkirim',
    color: 'green',
    icon: CheckCircle,
    description: 'Pesanan telah dikirim ke pelanggan',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'red',
    icon: XCircle,
    description: 'Pesanan telah dibatalkan',
  },
};

export default function CustomerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await customerApi.getOrder(orderId);
      
      if (response.success && response.data) {
        setOrder(response.data);
        
        // Check which items have been reviewed
        if (response.data.status === 'delivered' && response.data.orderItems) {
          const reviewedSet = new Set<string>();
          
          for (const item of response.data.orderItems) {
            try {
              const reviewResponse = await reviewApi.checkReviewExists(item.productId, orderId);
              if (reviewResponse.success && reviewResponse.exists) {
                reviewedSet.add(item.id);
              }
            } catch (error) {
              console.error('Error checking review status:', error);
            }
          }
          
          setReviewedItems(reviewedSet);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') return;
    
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Pesanan yang sudah dibatalkan tidak dapat dikembalikan.')) {
      return;
    }
    
    try {
      setCancelling(true);
      const response = await customerApi.cancelOrder(order.id);
      
      if (response.success) {
        // Refresh order data to show updated status
        await fetchOrder(order.id);
        alert('Pesanan berhasil dibatalkan');
      } else {
        alert(response.message || 'Gagal membatalkan pesanan');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Gagal membatalkan pesanan. Silakan coba lagi.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    
    try {
      // TODO: Implement reorder functionality
      // Create a new order with the same items
      const items = order.orderItems.map(item => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        notes: item.notes
      }));
      
      // Navigate to checkout with these items
      alert('Fitur pemesanan ulang akan segera tersedia');
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Gagal melakukan pemesanan ulang. Silakan coba lagi.');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.label}
      </div>
    );
  };

  const canCancelOrder = order && order.status === 'pending';
  const canReviewOrder = order && order.status === 'delivered';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Pesanan tidak ditemukan</h3>
        <Link
          to="/customer/orders"
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          Kembali ke daftar pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/customer/orders"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Kembali
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Detail Pesanan</h1>
            <p className="text-gray-600 text-sm sm:text-base">Nomor Pesanan: {order.orderNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert('Fitur download invoice akan segera tersedia')}
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Status Pesanan</h2>
              {getStatusBadge(order.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {statusConfig[order.status].description}
            </p>
            
            <div className="text-xs text-gray-500 mb-4">
              Terakhir diperbarui: {new Date(order.updatedAt).toLocaleString('id-ID')}
            </div>

            {/* Order Actions */}
            <div className="flex flex-wrap gap-2">
              {canCancelOrder && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs sm:text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  title="Pesanan hanya dapat dibatalkan saat status masih menunggu konfirmasi"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
                </button>
              )}
              
              <button
                onClick={handleReorder}
                className="inline-flex items-center px-3 py-1.5 border border-orange-300 rounded-md text-xs sm:text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Repeat className="h-4 w-4 mr-1" />
                Pesan Lagi
              </button>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Produk</h2>
            
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-start space-x-0 sm:space-x-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 gap-3">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={item.productImageUrl || `https://picsum.photos/seed/${item.productId}/80/80.jpg`}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-500">{item.productVariantWeight}</p>
                    <p className="text-sm font-bold text-orange-600">
                      {formatPrice(item.unitPrice)} x {item.quantity}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        Catatan: {item.notes}
                      </p>
                    )}
                    
                    {/* Review Button for Delivered Orders */}
                    {canReviewOrder && (
                      reviewedItems.has(item.id) ? (
                        <button
                          disabled
                          className="mt-2 inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-xs font-medium text-green-700 bg-green-50 cursor-not-allowed"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Sudah di Review
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setShowReviewForm(true);
                          }}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-orange-300 rounded-md text-xs font-medium text-orange-700 bg-white hover:bg-orange-50"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Beri Review
                        </button>
                      )
                    )}
                  </div>
                  
                  <div className="text-right sm:text-left mt-2 sm:mt-0">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pengiriman</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Nama Penerima</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                  <p className="text-sm text-gray-600">{order.customerWhatsapp}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Alamat Pengiriman</p>
                  <p className="text-sm text-gray-600">{order.customerAddress}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Truck className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Metode Pengiriman</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingMethod === 'express' ? 'PasarAntar Express' : 'Ambil di Workshop'}
                  </p>
                  {order.deliveryDay && (
                    <p className="text-xs text-gray-500">
                      Hari Pengiriman: {order.deliveryDay.charAt(0).toUpperCase() + order.deliveryDay.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Pengiriman</span>
                <span className="font-medium text-gray-900">
                  {order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Gratis'}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pembayaran</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Metode Pembayaran</p>
                  <p className="text-sm text-gray-600">
                    {order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'COD (Bayar di Tempat)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline Pesanan</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pesanan Dibuat</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              {order.updatedAt !== order.createdAt && (
                <div className="flex items-start space-x-3">
                  <RefreshCw className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Terakhir Diperbarui</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updatedAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Catatan Pesanan</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && selectedProduct && order && (
        <ReviewForm
          productId={selectedProduct.productId}
          orderId={order.id}
          productName={selectedProduct.productName}
          productVariant={selectedProduct.productVariantWeight}
          isOpen={showReviewForm}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedProduct(null);
          }}
          onReviewSubmitted={() => {
            // Refresh order data to show updated review status
            fetchOrder(order.id);
          }}
        />
      )}
    </div>
  );
}