import { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { reviewApi } from '../../services/reviewApi';
import { adminApi } from '../../services/adminApi';
import { formatPrice } from '../../utils/formatters';

interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerId: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewDetail, setShowReviewDetail] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: currentPage,
        limit: 10,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // Use adminApi service instead of direct fetch
      const response = await adminApi.getReviews(params);
      
      console.log('ReviewManagement: Using adminApi service to fetch reviews', response);
      
      if (response.success) {
        let filteredReviews = response.data.reviews;
        
        // Apply search filter (client-side filtering for search term)
        if (searchTerm) {
          filteredReviews = filteredReviews.filter((review: Review) =>
            review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.productName && review.productName.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setReviews(filteredReviews);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // For demo purposes, use empty array if API fails
      setReviews([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReview = async (reviewId: string) => {
    try {
      setProcessing(true);
      const response = await reviewApi.verifyReview(reviewId);
      
      if (response.success) {
        // Update local state
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review.id === reviewId ? { ...review, verified: true } : review
          )
        );
      }
    } catch (error) {
      console.error('Error verifying review:', error);
      alert('Gagal memverifikasi review. Silakan coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus review ini?')) {
      return;
    }
    
    try {
      setProcessing(true);
      const response = await reviewApi.deleteReview(reviewId);
      
      if (response.success) {
        // Update local state
        setReviews(prevReviews =>
          prevReviews.filter(review => review.id !== reviewId)
        );
        setTotalCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Gagal menghapus review. Silakan coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setShowReviewDetail(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`h-4 w-4 ${
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (verified: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        verified
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {verified ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Terverifikasi
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 mr-1" />
            Menunggu Verifikasi
          </>
        )}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Review</h1>
          <p className="text-gray-600">Kelola semua review produk dari pelanggan</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
                placeholder="Cari nama pelanggan, komentar..."
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
              Status: {statusFilter === 'all' ? 'Semua' : statusFilter === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {showStatusFilter && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setShowStatusFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Semua Status
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('verified');
                      setShowStatusFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Terverifikasi
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('unverified');
                      setShowStatusFilter(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Menunggu Verifikasi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Komentar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{review.customerName}</div>
                          <div className="text-sm text-gray-500">ID: {review.customerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.productName || `Product ID: ${review.productId}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Order: {review.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(review.verified)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewReview(review)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {!review.verified && (
                          <button
                            onClick={() => handleVerifyReview(review.id)}
                            disabled={processing}
                            className="text-green-600 hover:text-green-900"
                            title="Verifikasi"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={processing}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada review</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Tidak ada review yang cocok dengan filter yang dipilih.'
                : 'Belum ada review yang masuk.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {((currentPage - 1) * 10) + 1} hingga {Math.min(currentPage * 10, totalCount)} dari {totalCount} review
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

      {/* Review Detail Modal */}
      {showReviewDetail && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Detail Review</h3>
                <button
                  onClick={() => setShowReviewDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedReview.customerName}</h4>
                    <p className="text-sm text-gray-500">ID: {selectedReview.customerId}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Rating</p>
                  {renderStars(selectedReview.rating)}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Komentar</p>
                  <p className="text-gray-900">{selectedReview.comment}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                  {getStatusBadge(selectedReview.verified)}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Informasi Produk</p>
                  <p className="text-sm text-gray-900">
                    {selectedReview.productName || `Product ID: ${selectedReview.productId}`}
                  </p>
                  <p className="text-sm text-gray-500">Order: {selectedReview.orderId}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Tanggal</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedReview.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                {!selectedReview.verified && (
                  <button
                    onClick={() => {
                      handleVerifyReview(selectedReview.id);
                      setShowReviewDetail(false);
                    }}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    Verifikasi Review
                  </button>
                )}
                
                <button
                  onClick={() => setShowReviewDetail(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}