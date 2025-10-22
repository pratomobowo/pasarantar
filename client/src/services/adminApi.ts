import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, Admin, AdminLoginRequest, AdminLoginResponse, ProductWithVariants, PaginatedResponse, Customer, WebsiteSettings, WebsiteSettingsUpdateRequest, SmtpSettings, SmtpSettingsUpdateRequest } from 'shared/dist/types';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

class AdminApiService {
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
        const token = localStorage.getItem('admin-token');
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
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-user');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>> {
    const response: AxiosResponse<ApiResponse<AdminLoginResponse>> = await this.client.post(
      '/api/admin/login',
      credentials
    );
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.post('/api/admin/logout');
    return response.data;
  }

  async getCurrentAdmin(): Promise<ApiResponse<Admin>> {
    const response: AxiosResponse<ApiResponse<Admin>> = await this.client.get('/api/admin/me');
    return response.data;
  }

  // Product management methods
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<ApiResponse<PaginatedResponse<ProductWithVariants>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<ProductWithVariants>>> = 
      await this.client.get('/api/admin/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<ProductWithVariants>> {
    const response: AxiosResponse<ApiResponse<ProductWithVariants>> = 
      await this.client.get(`/api/admin/products/${id}`);
    return response.data;
  }

  async createProduct(productData: any): Promise<ApiResponse<ProductWithVariants>> {
    const response: AxiosResponse<ApiResponse<ProductWithVariants>> =
      await this.client.post('/api/admin/products', productData);
    return response.data;
  }

  async updateProduct(id: string, productData: any): Promise<ApiResponse<ProductWithVariants>> {
    console.log('API: Updating product with ID:', id);
    console.log('API: Product data being sent:', productData);
    
    try {
      const response: AxiosResponse<ApiResponse<ProductWithVariants>> =
        await this.client.put(`/api/admin/products/${id}`, productData);
      console.log('API: Update response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error updating product:', error);
      if (error.response) {
        console.error('API: Error response data:', error.response.data);
        console.error('API: Error response status:', error.response.status);
      }
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/admin/products/${id}`);
    return response.data;
  }

  async uploadImage(file: File): Promise<ApiResponse<{ filename: string; url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response: AxiosResponse<ApiResponse<{ filename: string; url: string }>> =
      await this.client.post('/api/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data;
  }

  // Unit management methods
  async getUnits(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<any>>> =
      await this.client.get('/api/admin/units', { params });
    return response.data;
  }

  async getUnit(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.get(`/api/admin/units/${id}`);
    return response.data;
  }

  async createUnit(unitData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.post('/api/admin/units', unitData);
    return response.data;
  }

  async updateUnit(id: string, unitData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.put(`/api/admin/units/${id}`, unitData);
    return response.data;
  }

  async deleteUnit(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/admin/units/${id}`);
    return response.data;
  }

  async getActiveUnits(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> =
      await this.client.get('/api/admin/units/active/list');
    return response.data;
  }

  // Category management methods
  async getCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<any>>> =
      await this.client.get('/api/admin/categories', { params });
    return response.data;
  }

  async getCategory(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.get(`/api/admin/categories/${id}`);
    return response.data;
  }

  async createCategory(categoryData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.post('/api/admin/categories', categoryData);
    return response.data;
  }

  async updateCategory(id: string, categoryData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.put(`/api/admin/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/admin/categories/${id}`);
    return response.data;
  }

  async getActiveCategories(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> =
      await this.client.get('/api/admin/categories/active/list');
    return response.data;
  }

  // Tag management methods
  async getTags(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<any>>> =
      await this.client.get('/api/admin/tags', { params });
    return response.data;
  }

  async getTag(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.get(`/api/admin/tags/${id}`);
    return response.data;
  }

  async createTag(tagData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.post('/api/admin/tags', tagData);
    return response.data;
  }

  async updateTag(id: string, tagData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.put(`/api/admin/tags/${id}`, tagData);
    return response.data;
  }

  async deleteTag(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/admin/tags/${id}`);
    return response.data;
  }

  async getActiveTags(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> =
      await this.client.get('/api/admin/tags/active/list');
    return response.data;
  }

  // Variant management methods
  async getVariants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    productId?: string;
    unitId?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<any>>> =
      await this.client.get('/api/admin/variants', { params });
    return response.data;
  }

  async getVariant(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.get(`/api/admin/variants/${id}`);
    return response.data;
  }

  async createVariant(variantData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.post('/api/admin/variants', variantData);
    return response.data;
  }

  async updateVariant(id: string, variantData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> =
      await this.client.put(`/api/admin/variants/${id}`, variantData);
    return response.data;
  }

  async deleteVariant(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/admin/variants/${id}`);
    return response.data;
  }

  async updateVariantStock(id: string, stockData: { inStock: boolean }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.put(`/api/admin/variants/${id}/stock`, stockData);
    return response.data;
  }

  // Customer management methods
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Customer>>> =
      await this.client.get('/api/admin/customers', { params });
    return response.data;
  }

  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    const response: AxiosResponse<ApiResponse<Customer>> =
      await this.client.get(`/api/admin/customers/${id}`);
    return response.data;
  }

  async updateCustomer(id: string, customerData: any): Promise<ApiResponse<Customer>> {
    const response: AxiosResponse<ApiResponse<Customer>> =
      await this.client.put(`/api/admin/customers/${id}`, customerData);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/admin/customers/${id}`);
    return response.data;
  }

  // Utility method to set auth token
  setAuthToken(token: string): void {
    localStorage.setItem('admin-token', token);
  }

  // Utility method to get auth token
  getAuthToken(): string | null {
    return localStorage.getItem('admin-token');
  }

  // Utility method to clear auth token
  clearAuthToken(): void {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Settings management methods
  async getSettings(): Promise<ApiResponse<WebsiteSettings>> {
    const response: AxiosResponse<ApiResponse<WebsiteSettings>> =
      await this.client.get('/api/admin/settings');
    return response.data;
  }

  async updateSettings(settingsData: WebsiteSettingsUpdateRequest): Promise<ApiResponse<WebsiteSettings>> {
    const response: AxiosResponse<ApiResponse<WebsiteSettings>> =
      await this.client.put('/api/admin/settings', settingsData);
    return response.data;
  }

  // Review management methods
  async getReviews(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<any>>> =
      await this.client.get('/api/admin/reviews', { params });
    return response.data;
  }

  // SMTP settings management methods
  async getSmtpSettings(): Promise<ApiResponse<SmtpSettings | null>> {
    const response: AxiosResponse<ApiResponse<SmtpSettings | null>> =
      await this.client.get('/api/admin/smtp');
    return response.data;
  }

  async updateSmtpSettings(settingsData: SmtpSettingsUpdateRequest): Promise<ApiResponse<SmtpSettings>> {
    const response: AxiosResponse<ApiResponse<SmtpSettings>> =
      await this.client.post('/api/admin/smtp', settingsData);
    return response.data;
  }

  async testSmtpSettings(): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> =
        await this.client.post('/api/admin/smtp/test');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'Terjadi kesalahan saat menguji SMTP'
        };
      }
      return {
        success: false,
        message: 'Terjadi kesalahan saat menguji SMTP'
      };
    }
  }

  // Notification management methods
  async getNotifications(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> =
      await this.client.get('/api/admin/notifications');
    return response.data;
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response: AxiosResponse<ApiResponse<{ count: number }>> =
      await this.client.get('/api/admin/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.put(`/api/admin/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.put('/api/admin/notifications/mark-all-read');
    return response.data;
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/admin/notifications/${id}`);
    return response.data;
  }
}

export const adminApi = new AdminApiService();