import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  Star,
  MessageSquare,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { orderApi } from '../../services/orderApi';
import { ProductWithVariants, Order } from 'shared/dist/types';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  recentProducts: ProductWithVariants[];
  recentOrders: Order[];
  recentReviews: any[];
}

interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    recentProducts: [],
    recentOrders: [],
    recentReviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get recent products
        const productsResponse = await adminApi.getProducts({ limit: 5 });
        
        // Get orders data
        const ordersResponse = await orderApi.getOrders({ limit: 10 });
        const pendingOrdersResponse = await orderApi.getOrders({ status: 'pending', limit: 100 });
        const completedOrdersResponse = await orderApi.getOrders({ status: 'delivered', limit: 100 });
        
        // Get recent reviews
        const reviewsResponse = await adminApi.getReviews({ limit: 5 });
        
        let totalRevenue = 0;
        let recentOrders: Order[] = [];
        let recentReviews: any[] = [];
        
        if (ordersResponse.success && ordersResponse.data) {
          recentOrders = ordersResponse.data.orders;
          
          // Calculate total revenue from completed orders
          const completedOrders = ordersResponse.data.orders.filter(order => order.status === 'delivered');
          totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        }
        
        if (reviewsResponse.success && reviewsResponse.data) {
          recentReviews = reviewsResponse.data.reviews;
        }
        
        if (productsResponse.success && productsResponse.data) {
          setStats({
            totalProducts: productsResponse.data.pagination.total,
            totalOrders: ordersResponse.success ? ordersResponse.data.pagination.total : 0,
            pendingOrders: pendingOrdersResponse.success ? pendingOrdersResponse.data.pagination.total : 0,
            completedOrders: completedOrdersResponse.success ? completedOrdersResponse.data.pagination.total : 0,
            totalRevenue,
            recentProducts: productsResponse.data.products,
            recentOrders,
            recentReviews,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Produk',
      value: stats.totalProducts,
      icon: Package,
      change: '0%',
      changeType: 'neutral' as const,
      color: 'blue',
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingBag,
      change: '0%',
      changeType: 'neutral' as const,
      color: 'green',
    },
    {
      title: 'Pesanan Pending',
      value: stats.pendingOrders,
      icon: Clock,
      change: '0',
      changeType: 'neutral' as const,
      color: 'yellow',
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      icon: TrendingUp,
      change: '0%',
      changeType: 'neutral' as const,
      color: 'orange',
    },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di dashboard admin PasarAntar</p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Produk
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">dari bulan lalu</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h2>
            <Link
              to="/admin/orders"
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {stats.recentOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Pesanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
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
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'pending' ? 'Menunggu Konfirmasi' :
                         order.status === 'confirmed' ? 'Dikonfirmasi' :
                         order.status === 'processing' ? 'Diproses' :
                         order.status === 'delivered' ? 'Terkirim' : 'Dibatalkan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pesanan</h3>
              <p className="mt-1 text-sm text-gray-500">Pesanan baru akan muncul di sini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Produk Terbaru</h2>
            <Link
              to="/admin/products"
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {stats.recentProducts.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
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
                {stats.recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              product.imageUrl && !product.imageUrl.startsWith('blob:')
                                ? (product.imageUrl.startsWith('http')
                                  ? product.imageUrl
                                  : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${product.imageUrl}`)
                                : `https://picsum.photos/seed/${product.id}/100/100.jpg`
                            }
                            alt={product.name}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              if (!target.src.includes('picsum.photos')) {
                                target.src = `https://picsum.photos/seed/${product.id}/100/100.jpg`;
                              }
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.variants.length} varian</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {Math.min(...product.variants.map(v => v.price)).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.variants.filter(v => v.inStock).length}/{product.variants.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.isOnSale ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Promo
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada produk</h3>
              <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan produk pertama Anda.</p>
              <div className="mt-6">
                <Link
                  to="/admin/products/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Tambah Produk
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reviews - Minimalist Design */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Ulasan Terbaru</h2>
            <Link
              to="/admin/reviews"
              className="text-orange-600 hover:text-orange-700 font-medium text-xs"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="p-4">
          {stats.recentReviews.length > 0 ? (
            <div className="space-y-3">
              {stats.recentReviews.map((review: Review) => (
                <div key={review.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{review.customerName}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">{review.comment}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{formatDate(review.date)}</p>
                      {review.verified && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada ulasan</h3>
              <p className="mt-1 text-xs text-gray-500">Ulasan baru akan muncul di sini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to format date
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}