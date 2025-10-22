import { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { reviewApi } from '../../services/reviewApi';

interface ReviewFormProps {
  productId: string;
  orderId: string;
  productName: string;
  productVariant: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({
  productId,
  orderId,
  productName,
  productVariant,
  isOpen,
  onClose,
  onReviewSubmitted
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Silakan pilih rating bintang');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('Review harus memiliki minimal 10 karakter');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await reviewApi.createReview({
        productId,
        orderId,
        rating,
        comment: comment.trim()
      });
      
      if (response.success) {
        // Reset form
        setRating(0);
        setComment('');
        onClose();
        onReviewSubmitted();
      } else {
        setError(response.message || 'Gagal mengirim review');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    setError('');
  };

  const handleRatingHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Beri Review Produk</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Product Info */}
          <div className="mb-6">
            <p className="font-medium text-gray-900">{productName}</p>
            <p className="text-sm text-gray-500">{productVariant}</p>
          </div>
          
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => handleRatingHover(value)}
                  onMouseLeave={handleRatingLeave}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      value <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                {rating === 1 && 'Sangat Buruk'}
                {rating === 2 && 'Buruk'}
                {rating === 3 && 'Biasa'}
                {rating === 4 && 'Baik'}
                {rating === 5 && 'Sangat Baik'}
              </p>
            )}
          </div>
          
          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Review
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError('');
              }}
              placeholder="Bagikan pengalaman Anda dengan produk ini..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimal 10 karakter
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}