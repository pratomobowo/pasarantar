import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  Weight,
  DollarSign,
  Star,
  MessageSquare,
  Calendar,
  Eye,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { ProductWithVariants } from 'shared/dist/types';
import { useToast } from '../../contexts/ToastContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getProduct(productId);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.message || 'Failed to fetch product');
        showToast({
          title: 'Error',
          message: response.message || 'Failed to fetch product',
          type: 'error',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error occurred');
      showToast({
        title: 'Network Error',
        message: err.response?.data?.message || 'Network error occurred',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatWeight = (weight: string, unitAbbreviation?: string) => {
    return `${weight}${unitAbbreviation || 'g'}`;
  };

  const getStatusBadge = (isOnSale: boolean, discountPercentage?: number) => {
    if (isOnSale) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Tag className="w-3 h-3 mr-1" />
          Promo {discountPercentage}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Normal
      </span>
    );
  };

  const getStockBadge = (inStock: boolean) => {
    if (inStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Tersedia
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Habis
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

  if (error || !product) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error || 'Product not found'}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link
            to="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/products"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Produk</h1>
            <p className="text-gray-600">Informasi lengkap produk dan varian</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Produk
          </Link>
        </div>
      </div>

      {/* Product Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="lg:flex lg:space-x-8">
            {/* Product Image */}
            <div className="lg:w-1/3 mb-6 lg:mb-0">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={
                    product.imageUrl && !product.imageUrl.startsWith('blob:')
                      ? (product.imageUrl.startsWith('http')
                        ? product.imageUrl
                        : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${product.imageUrl}`)
                      : `https://picsum.photos/seed/${product.id}/400/400.jpg`
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('picsum.photos')) {
                      target.src = `https://picsum.photos/seed/${product.id}/400/400.jpg`;
                    }
                  }}
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-2/3 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-2xl font-bold text-orange-600">
                        {formatPrice(Math.min(...product.variants.map(v => v.price)))}
                      </span>
                      {product.variants.length > 1 && (
                        <span className="text-lg text-gray-500">
                          - {formatPrice(Math.max(...product.variants.map(v => v.price)))}
                        </span>
                      )}
                      {getStatusBadge(product.isOnSale, product.discountPercentage)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Kategori:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.categoryName || 'Tidak ada kategori'}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Rating:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {product.rating} ({product.reviewCount} ulasan)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Dibuat:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Diperbarui:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Deskripsi Produk</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Total Varian</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{product.variants.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <span className="text-sm text-green-600">Tersedia</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {product.variants.filter(v => v.inStock).length}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-600">Habis</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {product.variants.filter(v => !v.inStock).length}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-orange-400 mr-2" />
                    <span className="text-sm text-orange-600">Harga Rata-rata</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    {formatPrice(product.variants.reduce((sum, v) => sum + v.price, 0) / product.variants.length)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Variants */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Varian Produk</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Berat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min. Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {product.variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {variant.sku || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatWeight(variant.weight)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(variant.price)}
                    {variant.originalPrice && variant.originalPrice > variant.price && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatPrice(variant.originalPrice)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStockBadge(variant.inStock)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {variant.minOrderQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      variant.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {variant.isActive ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Metadata */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Produk</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">ID Produk:</dt>
              <dd className="text-sm font-medium text-gray-900">{product.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">ID Kategori:</dt>
              <dd className="text-sm font-medium text-gray-900">{product.categoryId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Varian Default:</dt>
              <dd className="text-sm font-medium text-gray-900">{product.defaultVariantId || 'Tidak ada'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Harga Dasar:</dt>
              <dd className="text-sm font-medium text-gray-900">{formatPrice(product.basePrice)}</dd>
            </div>
          </dl>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Sistem</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Dibuat pada:</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(product.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Diperbarui pada:</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(product.updatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Jumlah Ulasan:</dt>
              <dd className="text-sm font-medium text-gray-900">{product.reviewCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Rating Rata-rata:</dt>
              <dd className="text-sm font-medium text-gray-900">{product.rating}/5</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}