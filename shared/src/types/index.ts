export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  unitId: string;
  sku?: string;
  weight: string; // e.g., "250", "500", "1"
  price: number;
  originalPrice?: number; // For discounted items
  inStock: boolean;
  minOrderQuantity: number;
  barcode?: string;
  variantCode?: string;
  isActive: boolean;
  stockQuantity?: number;
  manageStock?: boolean;
  createdAt: Date;
  updatedAt: Date;
  unitName?: string; // e.g., "Gram", "Kilogram"
  unitAbbreviation?: string; // e.g., "g", "kg"
}

export interface ProductTag {
  id: string;
  productId: string;
  tagId: string;
  createdAt: Date;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  basePrice: number; // Base price for default variant
  description: string;
  imageUrl?: string;
  defaultVariantId?: string;
  rating: number; // Average rating 1-5
  reviewCount: number;
  isOnSale: boolean; // Whether product has discount
  discountPercentage?: number; // Discount percentage (e.g., 10 for 10% off)
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced product with relationships
export interface ProductWithRelations extends Product {
  category?: Category;
  variants: (ProductVariant & { unit?: Unit })[];
  tags: (ProductTag & { tag?: Tag })[];
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  note?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CustomerInfo {
  name: string;
  whatsapp: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  shippingMethod: 'express' | 'pickup';
  deliveryDay?: 'selasa' | 'kamis' | 'sabtu';
  paymentMethod: 'transfer' | 'cod';
  customerId?: string; // Optional customer ID for logged-in customers
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // Only present in server responses
  whatsapp?: string;
  address?: string;
  coordinates?: string;
  avatarUrl?: string;
  provider: 'email' | 'google' | 'facebook';
  providerId?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSocialAccount {
  id: string;
  customerId: string;
  provider: string;
  providerUserId: string;
  providerData?: string; // JSON string
  createdAt: Date;
}

export interface CustomerRegisterRequest {
  name: string;
  email: string;
  password: string;
  whatsapp?: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerLoginResponse {
  token: string;
  customer: Omit<Customer, 'passwordHash' | 'createdAt' | 'updatedAt'>;
}

export interface CustomerUpdateRequest {
  name?: string;
  whatsapp?: string;
  address?: string;
  coordinates?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerifyRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerWhatsapp: string;
  customerAddress: string;
  customerCoordinates?: string;
  shippingMethod: 'express' | 'pickup';
  deliveryDay?: 'selasa' | 'kamis' | 'sabtu';
  paymentMethod: 'transfer' | 'cod';
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productVariantId: string;
  productName: string;
  productVariantWeight: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  productImageUrl?: string;
}

export interface OrderWithItems extends Order {
  orderItems: OrderItem[];
}

export interface ApiResponse<T = any> {
  message: string;
  success: boolean;
  data?: T;
}

// Admin types
export interface Admin {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: Omit<Admin, 'createdAt'>;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Social auth types
export interface SocialAuthRequest {
  provider: 'google' | 'facebook';
  code: string;
  state?: string;
}

export interface SocialAuthResponse {
  token: string;
  customer: Omit<Customer, 'passwordHash' | 'createdAt' | 'updatedAt'>;
  isNewUser: boolean;
}

export interface LinkSocialAccountRequest {
  provider: 'google' | 'facebook';
  code: string;
  state?: string;
}

export interface CustomerWithSocialAccounts extends Customer {
  socialAccounts?: CustomerSocialAccount[];
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string; // e.g., "Rumah", "Kantor", "Apartemen"
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  coordinates?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressRequest {
  label: string;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  coordinates?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  label?: string;
  recipientName?: string;
  phoneNumber?: string;
  fullAddress?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  coordinates?: string;
  isDefault?: boolean;
}

// Website settings types
export interface WebsiteSettings {
  id: string;
  siteName: string;
  siteDescription?: string;
  logoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  hideSiteNameAndDescription?: boolean;
  businessHours?: BusinessHours;
  socialMediaLinks?: SocialMediaLinks;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface WebsiteSettingsUpdateRequest {
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  hideSiteNameAndDescription?: boolean;
  businessHours?: BusinessHours;
  socialMediaLinks?: SocialMediaLinks;
}

// SMTP settings types
export interface SmtpSettings {
  id: string;
  host: string;
  port: number;
  username: string;
  password?: string; // Optional when returning to client for security
  fromEmail: string;
  fromName: string;
  secure: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmtpSettingsCreateRequest {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName?: string;
  secure: boolean;
  enabled: boolean;
}

export interface SmtpSettingsUpdateRequest {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  secure?: boolean;
  enabled?: boolean;
}

// Customer notification types
export interface CustomerNotification {
  id: string;
  customerId: string;
  type: 'order_pending' | 'order_confirmed' | 'order_processing' | 'order_delivered' | 'order_cancelled' | 'payment_reminder' | 'promotion';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerNotificationType = 'order_pending' | 'order_confirmed' | 'order_processing' | 'order_delivered' | 'order_cancelled' | 'payment_reminder' | 'promotion';