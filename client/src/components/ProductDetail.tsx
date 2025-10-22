import { useState, useEffect } from 'react';
import { ShoppingCart, Check, Star, Calendar, User, Plus, Minus, Share2, MessageCircle } from 'lucide-react';
import { ProductVariant, ProductReview, ProductWithRelations } from 'shared/dist/types';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { reviewApi } from '../services/reviewApi';
import { formatWeightWithUnit } from '../utils/productUtils';

export default function ProductDetail({ product }: { product: ProductWithRelations | null }) {
  const { addToCart } = useCart();
  const { createWhatsAppUrl, getWhatsAppMessages } = useSettings();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Effect to automatically select the default variant when product changes
  useEffect(() => {
    if (product) {
      // Prioritize the default variant (same as shown in product card)
      // If no default variant is set, use the first variant
      const defaultVariant = product.variants.find(variant => variant.id === product.defaultVariantId);
      setSelectedVariantId(defaultVariant?.id || product.variants[0]?.id || '');
    }
  }, [product]);

  // Fetch reviews when product changes
  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product]);

  const fetchReviews = async () => {
    if (!product) return;
    
    try {
      setReviewsLoading(true);
      const response = await reviewApi.getProductReviews(product.id, {
        page: 1,
        limit: 50 // Load more reviews at once
      });
      
      if (response.success && response.data) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const selectedVariant = product?.variants.find((v: ProductVariant) => v.id === selectedVariantId);

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      // Prevent multiple clicks during the feedback animation period
      if (isAddedToCart) {
        return;
      }
      
      addToCart(product, selectedVariant);
      
      // Show checkmark feedback
      setIsAddedToCart(true);
      
      // Reset after 1.5 seconds
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 1500);
      
      // Don't close modal automatically to allow users to select other variants
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={16} className="text-yellow-500 fill-current" />
        ))}
        {hasHalfStar && (
          <Star size={16} className="text-yellow-500 fill-current opacity-50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} className="text-gray-300 fill-current" />
        ))}
      </div>
    );
  };

  const renderReviewItem = (review: ProductReview) => (
    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <User size={20} className="text-gray-500" />
          </div>
          <div>
            <div className="flex items-center">
              <h4 className="font-medium text-gray-900 mr-2">{review.customerName}</h4>
              {review.verified && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Terverifikasi
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Calendar size={12} className="mr-1" />
              {formatDate(review.date)}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {renderStars(review.rating)}
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
    </div>
  );

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Produk Tidak Ditemukan</h2>
          <p className="text-gray-600 mt-2">Produk yang Anda cari tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Image and Info */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Image */}
          <div className="lg:w-1/2">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={
                  product.imageUrl && !product.imageUrl.startsWith('blob:')
                    ? (product.imageUrl.startsWith('http')
                      ? product.imageUrl
                      : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${product.imageUrl}`)
                    : `https://picsum.photos/seed/${product.id}/600/600.jpg`
                }
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('picsum.photos')) {
                    target.src = `https://picsum.photos/seed/${product.id}/600/600.jpg`;
                  }
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-lg font-bold text-orange-600">
                    {selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(product.basePrice)}
                  </span>
                  {selectedVariant && (
                    <span className="text-gray-500">{formatWeightWithUnit(selectedVariant)}</span>
                  )}
                </div>

                <div className="flex items-center mb-4">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.reviewCount} ulasan)
                  </span>
                </div>
                
                <div className="flex items-center mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedVariant?.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedVariant?.inStock ? 'Tersedia' : 'Habis'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => {
                    const currentUrl = window.location.href;
                    const productName = product.name;
                    const productPrice = selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(product.basePrice);
                    const message = `Halo, saya ingin membagikan produk ini kepada Anda:\n\n${productName}\nHarga: ${productPrice}\n\nLihat produknya di sini: ${currentUrl}`;
                    const whatsappUrl = createWhatsAppUrl(message);
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Bagikan via WhatsApp"
                >
                  <Share2 size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Weight Variants */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Pilih Berat</h3>
              <div className="grid grid-cols-3 gap-3">
                {product?.variants.map((variant: ProductVariant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    disabled={!variant.inStock}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedVariantId === variant.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${
                      !variant.inStock
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:shadow-sm'
                    }`}
                  >
                    {selectedVariantId === variant.id && (
                      <div className="absolute top-1 right-1">
                        <Check size={16} className="text-orange-600" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{formatWeightWithUnit(variant)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatPrice(variant.price)}
                      </p>
                      {!variant.inStock && (
                        <p className="text-xs text-red-500 mt-1">Habis</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Jumlah:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 99) {
                        setQuantity(value);
                      } else if (value < 1) {
                        setQuantity(1);
                      } else if (value > 99) {
                        setQuantity(99);
                      }
                    }}
                    className="w-12 text-center py-2 border-x border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.min(99, prev + 1))}
                    className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= 99}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant?.inStock}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    selectedVariant?.inStock
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAddedToCart ? (
                    <>
                      <Check size={20} className="mr-2" />
                      Ditambahkan
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} className="mr-2" />
                      {selectedVariant ? (
                        selectedVariant.inStock ? `Beli (${quantity})` : 'Stok Habis'
                      ) : 'Pilih Berat'}
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    const message = getWhatsAppMessages().PRODUCT_INQUIRY(product.name);
                    const whatsappUrl = createWhatsAppUrl(message);
                    window.open(whatsappUrl, '_blank');
                  }}
                  className={`flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-200 border ${
                    selectedVariant?.inStock
                      ? 'border-green-600 text-green-600 hover:bg-green-50'
                      : 'border-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!selectedVariant?.inStock}
                >
                  <MessageCircle size={20} className="mr-2" />
                  Tanya
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-200 mt-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                activeTab === 'description'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Deskripsi
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                activeTab === 'reviews'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ulasan ({reviews.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Deskripsi Produk</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ulasan Pelanggan</h3>
                
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Memuat ulasan...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada ulasan untuk produk ini.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {reviews.map(renderReviewItem)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}