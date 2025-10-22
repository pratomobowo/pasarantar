import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { adminNotifications, customers, orders } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { generateId } from "../utils/auth";

const notificationsRouter = new Hono();

// GET /api/notifications - Get all notifications for admin
notificationsRouter.get("/", authMiddleware, async (c) => {
  try {
    const notifications = await db
      .select({
        id: adminNotifications.id,
        type: adminNotifications.type,
        title: adminNotifications.title,
        message: adminNotifications.message,
        relatedId: adminNotifications.relatedId,
        isRead: adminNotifications.isRead,
        createdAt: adminNotifications.createdAt,
        updatedAt: adminNotifications.updatedAt,
      })
      .from(adminNotifications)
      .orderBy(desc(adminNotifications.createdAt))
      .limit(50); // Limit to latest 50 notifications

    return c.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return c.json({
      success: false,
      message: "Internal server error",
    }, 500);
  }
});

// GET /api/notifications/unread-count - Get count of unread notifications
notificationsRouter.get("/unread-count", authMiddleware, async (c) => {
  try {
    const unreadCount = await db
      .select({ count: adminNotifications.id })
      .from(adminNotifications)
      .where(eq(adminNotifications.isRead, false));

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

// PUT /api/notifications/:id/read - Mark notification as read
notificationsRouter.put("/:id/read", authMiddleware, async (c) => {
  try {
    const notificationId = c.req.param("id");
    
    await db
      .update(adminNotifications)
      .set({ 
        isRead: true,
        updatedAt: new Date()
      })
      .where(eq(adminNotifications.id, notificationId));

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

// PUT /api/notifications/mark-all-read - Mark all notifications as read
notificationsRouter.put("/mark-all-read", authMiddleware, async (c) => {
  try {
    await db
      .update(adminNotifications)
      .set({ 
        isRead: true,
        updatedAt: new Date()
      })
      .where(eq(adminNotifications.isRead, false));

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

// DELETE /api/notifications/:id - Delete a notification
notificationsRouter.delete("/:id", authMiddleware, async (c) => {
  try {
    const notificationId = c.req.param("id");
    
    await db
      .delete(adminNotifications)
      .where(eq(adminNotifications.id, notificationId));

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

// Helper function to create notifications (to be used by other routes)
export const createNotification = async (
  type: 'user_registration' | 'new_order',
  title: string,
  message: string,
  relatedId?: string
) => {
  try {
    const notificationId = generateId();
    await db.insert(adminNotifications).values({
      id: notificationId,
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
    console.error("Create notification error:", error);
    throw error;
  }
};

export default notificationsRouter;