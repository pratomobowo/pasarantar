import { mysqlTable, varchar, int, float, boolean, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

// Admin users table
export const admins = mysqlTable("admins", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Customers table
export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }), // Nullable for social login users
  whatsapp: varchar("whatsapp", { length: 20 }),
  address: varchar("address", { length: 1000 }),
  coordinates: varchar("coordinates", { length: 100 }),
  avatarUrl: varchar("avatar_url", { length: 255 }), // For social profile pictures
  provider: mysqlEnum("provider", ["email", "google", "facebook"]).default("email"),
  providerId: varchar("provider_id", { length: 255 }), // Social provider user ID
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Customer social accounts table (for multiple social links)
export const customerSocialAccounts = mysqlTable("customer_social_accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  customerId: varchar("customer_id", { length: 255 }).notNull().references(() => customers.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(), // 'google', 'facebook'
  providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
  providerData: varchar("provider_data", { length: 1000 }), // Store additional provider data as JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: varchar("id", { length: 255 }).primaryKey(),
  customerId: varchar("customer_id", { length: 255 }).notNull().references(() => customers.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer addresses table
export const customerAddresses = mysqlTable("customer_addresses", {
  id: varchar("id", { length: 255 }).primaryKey(),
  customerId: varchar("customer_id", { length: 255 }).notNull().references(() => customers.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 50 }).notNull(), // e.g., "Rumah", "Kantor", "Apartemen"
  recipientName: varchar("recipient_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  fullAddress: varchar("full_address", { length: 1000 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 10 }).notNull(),
  coordinates: varchar("coordinates", { length: 100 }),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Categories table
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  imageUrl: varchar("image_url", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Units table
export const units = mysqlTable("units", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  abbreviation: varchar("abbreviation", { length: 50 }).notNull(),
  description: varchar("description", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Tags table
export const tags = mysqlTable("tags", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(),
  description: varchar("description", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Products table
export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  categoryId: varchar("category_id", { length: 255 }).notNull().references(() => categories.id),
  basePrice: float("base_price").notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  defaultVariantId: varchar("default_variant_id", { length: 255 }),
  rating: float("rating").default(0).notNull(),
  reviewCount: int("review_count").default(0).notNull(),
  isOnSale: boolean("is_on_sale").default(false).notNull(),
  discountPercentage: float("discount_percentage"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Enhanced Product variants table
export const productVariants = mysqlTable("product_variants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  productId: varchar("product_id", { length: 255 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  unitId: varchar("unit_id", { length: 255 }).notNull().references(() => units.id),
  sku: varchar("sku", { length: 255 }).unique(),
  weight: varchar("weight", { length: 50 }).notNull(),
  price: float("price").notNull(),
  originalPrice: float("original_price"),
  inStock: boolean("in_stock").default(true).notNull(),
  minOrderQuantity: int("min_order_quantity").default(1).notNull(),
  barcode: varchar("barcode", { length: 255 }),
  variantCode: varchar("variant_code", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  stockQuantity: int("stock_quantity").default(0).notNull(),
  manageStock: boolean("manage_stock").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Product tags junction table
export const productTags = mysqlTable("product_tags", {
  id: varchar("id", { length: 255 }).primaryKey(),
  productId: varchar("product_id", { length: 255 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  tagId: varchar("tag_id", { length: 255 }).notNull().references(() => tags.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product reviews table
export const productReviews = mysqlTable("product_reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  productId: varchar("product_id", { length: 255 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id", { length: 255 }).references(() => customers.id, { onDelete: "cascade" }),
  orderId: varchar("order_id", { length: 255 }).references(() => orders.id, { onDelete: "cascade" }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  rating: int("rating").notNull(),
  comment: varchar("comment", { length: 1000 }).notNull(),
  date: varchar("date", { length: 255 }).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Orders table
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: varchar("customer_id", { length: 255 }), // Foreign key to customers table
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerWhatsapp: varchar("customer_whatsapp", { length: 20 }).notNull(),
  customerAddress: varchar("customer_address", { length: 1000 }).notNull(),
  customerCoordinates: varchar("customer_coordinates", { length: 100 }),
  shippingMethod: varchar("shipping_method", { length: 20 }).notNull(), // 'express' | 'pickup'
  deliveryDay: varchar("delivery_day", { length: 20 }), // 'selasa' | 'kamis' | 'sabtu'
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // 'transfer' | 'cod'
  subtotal: float("subtotal").notNull(),
  shippingCost: float("shipping_cost").notNull().default(0),
  totalAmount: float("total_amount").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled'
  notes: varchar("notes", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Order items table
export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 255 }).primaryKey(),
  orderId: varchar("order_id", { length: 255 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 255 }).notNull().references(() => products.id),
  productVariantId: varchar("product_variant_id", { length: 255 }).notNull().references(() => productVariants.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productVariantWeight: varchar("product_variant_weight", { length: 50 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: float("unit_price").notNull(),
  totalPrice: float("total_price").notNull(),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for TypeScript
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type CustomerSocialAccount = typeof customerSocialAccounts.$inferSelect;
export type NewCustomerSocialAccount = typeof customerSocialAccounts.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type CustomerAddress = typeof customerAddresses.$inferSelect;
export type NewCustomerAddress = typeof customerAddresses.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type ProductTag = typeof productTags.$inferSelect;
export type NewProductTag = typeof productTags.$inferInsert;

export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// Website settings table
export const websiteSettings = mysqlTable("website_settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  siteDescription: varchar("site_description", { length: 1000 }),
  logoUrl: varchar("logo_url", { length: 255 }),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactAddress: varchar("contact_address", { length: 1000 }),
  hideSiteNameAndDescription: boolean("hide_site_name_and_description").default(false).notNull(),
  businessHours: varchar("business_hours", { length: 1000 }), // JSON string
  socialMediaLinks: varchar("social_media_links", { length: 1000 }), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WebsiteSettings = typeof websiteSettings.$inferSelect;
export type NewWebsiteSettings = typeof websiteSettings.$inferInsert;

// Admin notifications table
export const adminNotifications = mysqlTable("admin_notifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'user_registration' | 'new_order'
  title: varchar("title", { length: 255 }).notNull(),
  message: varchar("message", { length: 1000 }).notNull(),
  relatedId: varchar("related_id", { length: 255 }), // ID of related entity (customer_id, order_id)
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AdminNotification = typeof adminNotifications.$inferSelect;
export type NewAdminNotification = typeof adminNotifications.$inferInsert;

// Customer notifications table
export const customerNotifications = mysqlTable("customer_notifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  customerId: varchar("customer_id", { length: 255 }).notNull().references(() => customers.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'order_pending' | 'order_confirmed' | 'order_processing' | 'order_delivered' | 'order_cancelled' | 'payment_reminder' | 'promotion'
  title: varchar("title", { length: 255 }).notNull(),
  message: varchar("message", { length: 1000 }).notNull(),
  relatedId: varchar("related_id", { length: 255 }), // ID of related entity (order_id, product_id)
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CustomerNotification = typeof customerNotifications.$inferSelect;
export type NewCustomerNotification = typeof customerNotifications.$inferInsert;