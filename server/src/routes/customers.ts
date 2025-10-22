import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { customers, customerSocialAccounts, orders, orderItems, customerAddresses, passwordResetTokens } from "../db/schema";
import { eq, and, desc, sql, ilike, gt } from "drizzle-orm";
import { generateId, hashPassword, verifyPassword, generateCustomerToken, generatePasswordResetToken } from "../utils/auth";

import { customerAuthMiddleware } from "../middleware/customerAuth";
import { authMiddleware } from "../middleware/auth";

const customersRouter = new Hono();

// Register schema
const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  whatsapp: z.string().optional(),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

// Update profile schema
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  whatsapp: z.string().optional(),
  address: z.string().max(1000).optional(),
  coordinates: z.string().max(100).optional(),
});

// Address schemas
const createAddressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50),
  recipientName: z.string().min(1, "Recipient name is required").max(255),
  phoneNumber: z.string().min(1, "Phone number is required").max(20),
  fullAddress: z.string().min(1, "Full address is required").max(1000),
  province: z.string().min(1, "Province is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  district: z.string().min(1, "District is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(10),
  coordinates: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

const updateAddressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50).optional(),
  recipientName: z.string().min(1, "Recipient name is required").max(255).optional(),
  phoneNumber: z.string().min(1, "Phone number is required").max(20).optional(),
  fullAddress: z.string().min(1, "Full address is required").max(1000).optional(),
  province: z.string().min(1, "Province is required").max(100).optional(),
  city: z.string().min(1, "City is required").max(100).optional(),
  district: z.string().min(1, "District is required").max(100).optional(),
  postalCode: z.string().min(1, "Postal code is required").max(10).optional(),
  coordinates: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

// Password reset schemas
const passwordResetSchema = z.object({
  email: z.string().email("Valid email is required"),
});

const passwordResetVerifySchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// POST /api/customers/register - Register new customer
customersRouter.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const data = registerSchema.parse(body);
    
    // Check if customer already exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.email, data.email))
      .limit(1);
    
    if (existingCustomer.length > 0) {
      return c.json({
        success: false,
        message: "Email already registered"
      }, 400);
    }
    
    // Hash password
    const passwordHash = await hashPassword(data.password);
    
    // Create new customer
    const newCustomer = {
      id: generateId(),
      name: data.name,
      email: data.email,
      passwordHash,
      whatsapp: data.whatsapp || null,
      provider: "email" as const,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(customers).values(newCustomer);
    
    // Create notification for admin
    try {
      const { createNotification } = await import("./notifications");
      await createNotification(
        'user_registration',
        'User Baru Terdaftar',
        `${data.name} (${data.email}) telah mendaftar sebagai pelanggan baru.`,
        newCustomer.id
      );
    } catch (error) {
      console.error("Failed to create registration notification:", error);
      // Don't fail the registration if notification creation fails
    }
    
    // Generate token
    const token = generateCustomerToken({
      customerId: newCustomer.id,
      email: newCustomer.email,
    });
    
    // Send welcome email to new customer
    try {
      const { sendWelcomeEmail } = await import("../utils/emailService");
      await sendWelcomeEmail(data.email, data.name);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't fail the registration if email sending fails
    }
    
    // Remove password hash from response
    const { passwordHash: _, ...customerResponse } = newCustomer;
    
    return c.json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        customer: customerResponse
      }
    });
    
  } catch (error) {
    console.error("Register error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/customers/login - Customer login
customersRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body);
    
    // Find customer by email
    const customerList = await db.select()
      .from(customers)
      .where(eq(customers.email, data.email))
      .limit(1);
    
    if (customerList.length === 0) {
      return c.json({
        success: false,
        message: "Invalid email or password"
      }, 401);
    }
    
    const customer = customerList[0];
    
    // Check if customer has password (social login users might not)
    if (!customer.passwordHash) {
      return c.json({
        success: false,
        message: "This account uses social login. Please login with Google or Facebook."
      }, 401);
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(data.password, customer.passwordHash);
    
    if (!isValidPassword) {
      return c.json({
        success: false,
        message: "Invalid email or password"
      }, 401);
    }
    
    // Generate token
    const token = generateCustomerToken({
      customerId: customer.id,
      email: customer.email,
    });
    
    // Remove password hash from response
    const { passwordHash: _, ...customerResponse } = customer;
    
    return c.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        customer: customerResponse
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/customers/logout - Customer logout
customersRouter.post("/logout", customerAuthMiddleware, async (c) => {
  return c.json({
    success: true,
    message: "Logout successful"
  });
});

// GET /api/customers/me - Get current customer info
customersRouter.get("/me", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    
    // Get customer info
    const customerList = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (customerList.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    const customer = customerList[0];
    
    // Get social accounts
    const socialAccounts = await db.select()
      .from(customerSocialAccounts)
      .where(eq(customerSocialAccounts.customerId, customerId));
    
    // Remove password hash from response
    const { passwordHash: _, ...customerResponse } = customer;
    
    return c.json({
      success: true,
      data: {
        ...customerResponse,
        socialAccounts
      }
    });
    
  } catch (error) {
    console.error("Get customer error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/customers/profile - Update customer profile
customersRouter.put("/profile", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const body = await c.req.json();
    const data = updateProfileSchema.parse(body);
    
    // Check if customer exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (existingCustomer.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    // Update customer
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
    
    await db.update(customers)
      .set(updateData)
      .where(eq(customers.id, customerId));
    
    // Get updated customer info
    const updatedCustomerList = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    const updatedCustomer = updatedCustomerList[0];
    
    // Remove password hash from response
    const { passwordHash: _, ...customerResponse } = updatedCustomer;
    
    return c.json({
      success: true,
      message: "Profile updated successfully",
      data: customerResponse
    });
    
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/customers/orders - Get customer's orders
customersRouter.get("/orders", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const status = c.req.query("status") || "";
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [eq(orders.customerId, customerId)];
    
    if (status) {
      whereConditions.push(eq(orders.status, status));
    }
    
    // Get orders
    const orderList = await db.select()
      .from(orders)
      .where(and(...whereConditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get order items for all orders
    const { products } = await import("../db/schema");
    const ordersWithItems = await Promise.all(
      orderList.map(async (order) => {
        // Get order items with product images
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          productVariantId: orderItems.productVariantId,
          productName: orderItems.productName,
          productVariantWeight: orderItems.productVariantWeight,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          notes: orderItems.notes,
          createdAt: orderItems.createdAt,
          productImageUrl: products.imageUrl,
        })
          .from(orderItems)
          .leftJoin(products, eq(products.id, orderItems.productId))
          .where(eq(orderItems.orderId, order.id))
          .orderBy(orderItems.createdAt);
        
        // Add full URL to product images
        const itemsWithFullImageUrls = items.map(item => ({
          ...item,
          productImageUrl: item.productImageUrl
            ? item.productImageUrl.startsWith('http')
              ? item.productImageUrl
              : `${c.req.url.split('/api')[0]}${item.productImageUrl}`
            : null
        }));
        
        return {
          ...order,
          orderItems: itemsWithFullImageUrls
        };
      })
    );
    
    // Get total count
    const totalCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(orders)
      .where(and(...whereConditions));
    
    return c.json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get customer orders error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/customers/orders/:id - Get specific order details
customersRouter.get("/orders/:id", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const orderId = c.req.param("id");
    
    // Get order with customer verification
    const orderList = await db.select()
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.customerId, customerId)
      ))
      .limit(1);
    
    if (orderList.length === 0) {
      return c.json({
        success: false,
        message: "Order not found"
      }, 404);
    }
    
    // Get order items with product images
    const { orderItems, products } = await import("../db/schema");
    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      productVariantId: orderItems.productVariantId,
      productName: orderItems.productName,
      productVariantWeight: orderItems.productVariantWeight,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      notes: orderItems.notes,
      createdAt: orderItems.createdAt,
      productImageUrl: products.imageUrl,
    })
      .from(orderItems)
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, orderId))
      .orderBy(orderItems.createdAt);
    
    // Add full URL to product images
    const itemsWithFullImageUrls = items.map(item => ({
      ...item,
      productImageUrl: item.productImageUrl
        ? `${c.req.url.split('/api')[0]}${item.productImageUrl}`
        : null
    }));
    
    return c.json({
      success: true,
      data: {
        ...orderList[0],
        orderItems: itemsWithFullImageUrls
      }
    });
    
  } catch (error) {
    console.error("Get customer order error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// Address endpoints
// GET /api/customers/addresses - Get customer's addresses
customersRouter.get("/addresses", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    
    const addressList = await db.select()
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customerId))
      .orderBy(desc(customerAddresses.isDefault), desc(customerAddresses.createdAt));
    
    return c.json({
      success: true,
      data: addressList
    });
    
  } catch (error) {
    console.error("Get customer addresses error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/customers/addresses/:id - Get specific address
customersRouter.get("/addresses/:id", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const addressId = c.req.param("id");
    
    const addressList = await db.select()
      .from(customerAddresses)
      .where(and(
        eq(customerAddresses.id, addressId),
        eq(customerAddresses.customerId, customerId)
      ))
      .limit(1);
    
    if (addressList.length === 0) {
      return c.json({
        success: false,
        message: "Address not found"
      }, 404);
    }
    
    return c.json({
      success: true,
      data: addressList[0]
    });
    
  } catch (error) {
    console.error("Get customer address error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/customers/addresses - Create new address
customersRouter.post("/addresses", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const body = await c.req.json();
    const data = createAddressSchema.parse(body);
    
    // If setting as default, unset other default addresses
    if (data.isDefault) {
      await db.update(customerAddresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(
          eq(customerAddresses.customerId, customerId),
          eq(customerAddresses.isDefault, true)
        ));
    }
    
    // Create new address
    const newAddress = {
      id: generateId(),
      customerId,
      label: data.label,
      recipientName: data.recipientName,
      phoneNumber: data.phoneNumber,
      fullAddress: data.fullAddress,
      province: data.province,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      coordinates: data.coordinates || null,
      isDefault: data.isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(customerAddresses).values(newAddress);
    
    return c.json({
      success: true,
      message: "Address created successfully",
      data: newAddress
    });
    
  } catch (error) {
    console.error("Create address error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/customers/addresses/:id - Update address
customersRouter.put("/addresses/:id", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const addressId = c.req.param("id");
    const body = await c.req.json();
    const data = updateAddressSchema.parse(body);
    
    // Check if address exists and belongs to customer
    const existingAddress = await db.select()
      .from(customerAddresses)
      .where(and(
        eq(customerAddresses.id, addressId),
        eq(customerAddresses.customerId, customerId)
      ))
      .limit(1);
    
    if (existingAddress.length === 0) {
      return c.json({
        success: false,
        message: "Address not found"
      }, 404);
    }
    
    // If setting as default, unset other default addresses
    if (data.isDefault) {
      await db.update(customerAddresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(
          eq(customerAddresses.customerId, customerId),
          eq(customerAddresses.isDefault, true),
          sql`${customerAddresses.id} != ${addressId}`
        ));
    }
    
    // Update address
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (data.label !== undefined) updateData.label = data.label;
    if (data.recipientName !== undefined) updateData.recipientName = data.recipientName;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.fullAddress !== undefined) updateData.fullAddress = data.fullAddress;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    
    await db.update(customerAddresses)
      .set(updateData)
      .where(eq(customerAddresses.id, addressId));
    
    // Get updated address
    const updatedAddressList = await db.select()
      .from(customerAddresses)
      .where(eq(customerAddresses.id, addressId))
      .limit(1);
    
    return c.json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddressList[0]
    });
    
  } catch (error) {
    console.error("Update address error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// DELETE /api/customers/addresses/:id - Delete address
customersRouter.delete("/addresses/:id", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const addressId = c.req.param("id");
    
    // Check if address exists and belongs to customer
    const existingAddress = await db.select()
      .from(customerAddresses)
      .where(and(
        eq(customerAddresses.id, addressId),
        eq(customerAddresses.customerId, customerId)
      ))
      .limit(1);
    
    if (existingAddress.length === 0) {
      return c.json({
        success: false,
        message: "Address not found"
      }, 404);
    }
    
    // Delete address
    await db.delete(customerAddresses)
      .where(eq(customerAddresses.id, addressId));
    
    return c.json({
      success: true,
      message: "Address deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete address error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PATCH /api/customers/addresses/:id/set-default - Set address as default
customersRouter.patch("/addresses/:id/set-default", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const addressId = c.req.param("id");
    
    // Check if address exists and belongs to customer
    const existingAddress = await db.select()
      .from(customerAddresses)
      .where(and(
        eq(customerAddresses.id, addressId),
        eq(customerAddresses.customerId, customerId)
      ))
      .limit(1);
    
    if (existingAddress.length === 0) {
      return c.json({
        success: false,
        message: "Address not found"
      }, 404);
    }
    
    // Unset all other default addresses
    await db.update(customerAddresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(
        eq(customerAddresses.customerId, customerId),
        eq(customerAddresses.isDefault, true)
      ));
    
    // Set this address as default
    await db.update(customerAddresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(customerAddresses.id, addressId));
    
    // Get updated address
    const updatedAddressList = await db.select()
      .from(customerAddresses)
      .where(eq(customerAddresses.id, addressId))
      .limit(1);
    
    return c.json({
      success: true,
      message: "Default address updated successfully",
      data: updatedAddressList[0]
    });
    
  } catch (error) {
    console.error("Set default address error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// Admin routes
// GET /api/admin/customers - Get all customers with pagination and search
customersRouter.get("/", authMiddleware, async (c) => {
  try {
    console.log("Admin customers endpoint called");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search") || "";
    
    console.log(`Fetching customers: page=${page}, limit=${limit}, search=${search}`);
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        sql`(LOWER(${customers.name}) LIKE ${'%' + search.toLowerCase() + '%'} OR LOWER(${customers.email}) LIKE ${'%' + search.toLowerCase() + '%'})`
      );
    }
    
    // Get customers
    const customerList = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      whatsapp: customers.whatsapp,
      address: customers.address,
      avatarUrl: customers.avatarUrl,
      provider: customers.provider,
      emailVerified: customers.emailVerified,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt
    })
      .from(customers)
      .where(whereConditions.length > 0 ? and(...whereConditions) : sql`1=1`)
      .orderBy(desc(customers.createdAt))
      .limit(limit)
      .offset(offset);
    
    console.log(`Found ${customerList.length} customers`);
    
    // Get total count
    const totalCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(customers)
      .where(whereConditions.length > 0 ? and(...whereConditions) : sql`1=1`);
    
    console.log(`Total customers: ${totalCount[0].count}`);
    
    const response = {
      success: true,
      data: {
        customers: customerList,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit)
        }
      }
    };
    
    console.log("Returning response:", JSON.stringify(response, null, 2));
    
    return c.json(response);
    
  } catch (error) {
    console.error("Get customers error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/customers/:id - Get specific customer
customersRouter.get("/:id", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("id");
    
    // Get customer info
    const customerList = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      whatsapp: customers.whatsapp,
      address: customers.address,
      coordinates: customers.coordinates,
      avatarUrl: customers.avatarUrl,
      provider: customers.provider,
      providerId: customers.providerId,
      emailVerified: customers.emailVerified,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt
    })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (customerList.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    const customer = customerList[0];
    
    // Get social accounts
    const socialAccounts = await db.select()
      .from(customerSocialAccounts)
      .where(eq(customerSocialAccounts.customerId, customerId));
    
    // Get customer's order count
    const orderCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(orders)
      .where(eq(orders.customerId, customerId));
    
    // Get customer's total spent
    const totalSpent = await db.select({ total: sql<number>`sum(total_amount)`.as('total') })
      .from(orders)
      .where(and(
        eq(orders.customerId, customerId),
        eq(orders.status, 'delivered')
      ));
    
    return c.json({
      success: true,
      data: {
        ...customer,
        socialAccounts,
        stats: {
          totalOrders: orderCount[0].count,
          totalSpent: totalSpent[0].total || 0
        }
      }
    });
    
  } catch (error) {
    console.error("Get customer error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/customers/:id - Update customer
customersRouter.put("/:id", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("id");
    const body = await c.req.json();
    const data = updateProfileSchema.parse(body);
    
    // Check if customer exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (existingCustomer.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    // Update customer
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.coordinates !== undefined) updateData.coordinates = data.coordinates;
    
    await db.update(customers)
      .set(updateData)
      .where(eq(customers.id, customerId));
    
    // Get updated customer info
    const updatedCustomerList = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      whatsapp: customers.whatsapp,
      address: customers.address,
      coordinates: customers.coordinates,
      avatarUrl: customers.avatarUrl,
      provider: customers.provider,
      providerId: customers.providerId,
      emailVerified: customers.emailVerified,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt
    })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    const updatedCustomer = updatedCustomerList[0];
    
    return c.json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer
    });
    
  } catch (error) {
    console.error("Update customer error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// DELETE /api/admin/customers/:id - Delete customer
customersRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("id");
    
    // Check if customer exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (existingCustomer.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    // Delete customer (cascade delete should handle related records)
    await db.delete(customers)
      .where(eq(customers.id, customerId));
    
    return c.json({
      success: true,
      message: "Customer deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete customer error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/customers/request-password-reset - Request password reset
customersRouter.post("/request-password-reset", async (c) => {
  try {
    const body = await c.req.json();
    const data = passwordResetSchema.parse(body);
    
    // Find customer by email
    const customerList = await db.select()
      .from(customers)
      .where(eq(customers.email, data.email))
      .limit(1);
    
    if (customerList.length === 0) {
      // Don't reveal if email exists or not for security
      return c.json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent."
      });
    }
    
    const customer = customerList[0];
    
    // Check if customer has password (social login users might not)
    if (!customer.passwordHash) {
      return c.json({
        success: false,
        message: "This account uses social login. Please login with Google or Facebook."
      }, 400);
    }
    
    // Invalidate any existing reset tokens for this customer
    await db.update(passwordResetTokens)
      .set({ isUsed: true })
      .where(and(
        eq(passwordResetTokens.customerId, customer.id),
        eq(passwordResetTokens.isUsed, false)
      ));
    
    // Generate new reset token
    const resetToken = generatePasswordResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
    
    // Create password reset token record
    const newResetToken = {
      id: generateId(),
      customerId: customer.id,
      token: resetToken,
      expiresAt,
      isUsed: false,
      createdAt: new Date(),
    };
    
    await db.insert(passwordResetTokens).values(newResetToken);
    
    // Import email service
    const { sendPasswordResetEmail } = await import("../utils/emailService");
    
    console.log('Attempting to send password reset email to:', customer.email);
    console.log('SMTP Configuration in request-password-reset:', {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER ? '***HIDDEN***' : 'NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM
    });
    
    // Send password reset email
    let emailSent = false;
    try {
      emailSent = await sendPasswordResetEmail(customer.email, resetToken);
      console.log('Password reset email sent result:', emailSent);
    } catch (emailError) {
      console.error('Error in sendPasswordResetEmail:', emailError);
      // Don't fail the request if email sending fails, just log it
    }
    
    if (!emailSent) {
      console.error('Failed to send password reset email');
      // Still return success to avoid revealing if email exists or not
    }
    
    return c.json({
      success: true,
      message: "If an account with this email exists, a password reset link has been sent."
    });
    
  } catch (error) {
    console.error("Request password reset error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// POST /api/customers/verify-password-reset - Verify password reset token and update password
customersRouter.post("/verify-password-reset", async (c) => {
  try {
    const body = await c.req.json();
    const data = passwordResetVerifySchema.parse(body);
    
    // Find valid reset token
    const tokenList = await db.select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, data.token),
        eq(passwordResetTokens.isUsed, false),
        gt(passwordResetTokens.expiresAt, new Date())
      ))
      .limit(1);
    
    if (tokenList.length === 0) {
      return c.json({
        success: false,
        message: "Invalid or expired reset token"
      }, 400);
    }
    
    const resetToken = tokenList[0];
    
    // Hash new password
    const passwordHash = await hashPassword(data.newPassword);
    
    // Update customer password
    await db.update(customers)
      .set({
        passwordHash,
        updatedAt: new Date()
      })
      .where(eq(customers.id, resetToken.customerId));
    
    // Mark token as used
    await db.update(passwordResetTokens)
      .set({ isUsed: true })
      .where(eq(passwordResetTokens.id, resetToken.id));
    
    return c.json({
      success: true,
      message: "Password has been reset successfully"
    });
    
  } catch (error) {
    console.error("Verify password reset error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/customers/change-password - Change password for authenticated customer
customersRouter.put("/change-password", customerAuthMiddleware, async (c) => {
  try {
    const { customerId } = (c as any).get("customer");
    const body = await c.req.json();
    const data = changePasswordSchema.parse(body);
    
    // Get customer info
    const customerList = await db.select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);
    
    if (customerList.length === 0) {
      return c.json({
        success: false,
        message: "Customer not found"
      }, 404);
    }
    
    const customer = customerList[0];
    
    // Check if customer has password (social login users might not)
    if (!customer.passwordHash) {
      return c.json({
        success: false,
        message: "This account uses social login. Password cannot be changed."
      }, 400);
    }
    
    // Verify current password
    const isValidPassword = await verifyPassword(data.currentPassword, customer.passwordHash);
    
    if (!isValidPassword) {
      return c.json({
        success: false,
        message: "Current password is incorrect"
      }, 400);
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword);
    
    // Update customer password
    await db.update(customers)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      })
      .where(eq(customers.id, customerId));
    
    return c.json({
      success: true,
      message: "Password changed successfully"
    });
    
  } catch (error) {
    console.error("Change password error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default customersRouter;