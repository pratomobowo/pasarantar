import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { orders, orderItems, products, productVariants } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { generateId } from "../utils/auth";
import { authMiddleware } from "../middleware/auth";

const ordersRouter = new Hono();

// Order creation schema
const createOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerWhatsapp: z.string().min(1, "Customer WhatsApp is required"),
  customerAddress: z.string().min(1, "Customer address is required"),
  customerCoordinates: z.string().optional(),
  shippingMethod: z.enum(["express", "pickup"]),
  deliveryDay: z.enum(["selasa", "kamis", "sabtu"]).optional(),
  paymentMethod: z.enum(["transfer", "cod"]),
  customerId: z.string().optional(), // Optional customer ID for logged-in customers
  items: z.array(z.object({
    productId: z.string(),
    productVariantId: z.string(),
    quantity: z.number().min(1),
    notes: z.string().optional(),
  })).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

// Status update schema
const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "delivered", "cancelled"]),
});

// Helper function to generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${year}${month}${day}${random}`;
};

// POST /api/orders - Create new order
ordersRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const data = createOrderSchema.parse(body);
    const orderId = generateId();
    const orderNumber = generateOrderNumber();
    
    // Calculate totals
    let subtotal = 0;
    const orderItemsToInsert = [];
    
    for (const item of data.items) {
      // Get product and variant info
      const productInfo = await db.select({
        productName: products.name,
        variantWeight: productVariants.weight,
        variantPrice: productVariants.price,
      })
        .from(products)
        .leftJoin(productVariants, eq(productVariants.id, item.productVariantId))
        .where(eq(products.id, item.productId))
        .limit(1);
      
      if (productInfo.length === 0) {
        return c.json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        }, 404);
      }
      
      const { productName, variantWeight, variantPrice } = productInfo[0];
      const totalPrice = variantPrice * item.quantity;
      subtotal += totalPrice;
      
      orderItemsToInsert.push({
        id: generateId(),
        orderId,
        productId: item.productId,
        productVariantId: item.productVariantId,
        productName,
        productVariantWeight: variantWeight,
        quantity: item.quantity,
        unitPrice: variantPrice,
        totalPrice,
        notes: item.notes,
        createdAt: new Date(),
      });
    }
    
    // Calculate shipping cost
    const shippingCost = data.shippingMethod === "express" ? 15000 : 0;
    const totalAmount = subtotal + shippingCost;
    
    // Create order
    const newOrder = {
      id: orderId,
      orderNumber,
      customerId: data.customerId || null, // Include customer ID if provided
      customerName: data.customerName,
      customerWhatsapp: data.customerWhatsapp,
      customerAddress: data.customerAddress,
      customerCoordinates: data.customerCoordinates || null,
      shippingMethod: data.shippingMethod,
      deliveryDay: data.deliveryDay || null,
      paymentMethod: data.paymentMethod,
      subtotal,
      shippingCost,
      totalAmount,
      status: "pending",
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(orders).values(newOrder);
    await db.insert(orderItems).values(orderItemsToInsert);
    
    // Create notification for admin
    try {
      const { createNotification } = await import("./notifications");
      await createNotification(
        'new_order',
        'Pesanan Baru Masuk',
        `Pesanan #${orderNumber} dari ${data.customerName} sebesar Rp ${totalAmount.toLocaleString('id-ID')}`,
        orderId
      );
    } catch (error) {
      console.error("Failed to create order notification:", error);
      // Don't fail the order creation if notification creation fails
    }
    
    // Create notification for customer if they have an account
    if (newOrder.customerId) {
      try {
        const { createCustomerNotification } = await import("./customerNotifications");
        await createCustomerNotification(
          newOrder.customerId,
          'order_pending',
          'Pesanan Diterima',
          `Pesanan #${orderNumber} telah diterima. Kami akan segera mengkonfirmasi pesanan Anda.`,
          orderId
        );
      } catch (error) {
        console.error("Failed to create customer notification:", error);
        // Don't fail the order creation if notification creation fails
      }
    }
    
    // Send order confirmation email
    try {
      // If customer ID is provided, get customer email for sending confirmation
      if (newOrder.customerId) {
        const { customers } = await import("../db/schema");
        const customerList = await db.select({ email: customers.email })
          .from(customers)
          .where(eq(customers.id, newOrder.customerId))
          .limit(1);
        
        if (customerList.length > 0) {
          const { sendOrderConfirmationEmail } = await import("../utils/emailService");
          await sendOrderConfirmationEmail(
            customerList[0].email,
            newOrder.orderNumber,
            orderItemsToInsert.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice
            })),
            newOrder.totalAmount
          );
        }
      }
      // Note: For guest customers, we don't have an email address in the current schema
      // If needed, consider extending the schema to include customerEmail in orders table
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
      // Don't fail the order creation if email sending fails
    }
    
    return c.json({
      success: true,
      message: "Order created successfully",
      data: {
        ...newOrder,
        orderItems: orderItemsToInsert,
      }
    });
    
  } catch (error) {
    console.error("Create order error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/orders - Get all orders with pagination
ordersRouter.get("/", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const status = c.req.query("status") || "";
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (status) {
      whereConditions.push(eq(orders.status, status));
    }
    
    const whereClause = whereConditions.length > 0 ? sql.join(whereConditions, sql` AND `) : sql`1=1`;
    
    // Get orders
    const orderList = await db.select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const totalCount = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(orders)
      .where(whereClause);
    
    return c.json({
      success: true,
      data: {
        orders: orderList,
        pagination: {
          page,
          limit,
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Get orders error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/orders/analytics - Get order analytics data
ordersRouter.get("/analytics", async (c) => {
  try {
    const period = c.req.query("period") || "month";
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Get total orders and revenue
    const totalOrdersResult = await db.select({ count: sql<number>`count(*)`.as('count') })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${startDate}`);
    
    const totalRevenueResult = await db.select({
      total: sql<number>`sum(${orders.totalAmount})`.as('total')
    })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${startDate} AND ${orders.status} = 'delivered'`);
    
    // Get order status breakdown
    const statusBreakdown = await db.select({
      status: orders.status,
      count: sql<number>`count(*)`.as('count')
    })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${startDate}`)
      .groupBy(orders.status);
    
    // Get payment method breakdown
    const paymentBreakdown = await db.select({
      method: orders.paymentMethod,
      count: sql<number>`count(*)`.as('count')
    })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${startDate}`)
      .groupBy(orders.paymentMethod);
    
    // Get shipping method breakdown
    const shippingBreakdown = await db.select({
      method: orders.shippingMethod,
      count: sql<number>`count(*)`.as('count')
    })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${startDate}`)
      .groupBy(orders.shippingMethod);
    
    // Get daily revenue for the last 7 days
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const dayRevenue = await db.select({
        revenue: sql<number>`sum(${orders.totalAmount})`.as('revenue'),
        orders: sql<number>`count(*)`.as('orders')
      })
        .from(orders)
        .where(sql`${orders.createdAt} >= ${startOfDay} AND ${orders.createdAt} < ${endOfDay} AND ${orders.status} = 'delivered'`);
      
      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue[0]?.revenue || 0,
        orders: dayRevenue[0]?.orders || 0
      });
    }
    
    // Get top products
    const topProducts = await db.select({
      productName: orderItems.productName,
      quantity: sql<number>`sum(${orderItems.quantity})`.as('quantity'),
      revenue: sql<number>`sum(${orderItems.totalPrice})`.as('revenue')
    })
      .from(orderItems)
      .leftJoin(orders, eq(orders.id, orderItems.orderId))
      .where(sql`${orders.createdAt} >= ${startDate} AND ${orders.status} = 'delivered'`)
      .groupBy(orderItems.productName)
      .orderBy(sql`sum(${orderItems.totalPrice}) desc`)
      .limit(5);
    
    // Get monthly trend (last 4 months)
    const monthlyTrend = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthData = await db.select({
        revenue: sql<number>`sum(${orders.totalAmount})`.as('revenue'),
        orders: sql<number>`count(*)`.as('orders')
      })
        .from(orders)
        .where(sql`${orders.createdAt} >= ${startOfMonth} AND ${orders.createdAt} < ${endOfMonth} AND ${orders.status} = 'delivered'`);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyTrend.push({
        month: monthNames[date.getMonth()],
        revenue: monthData[0]?.revenue || 0,
        orders: monthData[0]?.orders || 0
      });
    }
    
    // Get total customers
    const totalCustomersResult = await db.select({ count: sql<number>`count(distinct ${orders.customerId})`.as('count') })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${startDate}`);
    
    // Calculate average order value
    const totalOrders = totalOrdersResult[0]?.count || 0;
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Format data for response
    const totalOrdersCount = totalOrdersResult[0]?.count || 0;
    const totalRevenueAmount = totalRevenueResult[0]?.total || 0;
    const totalCustomersCount = totalCustomersResult[0]?.count || 0;
    
    const orderStatusBreakdown = statusBreakdown.map(item => ({
      status: item.status,
      count: item.count,
      percentage: totalOrdersCount > 0 ? Math.round((item.count / totalOrdersCount) * 100 * 10) / 10 : 0
    }));
    
    const paymentMethodBreakdown = paymentBreakdown.map(item => ({
      method: item.method,
      count: item.count,
      percentage: totalOrdersCount > 0 ? Math.round((item.count / totalOrdersCount) * 100 * 10) / 10 : 0
    }));
    
    const shippingMethodBreakdown = shippingBreakdown.map(item => ({
      method: item.method,
      count: item.count,
      percentage: totalOrdersCount > 0 ? Math.round((item.count / totalOrdersCount) * 100 * 10) / 10 : 0
    }));
    
    const topProductsFormatted = topProducts.map(item => ({
      name: item.productName,
      quantity: item.quantity,
      revenue: item.revenue
    }));
    
    return c.json({
      success: true,
      data: {
        totalOrders: totalOrdersCount,
        totalRevenue: totalRevenueAmount,
        averageOrderValue: Math.round(averageOrderValue),
        totalCustomers: totalCustomersCount,
        orderStatusBreakdown,
        paymentMethodBreakdown,
        shippingMethodBreakdown,
        dailyRevenue,
        topProducts: topProductsFormatted,
        monthlyTrend
      }
    });
    
  } catch (error) {
    console.error("Get analytics error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// GET /api/admin/orders/:id - Get single order with items
ordersRouter.get("/:id", async (c) => {
  try {
    const orderId = c.req.param("id");
    
    // Get order
    const orderList = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    
    if (orderList.length === 0) {
      return c.json({
        success: false,
        message: "Order not found"
      }, 404);
    }
    
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
    console.error("Get order error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/admin/orders/:id/status - Update order status
ordersRouter.put("/:id/status", async (c) => {
  try {
    const orderId = c.req.param("id");
    const body = await c.req.json();
    const { status } = updateStatusSchema.parse(body);
    
    // Check if order exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    
    if (existingOrder.length === 0) {
      return c.json({
        success: false,
        message: "Order not found"
      }, 404);
    }
    
    // Update order status
    await db.update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
    
    // Create customer notification if order has a customer ID
    const order = existingOrder[0];
    if (order.customerId) {
      try {
        const { createCustomerNotification } = await import("./customerNotifications");
        
        let notificationType: 'order_confirmed' | 'order_processing' | 'order_delivered' | 'order_cancelled';
        let title: string;
        let message: string;
        
        switch (status) {
          case 'confirmed':
            notificationType = 'order_confirmed';
            title = 'Pesanan Dikonfirmasi';
            message = `Pesanan #${order.orderNumber} telah dikonfirmasi. Kami akan segera memproses pesanan Anda.`;
            break;
          case 'processing':
            notificationType = 'order_processing';
            title = 'Pesanan Diproses';
            message = `Pesanan #${order.orderNumber} sedang diproses. Pesanan Anda akan segera dikirim.`;
            break;
          case 'delivered':
            notificationType = 'order_delivered';
            title = 'Pesanan Selesai';
            message = `Pesanan #${order.orderNumber} telah selesai. Terima kasih telah berbelanja di toko kami!`;
            break;
          case 'cancelled':
            notificationType = 'order_cancelled';
            title = 'Pesanan Dibatalkan';
            message = `Pesanan #${order.orderNumber} telah dibatalkan. Hubungi kami untuk informasi lebih lanjut.`;
            break;
          default:
            // Don't create notification for 'pending' status
            throw new Error('No notification needed for pending status');
        }
        
        await createCustomerNotification(
          order.customerId,
          notificationType,
          title,
          message,
          orderId
        );
      } catch (error) {
        console.error("Failed to create customer notification:", error);
        // Don't fail the status update if notification creation fails
      }
    }
    
    return c.json({
      success: true,
      message: "Order status updated successfully",
      data: {
        id: orderId,
        status,
        updatedAt: new Date(),
      }
    });
    
  } catch (error) {
    console.error("Update order status error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// PUT /api/customer/orders/:id/cancel - Cancel order (customer only)
ordersRouter.put("/:id/cancel", async (c) => {
  try {
    const orderId = c.req.param("id");
    
    // Check if order exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    
    if (existingOrder.length === 0) {
      return c.json({
        success: false,
        message: "Order not found"
      }, 404);
    }
    
    const order = existingOrder[0];
    
    // Check if order can be cancelled (only pending orders can be cancelled)
    if (order.status !== 'pending') {
      return c.json({
        success: false,
        message: "Order cannot be cancelled. Only pending orders can be cancelled."
      }, 400);
    }
    
    // Update order status to cancelled
    await db.update(orders)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
    
    // Create customer notification for order cancellation
    if (order.customerId) {
      try {
        const { createCustomerNotification } = await import("./customerNotifications");
        
        await createCustomerNotification(
          order.customerId,
          'order_cancelled',
          'Pesanan Dibatalkan',
          `Pesanan #${order.orderNumber} telah dibatalkan sesuai permintaan Anda.`,
          orderId
        );
      } catch (error) {
        console.error("Failed to create customer notification:", error);
        // Don't fail the cancellation if notification creation fails
      }
    }
    
    // Create notification for admin about order cancellation
    try {
      const { createNotification } = await import("./notifications");
      await createNotification(
        'new_order',
        'Pesanan Dibatalkan Pelanggan',
        `Pesanan #${order.orderNumber} telah dibatalkan oleh pelanggan`,
        orderId
      );
    } catch (error) {
      console.error("Failed to create admin notification:", error);
      // Don't fail the cancellation if notification creation fails
    }
    
    return c.json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        id: orderId,
        status: 'cancelled',
        updatedAt: new Date(),
      }
    });
    
  } catch (error) {
    console.error("Cancel order error:", error);
    return c.json({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default ordersRouter;