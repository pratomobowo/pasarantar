import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  Edit3,
  Printer,
  FileText,
  MessageSquare,
  Save,
  History,
  Tag,
} from 'lucide-react';
import { OrderWithItems, OrderStatus } from 'shared/dist/types';
import { orderApi } from '../../services/orderApi';
import { formatPrice } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';

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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showNotesSection, setShowNotesSection] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);
  
  useEffect(() => {
    if (order && order.notes) {
      // Extract admin notes from order notes (assuming format: "Customer notes ||| Admin notes")
      const notesParts = order.notes.split('|||');
      if (notesParts.length > 1) {
        setAdminNotes(notesParts[1].trim());
        setShowNotesSection(true);
      }
    }
  }, [order]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await orderApi.getOrder(orderId);
      
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    // Show confirmation modal instead of directly updating
    setPendingStatus(newStatus);
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!order || !pendingStatus) return;
    
    try {
      setUpdating(true);
      const response = await orderApi.updateOrderStatus(order.id, pendingStatus);
      
      if (response.success) {
        setOrder({ ...order, status: pendingStatus });
        setShowConfirmModal(false);
        setPendingStatus(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
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
  
  const handleSaveAdminNotes = async () => {
    if (!order) return;
    
    try {
      setSavingNotes(true);
      
      // Combine customer notes and admin notes
      const customerNotes = order.notes && order.notes.includes('|||')
        ? order.notes.split('|||')[0].trim()
        : order.notes || '';
      
      const combinedNotes = customerNotes
        ? `${customerNotes} ||| ${adminNotes}`
        : `||| ${adminNotes}`;
      
      // TODO: Implement API to save admin notes
      // For now, just update local state
      setOrder({ ...order, notes: combinedNotes });
      
      alert('Catatan admin berhasil disimpan');
    } catch (error) {
      console.error('Error saving admin notes:', error);
      alert('Gagal menyimpan catatan admin');
    } finally {
      setSavingNotes(false);
    }
  };
  
  const handleExportOrder = () => {
    if (!order) return;
    
    // Create order data for export
    const orderData = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerWhatsapp: order.customerWhatsapp,
      customerAddress: order.customerAddress,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.orderItems.map(item => ({
        name: item.productName,
        variant: item.productVariantWeight,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes
      }))
    };
    
    // Convert to JSON and download
    const dataStr = JSON.stringify(orderData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `order-${order.orderNumber}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handlePrintOrder = () => {
    if (!order) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Pop-up diblokir. Silakan izinkan pop-up untuk fitur cetak.');
      return;
    }
    
    // Generate HTML for printing
    const printContent = `
      <html>
        <head>
          <title>Order ${order.orderNumber} - PasarAntar</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #f97316; }
            .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; font-size: 18px; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; }
            .status { background-color: #f3f4f6; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Detail Pesanan #${order.orderNumber}</h1>
            <p>PasarAntar - Platform Belanja Online</p>
          </div>
          
          <div class="section">
            <h2>Informasi Pelanggan</h2>
            <div class="item"><strong>Nama:</strong> ${order.customerName}</div>
            <div class="item"><strong>WhatsApp:</strong> ${order.customerWhatsapp}</div>
            <div class="item"><strong>Alamat:</strong> ${order.customerAddress}</div>
          </div>
          
          <div class="section">
            <h2>Informasi Pesanan</h2>
            <div class="item"><strong>Status:</strong> <span class="status">${statusConfig[order.status].label}</span></div>
            <div class="item"><strong>Tanggal:</strong> ${new Date(order.createdAt).toLocaleString('id-ID')}</div>
            <div class="item"><strong>Metode Pengiriman:</strong> ${order.shippingMethod === 'express' ? 'PasarAntar Express' : 'Ambil di Workshop'}</div>
            <div class="item"><strong>Metode Pembayaran:</strong> ${order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'COD (Bayar di Tempat)'}</div>
          </div>
          
          <div class="section">
            <h2>Detail Produk</h2>
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map(item => `
                  <tr>
                    <td>${item.productName} (${item.productVariantWeight})</td>
                    <td>${formatPrice(item.unitPrice)}</td>
                    <td>${item.quantity}</td>
                    <td>${formatPrice(item.totalPrice)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">Total: ${formatPrice(order.totalAmount)}</div>
          </div>
          
          ${order.notes ? `
          <div class="section">
            <h2>Catatan</h2>
            <p>${order.notes}</p>
          </div>
          ` : ''}
          
          <div class="section">
            <p><small>Dicetak pada ${new Date().toLocaleString('id-ID')}</small></p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  const getOrderTimeline = () => {
    if (!order) return [];
    
    const timeline = [
      {
        status: 'pending' as OrderStatus,
        label: 'Pesanan Dibuat',
        date: order.createdAt,
        completed: true,
        icon: Clock,
        color: 'yellow'
      }
    ];
    
    // Add status timeline based on current status
    if (order.status === 'confirmed' || order.status === 'processing' || order.status === 'delivered' || order.status === 'cancelled') {
      timeline.push({
        status: 'confirmed' as OrderStatus,
        label: 'Dikonfirmasi',
        date: order.updatedAt, // This should be actual confirmation date in a real implementation
        completed: true,
        icon: CheckCircle,
        color: 'blue'
      });
    }
    
    if (order.status === 'processing' || order.status === 'delivered') {
      timeline.push({
        status: 'processing' as OrderStatus,
        label: 'Diproses',
        date: order.updatedAt, // This should be actual processing date in a real implementation
        completed: true,
        icon: AlertCircle,
        color: 'purple'
      });
    }
    
    if (order.status === 'delivered') {
      timeline.push({
        status: 'delivered' as OrderStatus,
        label: 'Terkirim',
        date: order.updatedAt, // This should be actual delivery date in a real implementation
        completed: true,
        icon: CheckCircle,
        color: 'green'
      });
    }
    
    if (order.status === 'cancelled') {
      timeline.push({
        status: 'cancelled' as OrderStatus,
        label: 'Dibatalkan',
        date: order.updatedAt, // This should be actual cancellation date in a real implementation
        completed: true,
        icon: XCircle,
        color: 'red'
      });
    }
    
    // Add future steps that are not yet completed
    if (order.status === 'pending') {
      timeline.push(
        {
          status: 'confirmed' as OrderStatus,
          label: 'Menunggu Konfirmasi',
          date: null as any,
          completed: false,
          icon: CheckCircle,
          color: 'blue'
        },
        {
          status: 'processing' as OrderStatus,
          label: 'Menunggu Diproses',
          date: null as any,
          completed: false,
          icon: AlertCircle,
          color: 'purple'
        },
        {
          status: 'delivered' as OrderStatus,
          label: 'Menunggu Pengiriman',
          date: null as any,
          completed: false,
          icon: CheckCircle,
          color: 'green'
        }
      );
    }
    
    if (order.status === 'confirmed') {
      timeline.push(
        {
          status: 'processing' as OrderStatus,
          label: 'Menunggu Diproses',
          date: null as any,
          completed: false,
          icon: AlertCircle,
          color: 'purple'
        },
        {
          status: 'delivered' as OrderStatus,
          label: 'Menunggu Pengiriman',
          date: null as any,
          completed: false,
          icon: CheckCircle,
          color: 'green'
        }
      );
    }
    
    if (order.status === 'processing') {
      timeline.push({
        status: 'delivered' as OrderStatus,
        label: 'Menunggu Pengiriman',
        date: null as any,
        completed: false,
        icon: CheckCircle,
        color: 'green'
      });
    }
    
    return timeline;
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

  const getNextStatusOptions = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'pending':
        return ['confirmed', 'cancelled'];
      case 'confirmed':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['delivered'];
      default:
        return [];
    }
  };

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
          to="/admin/orders"
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
            to="/admin/orders"
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
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintOrder}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Printer className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
          
          <button
            onClick={handleExportOrder}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={() => setShowNotesSection(!showNotesSection)}
            className={`inline-flex items-center px-3 py-2 border rounded-lg shadow-sm text-xs sm:text-sm font-medium ${
              showNotesSection
                ? 'border-orange-300 text-orange-700 bg-orange-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Catatan Admin</span>
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
              <div className="flex items-center space-x-2">
                {getStatusBadge(order.status)}
                <button
                  onClick={() => fetchOrder(order.id)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {statusConfig[order.status].description}
            </p>
            
            <div className="text-xs text-gray-500 mb-4">
              Terakhir diperbarui: {new Date(order.updatedAt).toLocaleString('id-ID')}
            </div>

            {/* Status Actions */}
            {getNextStatusOptions(order.status).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {getNextStatusOptions(order.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {status === 'cancelled' ? (
                      <XCircle className="h-4 w-4 mr-1 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    )}
                    {status === 'confirmed' && 'Konfirmasi'}
                    {status === 'processing' && 'Proses'}
                    {status === 'delivered' && 'Tandai Terkirim'}
                    {status === 'cancelled' && 'Batalkan'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Nama</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
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
                  {order.customerCoordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      Koordinat: {order.customerCoordinates}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-gray-400 mr-3" />
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

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <History className="h-5 w-5 mr-2" />
              Timeline Pesanan
            </h2>
            
            <div className="space-y-4">
              {getOrderTimeline().map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed
                        ? `bg-${step.color}-100`
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        step.completed
                          ? `text-${step.color}-600`
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        step.completed
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(step.date).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Notes */}
          {showNotesSection && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Catatan Admin
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Tambah catatan internal (tidak terlihat oleh pelanggan)
                  </label>
                  <textarea
                    id="adminNotes"
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambah catatan tentang pesanan ini..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAdminNotes}
                    disabled={savingNotes}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {savingNotes ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Catatan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customer Notes */}
          {order.notes && order.notes.includes('|||') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Catatan Pelanggan
              </h2>
              <p className="text-sm text-gray-600">
                {order.notes.split('|||')[0].trim() || '-'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={cancelStatusUpdate}
        size="sm"
      >
        {pendingStatus && (() => {
          const confirmation = getConfirmationMessage(pendingStatus);
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
                  disabled={updating}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {updating ? (
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