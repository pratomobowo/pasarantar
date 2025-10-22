import { Order, OrderWithItems } from 'shared/dist/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class OrderApi {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add auth token if available (check both admin and customer tokens)
    const adminToken = localStorage.getItem('pasarantar-admin-token');
    const customerToken = localStorage.getItem('customer-token');
    const token = adminToken || customerToken;
    
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

  // Create new order (public endpoint)
  async createOrder(orderData: {
    customerName: string;
    customerWhatsapp: string;
    customerAddress: string;
    customerCoordinates?: string;
    shippingMethod: 'express' | 'pickup';
    deliveryDay?: 'selasa' | 'kamis' | 'sabtu';
    paymentMethod: 'transfer' | 'cod';
    customerId?: string; // Optional customer ID for logged-in customers
    items: Array<{
      productId: string;
      productVariantId: string;
      quantity: number;
      notes?: string;
    }>;
    notes?: string;
  }) {
    // Note: customerId is now expected to be passed in the orderData
    // This check is kept for backward compatibility but the CartContext
    // should now be responsible for including the customerId
    if (!orderData.customerId) {
      const customerToken = localStorage.getItem('customer-token');
      if (customerToken) {
        // Try to get customer info to include their ID
        try {
          const customerInfo = localStorage.getItem('customer-user');
          if (customerInfo) {
            const customer = JSON.parse(customerInfo);
            // Add customerId to the order data
            orderData = {
              ...orderData,
              customerId: customer.id
            };
          }
        } catch (error) {
          console.error('Error parsing customer info:', error);
        }
      }
    }
    
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Get all orders (admin only)
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    const endpoint = `/api/admin/orders${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  // Get single order with items (admin only)
  async getOrder(orderId: string) {
    return this.request(`/api/admin/orders/${orderId}`);
  }

  // Update order status (admin only)
  async updateOrderStatus(orderId: string, status: Order['status']) {
    return this.request(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Get order analytics (admin only)
  async getAnalytics(params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.period) searchParams.append('period', params.period);
    
    const query = searchParams.toString();
    const endpoint = `/api/admin/orders/analytics${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }
}

export const orderApi = new OrderApi();