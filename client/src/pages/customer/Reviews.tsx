import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  Calendar,
  ShoppingBag,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { reviewApi } from '../../services/reviewApi';
import { customerApi } from '../../services/customerApi';
import { ProductReview } from 'shared/dist/types';
import ReviewForm from '../../components/customer/ReviewForm';
import Pagination from '../../components/ui/Pagination';

interface ReviewableOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  orderItems: Array<{
    id: string;
    productId: string;
    productName: string;
    productVariantWeight: string;
    productImageUrl?: string;
    quantity: number;
  }>;
}

export default function CustomerReviews() {
  const { customer } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [pendingReviews, setPendingReviews] = useState<ReviewableOrder[]>([]);
  const [completedReviews, setCompletedReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    isOpen: boolean;
    productId: string;
    orderId: string;
    productName: string;
    productVariant: string;
  }>({
    isOpen: false,
    productId: '',
    orderId: '',
    productName: '',
    productVariant: ''
  });

  // Pagination states
  const [pendingPage, setPendingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [completedTotalPages, setCompletedTotalPages] = useState(1);
  const [pendingTotalCount, setPendingTotalCount] = useState(0);
  const [completedTotalCount, setCompletedTotalCount] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    loadReviewsData();
  }, [pendingPage, completedPage]);

  const loadReviewsData = async () => {
    try {
      setLoading(true);
      
      // Load pending reviews (delivered orders without reviews)
      const ordersResponse = await customerApi.getOrders({
        status: 'delivered',
        page: pendingPage,
        limit: itemsPerPage
      });
      
      if (ordersResponse.success && ordersResponse.data) {
        const deliveredOrders = ordersResponse.data.orders;
        
        // Check each order item for existing reviews
        const reviewableOrders: ReviewableOrder[] = [];
        
        for (const order of deliveredOrders) {
          // Check if orderItems exists and is an array
          if (!order.orderItems || !Array.isArray(order.orderItems)) {
            console.warn('order.orderItems is not an array, skipping order:', order.id);
            continue;
          }
          
          const itemsNeedingReview: any[] = [];
          
          for (const item of order.orderItems) {
            try {
              const reviewCheck = await reviewApi.checkReviewExists(
                item.productId,
                order.id
              );
              
              if (!reviewCheck.exists) {
                itemsNeedingReview.push(item);
              }
            } catch (error) {
              console.error('Error checking review:', error);
              itemsNeedingReview.push(item);
            }
          }
          
          if (itemsNeedingReview.length > 0) {
            reviewableOrders.push({
              id: order.id,
              orderNumber: order.orderNumber,
              createdAt: order.createdAt.toString(),
              orderItems: itemsNeedingReview
            });
          }
        }
        
        setPendingReviews(reviewableOrders);
        setPendingTotalPages(ordersResponse.data.pagination?.totalPages || 1);
        setPendingTotalCount(ordersResponse.data.pagination?.total || 0);
      }
      
      // Load completed reviews
      if (customer) {
        const reviewsResponse = await reviewApi.getCustomerReviews(customer.id, {
          page: completedPage,
          limit: itemsPerPage
        });
        
        if (reviewsResponse.success && reviewsResponse.data) {
          setCompletedReviews(reviewsResponse.data.reviews);
          setCompletedTotalPages(reviewsResponse.data.pagination?.totalPages || 1);
          setCompletedTotalCount(reviewsResponse.data.pagination?.total || 0);
        }
      }
    } catch (err) {
      console.error('Error loading reviews data:', err);
      setError('Gagal memuat data ulasan');
    } finally {
      setLoading(false);
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

  const renderStars = (rating: number, size = 'small') => {
    const starSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`${starSize} ${
              value <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const openReviewForm = (productId: string, orderId: string, productName: string, productVariant: string) => {
    setReviewForm({
      isOpen: true,
      productId,
      orderId,
      productName,
      productVariant
    });
  };

  const closeReviewForm = () => {
    setReviewForm({
      isOpen: false,
      productId: '',
      orderId: '',
      productName: '',
      productVariant: ''
    });
  };

  const handleReviewSubmitted = () => {
    // Reload reviews data
    loadReviewsData();
  };

  const handlePendingPageChange = (page: number) => {
    setPendingPage(page);
  };

  const handleCompletedPageChange = (page: number) => {
    setCompletedPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header - Minimalist */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Ulasan Saya</h1>
        <p className="text-gray-600 text-sm mt-1">Kelola ulasan produk Anda</p>
      </div>

      {/* Tabs - Minimalist */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Menunggu
              {pendingReviews.length > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-xs">
                  {pendingReviews.reduce((acc, order) => acc + order.orderItems.length, 0)}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Selesai
              {completedReviews.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                  {completedReviews.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Pending Reviews Tab - Minimalist */}
      {activeTab === 'pending' && (
        <div>
          {pendingReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada ulasan yang menunggu</h3>
              <p className="mt-1 text-xs text-gray-500">Semua produk yang telah Anda terima sudah diulas.</p>
              <div className="mt-4">
                <Link
                  to="/"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Belanja Sekarang
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {pendingReviews.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Pesanan #{order.orderNumber}</h3>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-2 w-2 mr-1" />
                        Diterima
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                item.productImageUrl && item.productImageUrl.startsWith('http')
                                  ? item.productImageUrl
                                  : item.productImageUrl
                                  ? `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${item.productImageUrl}`
                                  : `https://picsum.photos/seed/${item.productId}/100/100.jpg`
                              }
                              alt={item.productName}
                              className="h-12 w-12 rounded-lg object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('picsum.photos')) {
                                  target.src = `https://picsum.photos/seed/${item.productId}/100/100.jpg`;
                                }
                              }}
                            />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{item.productName}</h4>
                              <p className="text-xs text-gray-500">{item.productVariantWeight} × {item.quantity}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => openReviewForm(
                              item.productId,
                              order.id,
                              item.productName,
                              item.productVariantWeight
                            )}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ulas
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination for Pending Reviews */}
              {pendingTotalPages > 1 && (
                <Pagination
                  currentPage={pendingPage}
                  totalPages={pendingTotalPages}
                  totalCount={pendingTotalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePendingPageChange}
                  className="mt-4"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Completed Reviews Tab - Minimalist */}
      {activeTab === 'completed' && (
        <div>
          {completedReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <Star className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada ulasan</h3>
              <p className="mt-1 text-xs text-gray-500">Anda belum membuat ulasan untuk produk apa pun.</p>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {completedReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-900 mr-2">Ulasan Produk</h4>
                          {review.verified && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              ✓
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center mb-2">
                          {renderStars(review.rating, 'small')}
                          <span className="ml-2 text-xs text-gray-500">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">{review.comment}</p>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(review.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination for Completed Reviews */}
              {completedTotalPages > 1 && (
                <Pagination
                  currentPage={completedPage}
                  totalPages={completedTotalPages}
                  totalCount={completedTotalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handleCompletedPageChange}
                  className="mt-4"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        productId={reviewForm.productId}
        orderId={reviewForm.orderId}
        productName={reviewForm.productName}
        productVariant={reviewForm.productVariant}
        isOpen={reviewForm.isOpen}
        onClose={closeReviewForm}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}