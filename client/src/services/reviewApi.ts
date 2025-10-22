import { ProductReview } from 'shared/dist/types';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

class ReviewApi {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add auth token if available
    const token = localStorage.getItem('customer-token');
    
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Check if review exists for a product in an order
  async checkReviewExists(productId: string, orderId: string) {
    return this.request(`/api/reviews/check?productId=${productId}&orderId=${orderId}`);
  }

  // Create new review
  async createReview(reviewData: {
    productId: string;
    orderId: string;
    rating: number;
    comment: string;
  }) {
    return this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Get reviews for a product
  async getProductReviews(productId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    const endpoint = `/api/reviews/product/${productId}${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  // Get reviews by customer (admin only)
  async getCustomerReviews(customerId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    const endpoint = `/api/reviews/customer/${customerId}${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  // Update review
  async updateReview(reviewId: string, data: {
    rating?: number;
    comment?: string;
  }) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete review (admin only)
  async deleteReview(reviewId: string) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Verify review (admin only)
  async verifyReview(reviewId: string) {
    return this.request(`/api/reviews/${reviewId}/verify`, {
      method: 'PATCH',
    });
  }
}

export const reviewApi = new ReviewApi();