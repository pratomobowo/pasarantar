import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  Customer,
  CustomerRegisterRequest,
  CustomerLoginRequest,
  CustomerLoginResponse,
  CustomerUpdateRequest,
  OrderWithItems,
  CustomerWithSocialAccounts,
  SocialAuthRequest,
  SocialAuthResponse,
  LinkSocialAccountRequest,
  Product,
  ProductVariant,
  CustomerAddress,
  CreateAddressRequest,
  UpdateAddressRequest,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
  ChangePasswordRequest
} from 'shared/dist/types';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

class CustomerApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          this.clearAuthToken();
          window.location.href = '/customer/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async register(data: CustomerRegisterRequest): Promise<ApiResponse<CustomerLoginResponse>> {
    const response: AxiosResponse<ApiResponse<CustomerLoginResponse>> = await this.client.post(
      '/api/customers/register',
      data
    );
    return response.data;
  }

  async login(credentials: CustomerLoginRequest): Promise<ApiResponse<CustomerLoginResponse>> {
    const response: AxiosResponse<ApiResponse<CustomerLoginResponse>> = await this.client.post(
      '/api/customers/login',
      credentials
    );
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.post('/api/customers/logout');
    return response.data;
  }

  async getCurrentCustomer(): Promise<ApiResponse<CustomerWithSocialAccounts>> {
    const response: AxiosResponse<ApiResponse<CustomerWithSocialAccounts>> = 
      await this.client.get('/api/customers/me');
    return response.data;
  }

  async updateProfile(data: CustomerUpdateRequest): Promise<ApiResponse<Customer>> {
    const response: AxiosResponse<ApiResponse<Customer>> = 
      await this.client.put('/api/customers/profile', data);
    return response.data;
  }

  // Order methods
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ orders: OrderWithItems[]; pagination: any }>> {
    const response: AxiosResponse<ApiResponse<{ orders: OrderWithItems[]; pagination: any }>> =
      await this.client.get('/api/customers/orders', { params });
    return response.data;
  }

  async getOrder(orderId: string): Promise<ApiResponse<OrderWithItems>> {
    const response: AxiosResponse<ApiResponse<OrderWithItems>> =
      await this.client.get(`/api/customers/orders/${orderId}`);
    return response.data;
  }

  // Social authentication methods
  async authenticateWithSocial(data: SocialAuthRequest): Promise<ApiResponse<SocialAuthResponse>> {
    const response: AxiosResponse<ApiResponse<SocialAuthResponse>> = 
      await this.client.post('/api/customers/auth/social', data);
    return response.data;
  }

  async linkSocialAccount(data: LinkSocialAccountRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = 
      await this.client.post('/api/customers/link-social', data);
    return response.data;
  }

  async unlinkSocialAccount(provider: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/customers/unlink-social/${provider}`);
    return response.data;
  }

  // Address methods
  async getAddresses(): Promise<ApiResponse<CustomerAddress[]>> {
    const response: AxiosResponse<ApiResponse<CustomerAddress[]>> =
      await this.client.get('/api/customers/addresses');
    return response.data;
  }

  async getAddress(addressId: string): Promise<ApiResponse<CustomerAddress>> {
    const response: AxiosResponse<ApiResponse<CustomerAddress>> =
      await this.client.get(`/api/customers/addresses/${addressId}`);
    return response.data;
  }

  async createAddress(data: CreateAddressRequest): Promise<ApiResponse<CustomerAddress>> {
    const response: AxiosResponse<ApiResponse<CustomerAddress>> =
      await this.client.post('/api/customers/addresses', data);
    return response.data;
  }

  async updateAddress(addressId: string, data: UpdateAddressRequest): Promise<ApiResponse<CustomerAddress>> {
    const response: AxiosResponse<ApiResponse<CustomerAddress>> =
      await this.client.put(`/api/customers/addresses/${addressId}`, data);
    return response.data;
  }

  async deleteAddress(addressId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/customers/addresses/${addressId}`);
    return response.data;
  }

  async setDefaultAddress(addressId: string): Promise<ApiResponse<CustomerAddress>> {
    const response: AxiosResponse<ApiResponse<CustomerAddress>> =
      await this.client.patch(`/api/customers/addresses/${addressId}/set-default`);
    return response.data;
  }

  // Password reset methods
  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.post('/api/customers/request-password-reset', data);
    return response.data;
  }

  async verifyPasswordReset(data: PasswordResetVerifyRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.post('/api/customers/verify-password-reset', data);
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.put('/api/customers/change-password', data);
    return response.data;
  }

  // Product methods
  async getProducts(search?: string): Promise<ApiResponse<Product[]>> {
    const params = search ? { search } : {};
    const response: AxiosResponse<ApiResponse<Product[]>> =
      await this.client.get('/api/products', { params });
    return response.data;
  }

  // Order methods
  async cancelOrder(orderId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.put(`/api/orders/${orderId}/cancel`);
    return response.data;
  }

  // Notification methods
  async getNotifications(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> =
      await this.client.get('/api/customer-notifications');
    return response.data;
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response: AxiosResponse<ApiResponse<{ count: number }>> =
      await this.client.get('/api/customer-notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.put(`/api/customer-notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.put('/api/customer-notifications/mark-all-read');
    return response.data;
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/customer-notifications/${notificationId}`);
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('customer-token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('customer-token');
  }

  clearAuthToken(): void {
    localStorage.removeItem('customer-token');
    localStorage.removeItem('customer-user');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  setCustomerUser(customer: Customer): void {
    localStorage.setItem('customer-user', JSON.stringify(customer));
  }

  getCustomerUser(): Customer | null {
    const userStr = localStorage.getItem('customer-user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing customer user from localStorage:', error);
        this.clearAuthToken();
      }
    }
    return null;
  }

  clearCustomerUser(): void {
    localStorage.removeItem('customer-user');
  }
}

export const customerApi = new CustomerApiService();