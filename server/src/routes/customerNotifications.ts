import { Hono, Context } from "hono";
import { z } from "zod";
import { db } from "../db";
import { customerNotifications } from "../db/schema";
import { customerAuthMiddleware, CustomerAuthContext } from "../middleware/customerAuth";
import { eq, desc, and } from "drizzle-orm";
import { generateId } from "../utils/auth";

const customerNotificationsRouter = new Hono();

// GET /api/customer-notifications - Get all notifications for authenticated customer
customerNotificationsRouter.get("/", customerAuthMiddleware, async (c: Context) => {
  try {
    const customer = c.get('customer') as CustomerAuthContext['customer'];
    
    const notifications = await db
      .select({
        id: customerNotifications.id,
        type: customerNotifications.type,
        title: customerNotifications.title,
        message: customerNotifications.message,
        relatedId: customerNotifications.relatedId,
        isRead: customerNotifications.isRead,
        createdAt: customerNotifications.createdAt,
        updatedAt: customerNotifications.updatedAt,
      })
      .from(customerNotifications)
      .where(and(
        eq(customerNotifications.customerId, customer.customerId),
        eq(customerNotifications.customerId, customer.customerId)
      ))
      .orderBy(desc(customerNotifications.createdAt))
      .limit(50); // Limit to latest 50 notifications

    return c.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get customer notifications error:", error);
    return c.json({
      success: false,
      message: "Internal server error",
    }, 500);
  }
});

// GET /api/customer-notifications/unread-count - Get count of unread notifications
customerNotificationsRouter.get("/unread-count", customerAuthMiddleware, async (c: Context) => {
  try {
    const customer = c.get('customer') as CustomerAuthContext['customer'];
    
    const unreadCount = await db
      .select({ count: customerNotifications.id })
      .from(customerNotifications)
      .where(and(
        eq(customerNotifications.customerId, customer.customerId),
        eq(customerNotifications.isRead, false)
      ));

    return c.json({
      success: true,
      data: {
        count: unreadCount.length,
      },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return c.json({
      success: false,
      message: "Internal server error",
    }, 500);
  }
});

// PUT /api/customer-notifications/:id/read - Mark notification as read
customerNotificationsRouter.put("/:id/read", customerAuthMiddleware, async (c: Context) => {
  try {
    const customer = c.get('customer') as CustomerAuthContext['customer'];
    const notificationId = c.req.param("id");
    
    // First check if the notification belongs to the customer
    const notificationCheck = await db
      .select({ id: customerNotifications.id })
      .from(customerNotifications)
      .where(and(
        eq(customerNotifications.id, notificationId),
        eq(customerNotifications.customerId, customer.customerId)
      ));
    
    if (notificationCheck.length === 0) {
      return c.json({
        success: false,
        message: "Notification not found",
      }, 404);
    }
    
    await db
      .update(customerNotifications)
      .set({ 
        isRead: true,
        updatedAt: new Date()
      })
      .where(eq(customerNotifications.id, notificationId));

    return c.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return c.json({
      success: false,
      message: "Internal server error",
    }, 500);
  }
});

// PUT /api/customer-notifications/mark-all-read - Mark all notifications as read
customerNotificationsRouter.put("/mark-all-read", customerAuthMiddleware, async (c: Context) => {
  try {
    const customer = c.get('customer') as CustomerAuthContext['customer'];
    
    await db
      .update(customerNotifications)
      .set({ 
        isRead: true,
        updatedAt: new Date()
      })
      .where(and(
        eq(customerNotifications.customerId, customer.customerId),
        eq(customerNotifications.isRead, false)
      ));

    return c.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return c.json({
      success: false,
      message: "Internal server error",
    }, 500);
  }
});

// DELETE /api/customer-notifications/:id - Delete a notification
customerNotificationsRouter.delete("/:id", customerAuthMiddleware, async (c: Context) => {
  try {
    const customer = c.get('customer') as CustomerAuthContext['customer'];
    const notificationId = c.req.param("id");
    
    // First check if the notification belongs to the customer
    const notificationCheck = await db
      .select({ id: customerNotifications.id })
      .from(customerNotifications)
      .where(and(
        eq(customerNotifications.id, notificationId),
        eq(customerNotifications.customerId, customer.customerId)
      ));
    
    if (notificationCheck.length === 0) {
      return c.json({
        success: false,
        message: "Notification not found",
      }, 404);
    }
    
    await db
      .delete(customerNotifications)
      .where(eq(customerNotifications.id, notificationId));

    return c.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return c.json({
      success: false,
      message: "Internal server error",
    }, 500);
  }
});

// Helper function to create customer notifications (to be used by other routes)
export const createCustomerNotification = async (
  customerId: string,
  type: 'order_pending' | 'order_confirmed' | 'order_processing' | 'order_delivered' | 'order_cancelled' | 'payment_reminder' | 'promotion',
  title: string,
  message: string,
  relatedId?: string
) => {
  try {
    const notificationId = generateId();
    await db.insert(customerNotifications).values({
      id: notificationId,
      customerId,
      type,
      title,
      message,
      relatedId,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return notificationId;
  } catch (error) {
    console.error("Create customer notification error:", error);
    throw error;
  }
};

export default customerNotificationsRouter;