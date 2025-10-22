import { useState, useEffect } from 'react';
import { Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { reviewApi } from '../services/reviewApi';
import { formatPrice } from '../utils/formatters';

interface ProductReviewsProps {
  productId: string;
  averageRating?: number;
  reviewCount?: number;
}

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  createdAt: string;
}

export default function ProductReviews({ 
  productId, 
  averageRating = 0, 
  reviewCount = 0 
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await reviewApi.getProductReviews(productId, {
        page,
        limit: reviewsPerPage
      });
      
      if (response.success && response.data) {
        if (page === 1) {
          setReviews(response.data.reviews);
        } else {
          setReviews(prev => [...prev, ...response.data.reviews]);
        }
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchReviews(nextPage);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (reviewCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ulasan Produk</h3>
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Belum ada ulasan untuk produk ini</p>
          <p className="text-sm text-gray-500 mt-2">
            Jadilah yang pertama memberikan ulasan!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Ulasan Produk</h3>
        <div className="flex items-center">
          {renderStars(Math.round(averageRating))}
          <span className="ml-2 text-xs text-gray-600">
            {averageRating.toFixed(1)} ({reviewCount})
          </span>
        </div>
      </div>

      {/* Minimalist Rating Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(Math.round(averageRating), 'small')}
              </div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex-1">
              <div className="grid grid-cols-5 gap-1 text-xs">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage = reviewCount > 0
                    ? (reviews.filter(r => Math.round(r.rating) === rating).length / reviewCount) * 100
                    : 0;
                  
                  return (
                    <div key={rating} className="text-center">
                      <div className="text-gray-600 mb-1">{rating}</div>
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-yellow-400 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-gray-500 mt-1">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List - Minimalist */}
      <div className="space-y-3">
        {loading && reviews.length === 0 ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 text-sm">Memuat ulasan...</p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <div key={review.id} className="border-l-2 border-gray-100 pl-3 py-2 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="text-sm font-medium text-gray-900 mr-2">{review.customerName}</h4>
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
                    
                    <p className="text-sm text-gray-700 line-clamp-3">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Load More Button - Minimalist */}
            {!loading && currentPage < totalPages && (
              <div className="text-center mt-3">
                <button
                  onClick={loadMoreReviews}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 focus:outline-none"
                >
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Muat Lebih Banyak
                </button>
              </div>
            )}
            
            {loading && currentPage > 1 && (
              <div className="text-center mt-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mx-auto"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}